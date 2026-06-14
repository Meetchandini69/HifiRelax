import { Router } from "express";
import { pool } from "@workspace/db";
import { requireAuth, requireAdmin, type AuthRequest } from "./middleware.js";
import bcrypt from "bcryptjs";
import { writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from "fs";
import { resolve } from "path";

const router = Router();

async function getSetting(key: string): Promise<string> {
  const r = await pool.query("SELECT value FROM ec_settings WHERE key=$1", [key]);
  return r.rows[0]?.value ?? "";
}

async function getAllSettings(): Promise<Record<string, string>> {
  const r = await pool.query("SELECT key, value FROM ec_settings");
  const out: Record<string, string> = {};
  r.rows.forEach((row: any) => { out[row.key] = row.value; });
  return out;
}

async function setSetting(key: string, value: string) {
  await pool.query(
    `INSERT INTO ec_settings (key, value, updated_at) VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW()`,
    [key, value]
  );
}

// Public: get non-sensitive settings (for frontend)
router.get("/public", async (_req, res) => {
  try {
    const settings = await getAllSettings();
    // Only expose safe keys
    const safe = [
      "site_name","site_tagline","site_url","header_logo_text","header_phone","header_announcement",
      "footer_about","footer_copyright","footer_links","footer_contact_email",
      "theme_color","og_image_url","watermark_text","gsc_meta",
    ];
    // Also expose all seo_* keys
    const out: Record<string, string> = {};
    safe.forEach(k => { if (settings[k] !== undefined) out[k] = settings[k]; });
    Object.keys(settings).forEach(k => { if (k.startsWith("seo_")) out[k] = settings[k]; });
    res.json(out);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: get all settings
router.get("/", requireAdmin as any, async (_req, res) => {
  try {
    res.json(await getAllSettings());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: bulk update settings
router.put("/", requireAdmin as any, async (req, res) => {
  try {
    const updates = req.body as Record<string, string>;
    for (const [key, value] of Object.entries(updates)) {
      await setSetting(key, value ?? "");
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: update own profile (email/password)
router.put("/profile", requireAdmin as any, async (req: AuthRequest, res) => {
  const { name, email, password, current_password } = req.body;
  try {
    const userQ = await pool.query("SELECT * FROM ec_users WHERE id=$1", [req.user!.id]);
    if (userQ.rows.length === 0) return res.status(404).json({ error: "User not found" });
    const user = userQ.rows[0];

    if (password) {
      const ok = await bcrypt.compare(current_password || "", user.password);
      if (!ok) return res.status(400).json({ error: "Current password is incorrect" });
      const hashed = await bcrypt.hash(password, 10);
      await pool.query("UPDATE ec_users SET name=$1, email=$2, password=$3 WHERE id=$4",
        [name || user.name, email || user.email, hashed, user.id]);
    } else {
      await pool.query("UPDATE ec_users SET name=$1, email=$2 WHERE id=$3",
        [name || user.name, email || user.email, user.id]);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: list all users
router.get("/users", requireAdmin as any, async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.status, u.created_at,
              COUNT(p.id) as profile_count
       FROM ec_users u
       LEFT JOIN ec_profiles p ON p.user_id = u.id
       GROUP BY u.id ORDER BY u.created_at DESC`
    );
    res.json(r.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: update user status (active/paused)
router.put("/users/:id/status", requireAdmin as any, async (req, res) => {
  const { status } = req.body;
  if (!["active","paused"].includes(status)) return res.status(400).json({ error: "Invalid status" });
  try {
    await pool.query("UPDATE ec_users SET status=$1 WHERE id=$2", [status, req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: delete user
router.delete("/users/:id", requireAdmin as any, async (req: AuthRequest, res) => {
  if (String(req.user!.id) === req.params.id) return res.status(400).json({ error: "Cannot delete your own account" });
  try {
    await pool.query("DELETE FROM ec_profiles WHERE user_id=$1", [req.params.id]);
    await pool.query("DELETE FROM ec_users WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: resolve path to classifieds public folder
function getPublicDir(): string {
  // When running: cd artifacts/api-server && node ...
  // process.cwd() = /path/to/project/artifacts/api-server
  // ../classifieds/public = /path/to/project/artifacts/classifieds/public
  return resolve(process.cwd(), "../classifieds/public");
}

// Admin: get SEO files content
router.get("/seo-files", requireAdmin as any, async (_req, res) => {
  try {
    const keys = ["sitemap_xml", "sitemap_html", "gsc_filename", "gsc_content", "gsc_meta"];
    const r = await pool.query(
      `SELECT key, value FROM ec_settings WHERE key = ANY($1)`,
      [keys]
    );
    const out: Record<string, string> = {};
    r.rows.forEach((row: any) => { out[row.key] = row.value; });
    res.json(out);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: save SEO files content — writes to DB + public folder
router.post("/seo-files", requireAdmin as any, async (req, res) => {
  const { sitemap_xml, sitemap_html, gsc_filename, gsc_content, gsc_meta } = req.body as Record<string, string>;
  try {
    const publicDir = getPublicDir();
    if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

    // Save to DB
    const entries: [string, string][] = [
      ["sitemap_xml", sitemap_xml ?? ""],
      ["sitemap_html", sitemap_html ?? ""],
      ["gsc_filename", gsc_filename ?? ""],
      ["gsc_content", gsc_content ?? ""],
      ["gsc_meta", gsc_meta ?? ""],
    ];
    for (const [key, value] of entries) {
      await setSetting(key, value);
    }

    // Write sitemap.xml
    if (sitemap_xml?.trim()) {
      writeFileSync(resolve(publicDir, "sitemap.xml"), sitemap_xml, "utf-8");
    }

    // Write sitemap.html
    if (sitemap_html?.trim()) {
      writeFileSync(resolve(publicDir, "sitemap.html"), sitemap_html, "utf-8");
    }

    // Remove old GSC file(s) before writing new one
    if (existsSync(publicDir)) {
      readdirSync(publicDir)
        .filter(f => f.startsWith("google") && f.endsWith(".html"))
        .forEach(f => unlinkSync(resolve(publicDir, f)));
    }

    // Write GSC verification file
    if (gsc_filename?.trim() && gsc_content?.trim()) {
      const safeName = gsc_filename.trim().replace(/[^a-zA-Z0-9.\-_]/g, "");
      writeFileSync(resolve(publicDir, safeName), gsc_content, "utf-8");
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: generate sitemap XML + HTML from live DB data
router.get("/generate-sitemap", requireAdmin as any, async (_req, res) => {
  try {
    const siteUrl = (await getSetting("site_url")).replace(/\/$/, "") || "https://yourdomain.com";

    // Fetch all locations
    const locsResult = await pool.query(
      `SELECT DISTINCT state, city, area, state_slug, city_slug, area_slug FROM ec_locations WHERE state_slug IS NOT NULL ORDER BY state, city, area`
    );
    const locations: any[] = locsResult.rows;

    // Fetch all approved profiles
    const profsResult = await pool.query(
      `SELECT p.slug, l.area_slug FROM ec_profiles p
       LEFT JOIN ec_locations l ON p.location_id = l.id
       WHERE p.status = 'approved' AND p.slug IS NOT NULL AND l.area_slug IS NOT NULL`
    );
    const profiles: any[] = profsResult.rows;

    // Deduplicate state/city slugs
    const states  = [...new Map(locations.map(l => [l.state_slug,  l])).values()];
    const cities  = [...new Map(locations.map(l => [l.city_slug,   l])).values()];
    const areas   = [...new Map(locations.map(l => [l.area_slug,   l])).values()];

    const today = new Date().toISOString().split("T")[0];

    // Build URL entries array: [url, priority, changefreq]
    const urlEntries: [string, string, string][] = [
      [`${siteUrl}/`, "1.0", "daily"],
      ...states.map(s  => [`${siteUrl}/${s.state_slug}`,          "0.9", "weekly"] as [string, string, string]),
      ...cities.map(c  => [`${siteUrl}/escorts/${c.city_slug}`,   "0.8", "weekly"] as [string, string, string]),
      ...areas.map(a   => [`${siteUrl}/escorts/${a.area_slug}`,   "0.7", "weekly"] as [string, string, string]),
      ...profiles.map(p => [`${siteUrl}/escorts/${p.area_slug}/${p.slug}`, "0.6", "monthly"] as [string, string, string]),
    ];

    // XML sitemap
    const xmlUrls = urlEntries.map(([url, priority, changefreq]) =>
      `  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
    ).join("\n");
    const sitemap_xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      `${xmlUrls}\n` +
      `</urlset>`;

    // HTML sitemap
    const stateLinks  = states.map(s  => `      <li><a href="${siteUrl}/${s.state_slug}">${s.state}</a></li>`).join("\n");
    const cityLinks   = cities.map(c  => `      <li><a href="${siteUrl}/escorts/${c.city_slug}">${c.city}</a></li>`).join("\n");
    const areaLinks   = areas.map(a   => `      <li><a href="${siteUrl}/escorts/${a.area_slug}">${a.area} (${a.city})</a></li>`).join("\n");
    const profileLinks = profiles.map(p => `      <li><a href="${siteUrl}/escorts/${p.area_slug}/${p.slug}">${p.slug}</a></li>`).join("\n");

    const sitemap_html =
      `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><title>Sitemap</title></head>\n<body>\n` +
      `<h1>Sitemap — ${siteUrl}</h1>\n` +
      `<h2>Home</h2>\n<ul>\n      <li><a href="${siteUrl}/">Home</a></li>\n</ul>\n` +
      (states.length  ? `<h2>States (${states.length})</h2>\n<ul>\n${stateLinks}\n</ul>\n`    : "") +
      (cities.length  ? `<h2>Cities (${cities.length})</h2>\n<ul>\n${cityLinks}\n</ul>\n`    : "") +
      (areas.length   ? `<h2>Areas (${areas.length})</h2>\n<ul>\n${areaLinks}\n</ul>\n`      : "") +
      (profiles.length ? `<h2>Profiles (${profiles.length})</h2>\n<ul>\n${profileLinks}\n</ul>\n` : "") +
      `</body>\n</html>`;

    res.json({
      sitemap_xml,
      sitemap_html,
      stats: {
        states:   states.length,
        cities:   cities.length,
        areas:    areas.length,
        profiles: profiles.length,
        total:    urlEntries.length,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export { router as settingsRouter };
