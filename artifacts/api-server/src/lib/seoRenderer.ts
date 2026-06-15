/**
 * seoRenderer.ts
 *
 * Server-side metadata injection for the classifieds SPA.
 *
 * Flow:
 *  1. Express catch-all calls renderWithMeta(req.path)
 *  2. We load the built index.html from classifieds/dist/
 *  3. We query the DB for route-specific title / description / canonical
 *     (respecting any admin-configured seo_* setting overrides)
 *  4. We replace the placeholder meta tags in the HTML with real values
 *  5. Return the modified HTML — View Source now matches Inspect Element
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { pool } from "@workspace/db";
import { logger } from "./logger.js";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MetaTags {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  robots: string;
  siteName: string;
}

// ─── Settings cache (1 min TTL) ───────────────────────────────────────────────

let _settingsCache: Record<string, string> | null = null;
let _settingsCacheAt = 0;
const SETTINGS_TTL_MS = 60_000;

async function getSettings(): Promise<Record<string, string>> {
  const now = Date.now();
  if (_settingsCache && now - _settingsCacheAt < SETTINGS_TTL_MS) {
    return _settingsCache;
  }
  try {
    const r = await pool.query("SELECT key, value FROM ec_settings");
    const out: Record<string, string> = {};
    for (const row of r.rows) out[row.key] = row.value ?? "";
    _settingsCache = out;
    _settingsCacheAt = now;
    return out;
  } catch (err) {
    logger.warn({ err }, "seoRenderer: failed to load settings, using cache");
    return _settingsCache ?? {};
  }
}

export function invalidateSettingsCache(): void {
  _settingsCache = null;
  _settingsCacheAt = 0;
}

// ─── index.html cache (invalidated on deploy) ─────────────────────────────────

let _htmlCache: string | null = null;

function loadIndexHtml(): string | null {
  if (_htmlCache) return _htmlCache;
  for (const p of getDistCandidates("index.html")) {
    if (existsSync(p)) {
      _htmlCache = readFileSync(p, "utf-8");
      return _htmlCache;
    }
  }
  return null;
}

export function invalidateHtmlCache(): void {
  _htmlCache = null;
}

// ─── Dist path resolution ─────────────────────────────────────────────────────
// Resolution strategy (most-to-least reliable):
//
//  1. Relative to __dirname (esbuild injects globalThis.__dirname as the
//     directory of the *running bundle file*).
//     - Replit dev:  <workspace>/artifacts/api-server/dist  → ../../classifieds/dist ✓
//     - Railway:     /app/artifacts/api-server/dist         → ../../classifieds/dist ✓
//
//  2-4. process.cwd() fallbacks for edge cases (running ts-node, Jest, etc.)

function getDistCandidates(file = ""): string[] {
  const suffix = file ? `/${file}` : "";
  // __dirname is injected by esbuild banner (globalThis.__dirname)
  const dir: string = (globalThis as Record<string, unknown>)["__dirname"] as string ?? "";
  return [
    // Primary: relative to the bundle's own directory (always correct)
    ...(dir ? [resolve(dir, `../../classifieds/dist${suffix}`)] : []),
    // Fallbacks: relative to process.cwd()
    resolve(process.cwd(), `../classifieds/dist${suffix}`),
    resolve(process.cwd(), `artifacts/classifieds/dist${suffix}`),
    resolve(process.cwd(), `../../artifacts/classifieds/dist${suffix}`),
  ];
}

export function distExists(): boolean {
  return getDistCandidates().some(existsSync);
}

export function getDistDir(): string {
  for (const p of getDistCandidates()) {
    if (existsSync(p)) return p;
  }
  return getDistCandidates()[0];
}

// ─── HTML injection helpers ───────────────────────────────────────────────────

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function injectMetaTags(html: string, m: MetaTags): string {
  let out = html;
  const t   = escHtml(m.title);
  const d   = escAttr(m.description);
  const c   = escAttr(m.canonical);
  const img = escAttr(m.ogImage);
  const r   = escAttr(m.robots);

  // <title>
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${t}</title>`);

  // meta description
  out = out.replace(
    /<meta\s+name="description"[^>]*>/i,
    `<meta name="description" content="${d}" />`,
  );

  // robots
  out = out.replace(
    /<meta\s+name="robots"[^>]*>/i,
    `<meta name="robots" content="${r}" />`,
  );

  // canonical
  out = out.replace(
    /<link\s+rel="canonical"[^>]*>/i,
    `<link rel="canonical" href="${c}" />`,
  );

  // Open Graph
  out = out.replace(/<meta\s+property="og:title"[^>]*>/i,       `<meta property="og:title" content="${t}" />`);
  out = out.replace(/<meta\s+property="og:description"[^>]*>/i,  `<meta property="og:description" content="${d}" />`);
  out = out.replace(/<meta\s+property="og:url"[^>]*>/i,          `<meta property="og:url" content="${c}" />`);
  out = out.replace(/<meta\s+property="og:site_name"[^>]*>/i,    `<meta property="og:site_name" content="${escHtml(m.siteName)}" />`);
  if (img) {
    out = out.replace(/<meta\s+property="og:image"[^>]*>/i,      `<meta property="og:image" content="${img}" />`);
  }

  // Twitter Card
  out = out.replace(/<meta\s+name="twitter:title"[^>]*>/i,       `<meta name="twitter:title" content="${t}" />`);
  out = out.replace(/<meta\s+name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${d}" />`);
  if (img) {
    out = out.replace(/<meta\s+name="twitter:image"[^>]*>/i,     `<meta name="twitter:image" content="${img}" />`);
  }

  return out;
}

// ─── Route → MetaTags ─────────────────────────────────────────────────────────

const PRIVATE_PREFIXES = ["/admin", "/dashboard", "/login", "/register"];

async function resolveMetaForPath(
  path: string,
  settings: Record<string, string>,
): Promise<MetaTags> {
  const siteName = settings["site_name"] || "EliteEscorts";
  const siteUrl  = (settings["site_url"] || "").replace(/\/$/, "");
  const ogImage  = settings["og_image_url"] || "";

  const isPrivate = PRIVATE_PREFIXES.some(
    (pfx) => path === pfx || path.startsWith(pfx + "/"),
  );
  const robots    = isPrivate ? "noindex, nofollow" : "index, follow";
  const canonical = path === "/" ? `${siteUrl}/` : `${siteUrl}${path}`;

  // Admin-configurable SEO key overrides stored in ec_settings
  const ovTitle = (key: string) => settings[`seo_${key}_title`] || "";
  const ovDesc  = (key: string) => settings[`seo_${key}_desc`]  || "";

  const mk = (base: string, key?: string): string =>
    (key ? ovTitle(key) : "") || base;
  const md = (base: string, key?: string): string =>
    (key ? ovDesc(key) : "") || base;

  const meta = (title: string, description: string): MetaTags => ({
    title, description, canonical, ogImage, robots, siteName,
  });

  // ── / (Home) ────────────────────────────────────────────────────────────
  if (path === "/") {
    return meta(
      `${mk("Verified Escort Profiles in Tamil Nadu", "home")} | ${siteName}`,
      md(
        "Browse 100% verified independent escort profiles across Tamil Nadu. Chennai, Coimbatore and all major cities. Safe, discreet and trusted.",
        "home",
      ),
    );
  }

  // ── /escorts ────────────────────────────────────────────────────────────
  if (path === "/escorts") {
    return meta(
      `Browse All Escorts | ${siteName}`,
      `Browse all verified independent escort listings across Tamil Nadu on ${siteName}.`,
    );
  }

  // ── /escorts/:area_slug/:profile_slug ────────────────────────────────────
  const profileMatch = path.match(/^\/escorts\/([^/]+)\/([^/]+)$/);
  if (profileMatch) {
    const profileSlug = profileMatch[2];
    try {
      const r = await pool.query(
        `SELECT p.title, p.name, p.age, p.services,
                l.area, l.city, l.state
         FROM ec_profiles p
         JOIN ec_locations l ON p.location_id = l.id
         WHERE p.slug = $1 AND p.status = 'approved'
         LIMIT 1`,
        [profileSlug],
      );
      if (r.rows.length > 0) {
        const p    = r.rows[0];
        const svcs: string[] = Array.isArray(p.services)
          ? p.services
          : JSON.parse(p.services || "[]");
        return meta(
          `${p.title} – ${p.area}, ${p.city} | ${siteName}`,
          `${p.name}${p.age ? `, ${p.age} yrs,` : ""} independent escort in ${p.area}, ${p.city}, ${p.state}. Services: ${svcs.slice(0, 5).join(", ")}. Contact directly.`,
        );
      }
    } catch (err) {
      logger.warn({ err }, `seoRenderer: profile query failed for "${profileSlug}"`);
    }
  }

  // ── /escorts/:slug (city or area) ────────────────────────────────────────
  const locMatch = path.match(/^\/escorts\/([^/]+)$/);
  if (locMatch) {
    const slug = locMatch[1];
    try {
      const cityR = await pool.query(
        `SELECT DISTINCT city, city_slug, state
         FROM ec_locations WHERE city_slug = $1 LIMIT 1`,
        [slug],
      );
      if (cityR.rows.length > 0) {
        const c   = cityR.rows[0];
        const key = `city_${slug}`;
        return meta(
          `${mk(`Escorts in ${c.city}, ${c.state}`, key)} | ${siteName}`,
          md(
            `Browse verified escort listings in ${c.city}, ${c.state}. Find independent escorts near you. All profiles manually approved.`,
            key,
          ),
        );
      }

      const areaR = await pool.query(
        `SELECT area, area_slug, city, city_slug, state
         FROM ec_locations WHERE area_slug = $1 LIMIT 1`,
        [slug],
      );
      if (areaR.rows.length > 0) {
        const a   = areaR.rows[0];
        const key = `area_${slug}`;
        const cnt = await pool.query(
          `SELECT COUNT(*) AS n
           FROM ec_profiles p
           JOIN ec_locations l ON p.location_id = l.id
           WHERE l.area_slug = $1 AND p.status = 'approved'`,
          [slug],
        );
        const n = parseInt(cnt.rows[0]?.n || "0", 10);
        return meta(
          `${mk(`Escorts in ${a.area}, ${a.city}`, key)} | ${siteName}`,
          md(
            `${n}+ verified escort profiles in ${a.area}, ${a.city}, ${a.state}. Call or WhatsApp directly.`,
            key,
          ),
        );
      }
    } catch (err) {
      logger.warn({ err }, `seoRenderer: location query failed for "${slug}"`);
    }
  }

  // ── /:state_slug ─────────────────────────────────────────────────────────
  // Must be a single-segment path that isn't a known app route or private prefix
  const isKnownRoute =
    isPrivate ||
    path.startsWith("/escorts") ||
    path.startsWith("/api") ||
    path.includes(".");

  if (!isKnownRoute && /^\/[^/]+$/.test(path)) {
    const stateSlug = path.slice(1);
    try {
      const sr = await pool.query(
        `SELECT DISTINCT state FROM ec_locations WHERE state_slug = $1 LIMIT 1`,
        [stateSlug],
      );
      if (sr.rows.length > 0) {
        const stateName = sr.rows[0].state as string;
        const key       = `state_${stateSlug}`;
        const citiesR   = await pool.query(
          `SELECT DISTINCT city FROM ec_locations WHERE state_slug = $1 ORDER BY city`,
          [stateSlug],
        );
        const cityList = (citiesR.rows as any[]).map((r) => r.city).join(", ");
        return meta(
          `${mk(`Escorts in ${stateName} – Browse by City`, key)} | ${siteName}`,
          md(
            `Find verified escort listings across all cities in ${stateName}. Browse escorts in ${cityList}.`,
            key,
          ),
        );
      }
    } catch (err) {
      logger.warn({ err }, `seoRenderer: state query failed for "${stateSlug}"`);
    }
  }

  // ── Private pages / fallback ──────────────────────────────────────────────
  return meta(
    siteName,
    "Browse 100% verified independent escort profiles across Tamil Nadu. Chennai, Coimbatore and all major cities. Safe, discreet and trusted.",
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the built index.html with page-specific metadata injected into
 * <head>, ready to send as an HTTP response.
 *
 * Returns null if the dist directory hasn't been built yet (dev mode).
 */
export async function renderWithMeta(reqPath: string): Promise<string | null> {
  const html = loadIndexHtml();
  if (!html) return null;

  const path     = reqPath.split("?")[0].replace(/\/+$/, "") || "/";
  const settings = await getSettings();
  const meta     = await resolveMetaForPath(path, settings);

  return injectMetaTags(html, meta);
}
