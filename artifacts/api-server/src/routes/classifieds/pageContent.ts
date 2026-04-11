import { Router } from "express";
import { pool } from "@workspace/db";
import { requireAuth, requireAdmin } from "./middleware.js";

export const pageContentRouter = Router();

// ── Public: get content for a single page key ────────────────────────────────
pageContentRouter.get("/", async (req, res) => {
  const { page_key } = req.query as { page_key: string };
  if (!page_key) return res.json(null);
  const r = await pool.query(
    `SELECT * FROM ec_page_content WHERE page_key=$1`,
    [page_key]
  );
  res.json(r.rows[0] || null);
});

// ── Admin: list all page-content records ────────────────────────────────────
pageContentRouter.get("/admin/list", requireAuth, requireAdmin, async (_req, res) => {
  const r = await pool.query(
    `SELECT * FROM ec_page_content ORDER BY page_type, page_name`
  );
  res.json(r.rows);
});

// ── Admin: get all known pages (derived from locations + fixed) w/ content status
pageContentRouter.get("/admin/all-pages", requireAuth, requireAdmin, async (_req, res) => {
  const locs = await pool.query(
    `SELECT DISTINCT state, state_slug, city, city_slug, area, area_slug FROM ec_locations ORDER BY state, city, area`
  );
  const existing = await pool.query(`SELECT page_key, content_heading, faq_json FROM ec_page_content`);
  const contentMap = new Map(existing.rows.map((r: any) => [r.page_key, r]));

  const pages: any[] = [];

  // Fixed: all listings
  const lKey = "listings_all";
  pages.push({
    page_key: lKey, page_type: "listings", page_name: "All Escorts (Browse Page)",
    slug_ref: "", has_content: contentMap.has(lKey),
    content_heading: contentMap.get(lKey)?.content_heading || null,
    faq_count: (contentMap.get(lKey)?.faq_json || []).length,
  });

  // States
  const seenStates = new Set<string>();
  for (const l of locs.rows) {
    if (!seenStates.has(l.state_slug)) {
      seenStates.add(l.state_slug);
      const key = `state_${l.state_slug}`;
      pages.push({
        page_key: key, page_type: "state", page_name: `${l.state} (State Page)`,
        slug_ref: l.state_slug, has_content: contentMap.has(key),
        content_heading: contentMap.get(key)?.content_heading || null,
        faq_count: (contentMap.get(key)?.faq_json || []).length,
      });
    }
  }

  // Cities
  const seenCities = new Set<string>();
  for (const l of locs.rows) {
    if (!seenCities.has(l.city_slug)) {
      seenCities.add(l.city_slug);
      const key = `city_${l.city_slug}`;
      pages.push({
        page_key: key, page_type: "city", page_name: `${l.city} (City Page)`,
        slug_ref: l.city_slug, has_content: contentMap.has(key),
        content_heading: contentMap.get(key)?.content_heading || null,
        faq_count: (contentMap.get(key)?.faq_json || []).length,
      });
    }
  }

  // Areas
  for (const l of locs.rows) {
    const key = `area_${l.area_slug}`;
    pages.push({
      page_key: key, page_type: "area", page_name: `${l.area}, ${l.city} (Area Page)`,
      slug_ref: l.area_slug, has_content: contentMap.has(key),
      content_heading: contentMap.get(key)?.content_heading || null,
      faq_count: (contentMap.get(key)?.faq_json || []).length,
    });
  }

  res.json(pages);
});

// ── Admin: upsert page content ───────────────────────────────────────────────
pageContentRouter.post("/admin/upsert", requireAuth, requireAdmin, async (req, res) => {
  const { page_key, page_type, page_name, slug_ref, content_heading, content_html, faq_json } = req.body;
  if (!page_key) return res.status(400).json({ error: "page_key required" });

  const r = await pool.query(
    `INSERT INTO ec_page_content (page_key, page_type, page_name, slug_ref, content_heading, content_html, faq_json, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
     ON CONFLICT (page_key) DO UPDATE SET
       page_type=EXCLUDED.page_type, page_name=EXCLUDED.page_name, slug_ref=EXCLUDED.slug_ref,
       content_heading=EXCLUDED.content_heading, content_html=EXCLUDED.content_html,
       faq_json=EXCLUDED.faq_json, updated_at=NOW()
     RETURNING *`,
    [page_key, page_type || "area", page_name || page_key, slug_ref || null,
     content_heading || null, content_html || null, JSON.stringify(faq_json || [])]
  );
  res.json(r.rows[0]);
});

// ── Admin: delete page content ───────────────────────────────────────────────
pageContentRouter.delete("/admin/:id", requireAuth, requireAdmin, async (req, res) => {
  await pool.query(`DELETE FROM ec_page_content WHERE id=$1`, [req.params.id]);
  res.json({ ok: true });
});
