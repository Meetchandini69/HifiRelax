import { Router } from "express";
import { pool } from "@workspace/db";
import { requireAuth, requireAdmin, type AuthRequest } from "./middleware.js";

const router = Router();

function toSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Public: list approved profiles
router.get("/", async (req, res) => {
  const { area_slug, city, state, page = "1", limit = "20" } = req.query as Record<string, string>;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    let query = `
      SELECT p.*, l.state, l.city, l.area, l.area_slug, l.url_base,
             u.name as poster_name,
             bp.badge_label, bp.badge_color, bp.name as boost_plan_name,
             CASE WHEN p.boost_expires_at > NOW() THEN p.boost_plan_slug ELSE NULL END as active_boost_slug,
             CASE WHEN p.boost_expires_at > NOW() THEN bp.badge_label ELSE NULL END as active_badge_label,
             CASE WHEN p.boost_expires_at > NOW() THEN bp.badge_color ELSE NULL END as active_badge_color,
             CASE WHEN p.boost_expires_at > NOW() THEN p.boost_sort_priority ELSE 0 END as effective_priority,
             CASE WHEN p.gallery_boost_expires_at > NOW() THEN true ELSE false END as gallery_boost_active
      FROM ec_profiles p
      LEFT JOIN ec_locations l ON p.location_id = l.id
      LEFT JOIN ec_users u ON p.user_id = u.id
      LEFT JOIN ec_boost_plans bp ON p.boost_plan_slug = bp.slug
      WHERE p.status = 'approved'
    `;
    const params: any[] = [];
    if (area_slug) { params.push(area_slug); query += ` AND l.area_slug=$${params.length}`; }
    if (city) { params.push(city); query += ` AND l.city=$${params.length}`; }
    if (state) { params.push(state); query += ` AND l.state=$${params.length}`; }
    // Boosted profiles (top_ad) sorted by approval time ASC (first purchased = top position), then non-boosted by date
    query += " ORDER BY effective_priority DESC, p.boost_approved_at ASC NULLS LAST, p.updated_at DESC";
    params.push(parseInt(limit)); query += ` LIMIT $${params.length}`;
    params.push(offset); query += ` OFFSET $${params.length}`;
    const result = await pool.query(query, params);
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM ec_profiles p LEFT JOIN ec_locations l ON p.location_id=l.id WHERE p.status='approved'${area_slug ? " AND l.area_slug=$1" : ""}`,
      area_slug ? [area_slug] : []
    );
    res.json({ profiles: result.rows, total: parseInt(countResult.rows[0].count) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Public: get profile by slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, l.state, l.city, l.area, l.area_slug, l.city_slug, l.state_slug, l.url_base
       FROM ec_profiles p LEFT JOIN ec_locations l ON p.location_id=l.id
       WHERE p.slug=$1 AND p.status='approved'`,
      [req.params.slug]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Public: stats
router.get("/stats", async (_req, res) => {
  try {
    const [total, approved, byArea] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM ec_profiles"),
      pool.query("SELECT COUNT(*) FROM ec_profiles WHERE status='approved'"),
      pool.query(`SELECT l.area, l.area_slug, COUNT(p.id) as count FROM ec_locations l LEFT JOIN ec_profiles p ON p.location_id=l.id AND p.status='approved' GROUP BY l.id, l.area, l.area_slug ORDER BY count DESC LIMIT 10`),
    ]);
    res.json({ total: parseInt(total.rows[0].count), approved: parseInt(approved.rows[0].count), byArea: byArea.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// User: post profile
router.post("/", requireAuth as any, async (req: AuthRequest, res) => {
  const { title, name, description, age, phone, whatsapp, telegram, services, photos, location_id } = req.body;
  if (!title || !name || !location_id) {
    return res.status(400).json({ error: "title, name, location_id are required" });
  }
  try {
    const userRow = await pool.query("SELECT role, account_type FROM ec_users WHERE id=$1", [req.user!.id]);
    const { role, account_type } = userRow.rows[0] ?? { role: "user", account_type: "independent" };

    // Determine max listings allowed
    // admin/supervisor = unlimited; agent = 3; independent (default) = 1
    let maxListings = 1;
    if (role === "admin" || role === "supervisor") maxListings = Infinity;
    else if (account_type === "agent") maxListings = 3;

    if (maxListings !== Infinity) {
      const countQ = await pool.query(
        "SELECT COUNT(*) FROM ec_profiles WHERE user_id=$1 AND status IN ('pending','approved')",
        [req.user!.id]
      );
      const count = parseInt(countQ.rows[0].count);
      if (count >= maxListings) {
        const limitLabel = account_type === "agent" ? "3 listings (Agent plan)" : "1 listing (Independent plan)";
        return res.status(403).json({
          error: `Your account allows a maximum of ${limitLabel}. Upgrade your plan or boost your existing listing.`,
          code: "LISTING_LIMIT_REACHED",
        });
      }
    }

    const slug = toSlug(title);
    const result = await pool.query(
      `INSERT INTO ec_profiles (user_id, title, name, description, age, phone, whatsapp, telegram, services, photos, location_id, slug, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'pending') RETURNING *`,
      [req.user!.id, title, name, description, age || null, phone, whatsapp, telegram, services || [], photos || [], location_id, slug]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// User: my profiles
router.get("/mine", requireAuth as any, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, l.state, l.city, l.area, l.area_slug,
              bp.badge_label, bp.badge_color,
              CASE WHEN p.boost_expires_at > NOW() THEN p.boost_plan_slug ELSE NULL END as active_boost_slug,
              CASE WHEN p.boost_expires_at > NOW() THEN bp.badge_label ELSE NULL END as active_badge_label,
              CASE WHEN p.boost_expires_at > NOW() THEN bp.badge_color ELSE NULL END as active_badge_color,
              p.boost_expires_at,
              CASE WHEN p.gallery_boost_expires_at > NOW() THEN true ELSE false END as gallery_boost_active
       FROM ec_profiles p
       LEFT JOIN ec_locations l ON p.location_id=l.id
       LEFT JOIN ec_boost_plans bp ON p.boost_plan_slug=bp.slug
       WHERE p.user_id=$1 ORDER BY p.created_at DESC`,
      [req.user!.id]
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// User: fetch a single owned profile by ID (used by edit form to pre-populate)
router.get("/mine/:id", requireAuth as any, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, l.state, l.city, l.area, l.area_slug,
              CASE WHEN p.gallery_boost_expires_at > NOW() THEN true ELSE false END as gallery_boost_active
       FROM ec_profiles p
       LEFT JOIN ec_locations l ON p.location_id=l.id
       WHERE p.id=$1 AND p.user_id=$2`,
      [req.params.id, req.user!.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// User: update own profile (allowed any time; if approved → goes back to pending for re-approval)
router.put("/:id", requireAuth as any, async (req: AuthRequest, res) => {
  const { title, name, description, age, phone, whatsapp, telegram, services, photos, location_id } = req.body;
  try {
    const own = await pool.query("SELECT id, status FROM ec_profiles WHERE id=$1 AND user_id=$2", [req.params.id, req.user!.id]);
    if (own.rows.length === 0) return res.status(403).json({ error: "Not found or not yours" });
    const slug = toSlug(title);
    // Any edit resets status to pending so admin re-approves changes
    const result = await pool.query(
      `UPDATE ec_profiles SET title=$1, name=$2, description=$3, age=$4, phone=$5, whatsapp=$6, telegram=$7, services=$8, photos=$9, location_id=$10, slug=$11, status='pending', rejection_reason=NULL, updated_at=NOW() WHERE id=$12 RETURNING *`,
      [title, name, description, age, phone, whatsapp, telegram, services || [], photos || [], location_id, slug, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// User: delete own profile
router.delete("/:id", requireAuth as any, async (req: AuthRequest, res) => {
  try {
    const own = await pool.query("SELECT id FROM ec_profiles WHERE id=$1 AND user_id=$2", [req.params.id, req.user!.id]);
    if (own.rows.length === 0) return res.status(403).json({ error: "Not found or not yours" });
    await pool.query("DELETE FROM ec_profiles WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: list all profiles
router.get("/admin/all", requireAdmin as any, async (req: any, res) => {
  const { status, page = "1" } = req.query as Record<string, string>;
  const offset = (parseInt(page) - 1) * 20;
  try {
    let query = `SELECT p.*, l.state, l.city, l.area, l.area_slug, u.email as user_email FROM ec_profiles p LEFT JOIN ec_locations l ON p.location_id=l.id LEFT JOIN ec_users u ON p.user_id=u.id`;
    const params: any[] = [];
    if (status) { params.push(status); query += ` WHERE p.status=$${params.length}`; }
    query += ` ORDER BY p.created_at DESC LIMIT 20 OFFSET $${params.length + 1}`;
    params.push(offset);
    const result = await pool.query(query, params);
    const countQ = status
      ? await pool.query("SELECT COUNT(*) FROM ec_profiles WHERE status=$1", [status])
      : await pool.query("SELECT COUNT(*) FROM ec_profiles");
    res.json({ profiles: result.rows, total: parseInt(countQ.rows[0].count) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: approve profile (also set URL)
router.put("/admin/:id/approve", requireAdmin as any, async (req: any, res) => {
  const { location_id } = req.body;
  try {
    const profileQ = await pool.query("SELECT * FROM ec_profiles WHERE id=$1", [req.params.id]);
    if (profileQ.rows.length === 0) return res.status(404).json({ error: "Profile not found" });
    const profile = profileQ.rows[0];
    const locId = location_id || profile.location_id;
    const locQ = await pool.query("SELECT * FROM ec_locations WHERE id=$1", [locId]);
    const loc = locQ.rows[0];
    const full_url = loc ? `${loc.url_base}/${profile.slug}` : `escorts/${profile.slug}`;
    const result = await pool.query(
      "UPDATE ec_profiles SET status='approved', location_id=$1, full_url=$2, updated_at=NOW() WHERE id=$3 RETURNING *",
      [locId, full_url, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: reject profile
router.put("/admin/:id/reject", requireAdmin as any, async (req: any, res) => {
  const { reason } = req.body;
  try {
    const result = await pool.query(
      "UPDATE ec_profiles SET status='rejected', rejection_reason=$1, updated_at=NOW() WHERE id=$2 RETURNING *",
      [reason || "", req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: delete profile
router.delete("/admin/:id", requireAdmin as any, async (req: any, res) => {
  try {
    await pool.query("DELETE FROM ec_profiles WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: toggle verified badge on a profile
router.put("/admin/:id/verify", requireAdmin as any, async (req: any, res) => {
  const { verified } = req.body;
  try {
    const r = await pool.query(
      "UPDATE ec_profiles SET verified=$1, updated_at=NOW() WHERE id=$2 RETURNING *",
      [!!verified, req.params.id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: "Profile not found" });
    res.json(r.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// User: get own account limits (for frontend photo/listing limit enforcement)
router.get("/my-limits", requireAuth as any, async (req: AuthRequest, res) => {
  try {
    const userRow = await pool.query("SELECT role, account_type FROM ec_users WHERE id=$1", [req.user!.id]);
    const { role, account_type } = userRow.rows[0] ?? { role: "user", account_type: "independent" };
    let maxListings = 1, maxPhotos = 1;
    if (role === "admin" || role === "supervisor") { maxListings = 999; maxPhotos = 10; }
    else if (account_type === "agent") { maxListings = 3; maxPhotos = 3; }
    // gallery boost is handled separately per profile
    res.json({ role, account_type, maxListings, maxPhotos });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export { router as profilesRouter };
