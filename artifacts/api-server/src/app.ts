import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { resolve } from "path";
import router from "./routes";
import { robotsRouter } from "./routes/robots.js";
import { logger } from "./lib/logger";
import { distExists, getDistDir, getPublicSiteUrl, renderWithMeta } from "./lib/seoRenderer.js";
import { generateSitemaps } from "./lib/sitemap.js";

const app: Express = express();

app.use(cors({ origin: true, credentials: true }));

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check — useful for Cloudflare / reverse proxy monitoring
app.get("/health", (_req, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

app.use("/api", router);
app.use(robotsRouter);

import { pool } from "@workspace/db";

app.get("/sitemap.xml", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT key, value FROM ec_settings WHERE key IN ('sitemap_xml', 'sitemap_mode')"
    );
    const settings = Object.fromEntries(result.rows.map((row: { key: string; value: string }) => [row.key, row.value]));
    const savedSitemap = settings.sitemap_xml || "";
    const legacyGenerated = !settings.sitemap_mode && /<changefreq>[\s\S]*<priority>/i.test(savedSitemap);

    const sitemap = savedSitemap.trim() && settings.sitemap_mode !== "auto" && !legacyGenerated
      ? savedSitemap
      : (await generateSitemaps(await getPublicSiteUrl())).sitemap_xml;
    res.set("Cache-Control", "public, max-age=300").type("application/xml").send(sitemap);
  } catch (err) {
    logger.error({ err }, "Failed to generate sitemap.xml");
    res.status(503).type("text/plain").send("Sitemap temporarily unavailable");
  }
});

app.get("/sitemap.html", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT key, value FROM ec_settings WHERE key IN ('sitemap_html', 'sitemap_mode')"
    );
    const settings = Object.fromEntries(result.rows.map((row: { key: string; value: string }) => [row.key, row.value]));
    const savedSitemap = settings.sitemap_html || "";
    const legacyGenerated = !settings.sitemap_mode && /<changefreq>[\s\S]*<priority>/i.test(settings.sitemap_xml || "");

    const sitemap = savedSitemap.trim() && settings.sitemap_mode !== "auto" && !legacyGenerated
      ? savedSitemap
      : (await generateSitemaps(await getPublicSiteUrl())).sitemap_html;
    res.set("Cache-Control", "public, max-age=300").type("text/html").send(sitemap);
  } catch (err) {
    logger.error({ err }, "Failed to generate sitemap.html");
    res.status(503).type("text/plain").send("Sitemap temporarily unavailable");
  }
});

// ─── Serve SEO files (sitemap, GSC verification) from classifieds/public ──────
const publicDir = resolve(process.cwd(), "../classifieds/public");
app.use(express.static(publicDir, {
  setHeaders(res, filePath) {
    // Cache sitemaps for 1 hour
    if (/\.(xml|html)$/i.test(filePath)) {
      res.setHeader("Cache-Control", "public, max-age=3600");
    }
  },
}));

// ─── Serve built frontend with SSR metadata (production only) ─────────────────
//
// When `artifacts/classifieds/dist/` exists (i.e. after `pnpm run build`),
// Express serves the SPA and injects per-route metadata into index.html
// BEFORE sending it to the client.  This makes View Source == Inspect Element
// for every title / description / canonical / OG / Twitter tag.
//
// In local dev (no dist/) the Vite dev server on port 5000 handles the
// frontend, so this block is skipped automatically.
// ─────────────────────────────────────────────────────────────────────────────

if (distExists()) {
  const dir = getDistDir();
  logger.info({ dir }, "Serving static frontend with SSR metadata");

  // Static assets (JS/CSS/images) — Vite filenames contain content hashes,
  // so we can cache them at the Cloudflare edge indefinitely.
  app.use(
    express.static(dir, {
      index: false, // never auto-serve index.html — we inject meta first
      setHeaders(res, filePath) {
        if (/\.(js|css|woff2?|ttf|eot|svg|png|jpe?g|gif|webp|ico|map)$/i.test(filePath)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    }),
  );

  // Catch-all HTML handler — injects SSR metadata then serves index.html.
  //
  // Using app.use() (instead of app.get("/*splat")) because Express 5's
  // path-to-regexp v8 does not reliably match the bare root path "/" with
  // named wildcards.  app.use() with no path prefix matches every request
  // that reaches this point (i.e. anything NOT already handled by /api or
  // static assets above).
  //
  // Requests for asset files (any path ending in a file extension) get a
  // 404 — they should have been served by express.static above.
  app.use(async (req, res, next) => {
    // Only intercept GET requests
    if (req.method !== "GET") { next(); return; }

    // Pass asset-looking paths through to the default 404 handler
    if (/\.[a-z0-9]{1,8}$/i.test(req.path)) { next(); return; }

    try {
      const rendered = await renderWithMeta(req.path);
      if (!rendered) {
        res.status(503).send("Frontend not available");
        return;
      }

      // Cache-Control: no-store — Cloudflare must NOT cache HTML.
      // Each response contains route-specific metadata; caching it at the
      // edge would serve the wrong title/description on other URLs.
      res
        .status(rendered.statusCode)
        .setHeader("Content-Type", "text/html; charset=utf-8")
        .setHeader("Cache-Control", "no-store")
        .setHeader("X-Robots-Tag", rendered.robots)
        .send(rendered.html);
    } catch (err) {
      logger.error({ err }, "SSR render error");
      next(err);
    }
  });
}

export default app;
