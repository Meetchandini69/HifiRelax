import { Router } from "express";
import { pool } from "@workspace/db";
import { requireAdmin } from "./middleware.js";

const router = Router();

// ── Public: all locations (flat list, for dropdowns) ────────────────────────
router.get("/", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM ec_locations ORDER BY state, city, area"
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Public: all unique states ────────────────────────────────────────────────
router.get("/states", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT l.state, l.state_slug,
        COUNT(DISTINCT l.city) as city_count,
        COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'approved') as listing_count
      FROM ec_locations l
      LEFT JOIN ec_profiles p ON p.location_id = l.id
      GROUP BY l.state, l.state_slug
      ORDER BY l.state
    `);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Public: state page (silo) ────────────────────────────────────────────────
router.get("/state/:state_slug", async (req, res) => {
  const { state_slug } = req.params;
  try {
    const cities = await pool.query(`
      SELECT l.city, l.city_slug, l.state, l.state_slug,
        COUNT(DISTINCT l.area) as area_count,
        COUNT(p.id) FILTER (WHERE p.status = 'approved') as listing_count
      FROM ec_locations l
      LEFT JOIN ec_profiles p ON p.location_id = l.id
      WHERE l.state_slug = $1
      GROUP BY l.city, l.city_slug, l.state, l.state_slug
      ORDER BY l.city
    `, [state_slug]);
    if (cities.rows.length === 0) return res.status(404).json({ error: "State not found" });
    const { state, state_slug: slug } = cities.rows[0];
    res.json({ state, state_slug: slug, cities: cities.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Public: city page (silo) ─────────────────────────────────────────────────
router.get("/city/:city_slug", async (req, res) => {
  const { city_slug } = req.params;
  try {
    const areas = await pool.query(`
      SELECT l.*,
        COUNT(p.id) FILTER (WHERE p.status = 'approved') as listing_count
      FROM ec_locations l
      LEFT JOIN ec_profiles p ON p.location_id = l.id
      WHERE l.city_slug = $1
      GROUP BY l.id
      ORDER BY l.area
    `, [city_slug]);
    if (areas.rows.length === 0) return res.status(404).json({ error: "City not found" });
    const first = areas.rows[0];
    // recent profiles for this city
    const profiles = await pool.query(`
      SELECT p.id, p.title, p.slug, p.age, p.photos, p.services,
             l.area, l.area_slug, l.city, l.city_slug, l.state, l.state_slug, l.url_base
      FROM ec_profiles p
      JOIN ec_locations l ON p.location_id = l.id
      WHERE l.city_slug = $1 AND p.status = 'approved'
      ORDER BY p.updated_at DESC
      LIMIT 8
    `, [city_slug]);
    res.json({
      city: first.city, city_slug: first.city_slug,
      state: first.state, state_slug: first.state_slug,
      areas: areas.rows,
      recent_profiles: profiles.rows,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Public: area page (silo) ─────────────────────────────────────────────────
router.get("/area/:area_slug", async (req, res) => {
  const { area_slug } = req.params;

  try {
    // Location
    const loc = await pool.query(
      `SELECT *
       FROM ec_locations
       WHERE area_slug = $1
       LIMIT 1`,
      [area_slug]
    );

    if (loc.rows.length === 0) {
      return res.status(404).json({ error: "Area not found" });
    }

    const area = loc.rows[0];

    // Listing Count
    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS listing_count
       FROM ec_profiles
       WHERE location_id = $1
       AND status='approved'`,
      [area.id]
    );

    const listingCount = countResult.rows[0].listing_count;

    // Settings
    const settingsResult = await pool.query(`
      SELECT key,value
      FROM ec_settings
      WHERE key IN (
        'seo_area_title_template',
        'seo_area_desc_template',
        'site_name'
      )
    `);

   const settings = Object.fromEntries(
  settingsResult.rows.map((row: any) => [row.key, row.value])
);

    // Replace variables
    const metaTitle =
      settings.seo_area_title_template
        ?.replaceAll("{count}", String(listingCount))
        .replaceAll("{area}", area.area)
        .replaceAll("{city}", area.city)
        .replaceAll("{site_name}", settings.site_name || "");

    const metaDescription =
      settings.seo_area_desc_template
        ?.replaceAll("{count}", String(listingCount))
        .replaceAll("{area}", area.area)
        .replaceAll("{city}", area.city)
        .replaceAll("{site_name}", settings.site_name || "");

    res.json({
      ...area,
      listing_count: listingCount,
      meta_title: metaTitle,
      meta_description: metaDescription,
    });

  } catch(err:any){
    res.status(500).json({ error: err.message });
  }
});

// ── Public: smart lookup (city or area?) ─────────────────────────────────────
router.get("/lookup/:slug", async (req, res) => {
  const { slug } = req.params;

  console.log("LOOKUP ROUTE HIT:", slug);

  try {
    // 1. Check state
    const state = await pool.query(
      `SELECT DISTINCT state, state_slug
       FROM ec_locations
       WHERE state_slug = $1
       LIMIT 1`,
      [slug]
    );

    console.log("State Query Result:", state.rows);

    if (state.rows.length > 0) {
      return res.json({
        type: "state",
        ...state.rows[0],
      });
    }

    // 2. Check city
    const city = await pool.query(
      `SELECT DISTINCT city, city_slug, state, state_slug
       FROM ec_locations
       WHERE city_slug = $1
       LIMIT 1`,
      [slug]
    );

    if (city.rows.length > 0) {
      return res.json({
        type: "city",
        ...city.rows[0],
      });
    }

    // 3. Check area
    const area = await pool.query(
      `SELECT *
       FROM ec_locations
       WHERE area_slug = $1
       LIMIT 1`,
      [slug]
    );

    if (area.rows.length > 0) {
      return res.json({
        type: "area",
        ...area.rows[0],
      });
    }

    return res.status(404).json({ error: "Not found" });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin CRUD ───────────────────────────────────────────────────────────────
router.post("/", requireAdmin as any, async (req: any, res) => {
  const { state, city, area, area_slug, url_base } = req.body;
  if (!state || !city || !area || !area_slug)
    return res.status(400).json({ error: "state, city, area, area_slug required" });
  const state_slug = state.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const city_slug  = city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  try {
    const result = await pool.query(
      `INSERT INTO ec_locations (state, city, area, area_slug, url_base, state_slug, city_slug)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [state, city, area, area_slug, url_base || `escorts/${area_slug}`, state_slug, city_slug]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", requireAdmin as any, async (req: any, res) => {
  const { id } = req.params;
  const { state, city, area, area_slug, url_base } = req.body;
  const state_slug = state?.toLowerCase().replace(/[^a-z0-9]+/g, "") || "";
  const city_slug  = city?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "";
  try {
    const result = await pool.query(
      `UPDATE ec_locations SET state=$1, city=$2, area=$3, area_slug=$4, url_base=$5,
        state_slug=$6, city_slug=$7 WHERE id=$8 RETURNING *`,
      [state, city, area, area_slug, url_base, state_slug, city_slug, id]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", requireAdmin as any, async (req: any, res) => {
  try {
    await pool.query("DELETE FROM ec_locations WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export { router as locationsRouter };
