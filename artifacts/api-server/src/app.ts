import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { resolve } from "path";
import router from "./routes";
import { logger } from "./lib/logger";
import { distExists, getDistDir, renderWithMeta } from "./lib/seoRenderer.js";

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

import { pool } from "@workspace/db";

app.get("/sitemap.xml", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT value FROM ec_settings WHERE key = 'sitemap_xml'"
    );

    res.type("application/xml");
    res.send(result.rows[0]?.value || "");
  } catch (err) {
    res.status(500).send("Failed to load sitemap");
  }
});

app.get("/sitemap.html", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT value FROM ec_settings WHERE key = 'sitemap_html'"
    );

    res.type("text/html");
    res.send(result.rows[0]?.value || "");
  } catch (err) {
    res.status(500).send("Failed to load sitemap");
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
      const html = await renderWithMeta(req.path);
      if (!html) {
        res.status(503).send("Frontend not available");
        return;
      }

      // Cache-Control: no-store — Cloudflare must NOT cache HTML.
      // Each response contains route-specific metadata; caching it at the
      // edge would serve the wrong title/description on other URLs.
      res
        .status(200)
        .setHeader("Content-Type", "text/html; charset=utf-8")
        .setHeader("Cache-Control", "no-store")
        .setHeader("X-Robots-Tag", "all")
        .send(html);
    } catch (err) {
      logger.error({ err }, "SSR render error");
      next(err);
    }
  });
}

export default app;
