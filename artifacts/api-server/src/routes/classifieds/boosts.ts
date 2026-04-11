import { Router } from "express";
import { pool } from "@workspace/db";
import { requireAuth, requireAdmin, type AuthRequest } from "./middleware.js";

const router = Router();

// Public: list all active boost plans
router.get("/plans", async (_req, res) => {
  try {
    const r = await pool.query(
      "SELECT * FROM ec_boost_plans WHERE is_active=true ORDER BY sort_priority ASC"
    );
    res.json(r.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// User: submit boost request
router.post("/request", requireAuth as any, async (req: AuthRequest, res) => {
  const { profile_id, plan_slug } = req.body;
  if (!profile_id || !plan_slug) return res.status(400).json({ error: "profile_id and plan_slug required" });
  try {
    const own = await pool.query("SELECT id FROM ec_profiles WHERE id=$1 AND user_id=$2", [profile_id, req.user!.id]);
    if (own.rows.length === 0) return res.status(403).json({ error: "Not your profile" });
    const plan = await pool.query("SELECT * FROM ec_boost_plans WHERE slug=$1 AND is_active=true", [plan_slug]);
    if (plan.rows.length === 0) return res.status(404).json({ error: "Plan not found" });
    const existing = await pool.query(
      "SELECT id FROM ec_boost_requests WHERE profile_id=$1 AND status='pending'", [profile_id]
    );
    if (existing.rows.length > 0) {
      await pool.query(
        "UPDATE ec_boost_requests SET plan_slug=$1, updated_at=NOW() WHERE profile_id=$2 AND status='pending'",
        [plan_slug, profile_id]
      );
    } else {
      await pool.query(
        "INSERT INTO ec_boost_requests (profile_id, user_id, plan_slug, status) VALUES ($1,$2,$3,'pending')",
        [profile_id, req.user!.id, plan_slug]
      );
    }
    res.json({ success: true, message: "Boost request submitted. Admin will review shortly." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// User: get boost requests for own profiles
router.get("/my-requests", requireAuth as any, async (req: AuthRequest, res) => {
  try {
    const r = await pool.query(
      `SELECT br.*, p.title as profile_title, bp.name as plan_name, bp.badge_label, bp.badge_color, bp.price
       FROM ec_boost_requests br
       JOIN ec_profiles p ON br.profile_id=p.id
       LEFT JOIN ec_boost_plans bp ON br.plan_slug=bp.slug
       WHERE br.user_id=$1
       ORDER BY br.created_at DESC`,
      [req.user!.id]
    );
    res.json(r.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: list all boost requests
router.get("/admin/requests", requireAdmin as any, async (req: any, res) => {
  const { status } = req.query as Record<string, string>;
  try {
    let q = `SELECT br.*, p.title as profile_title, p.slug as profile_slug,
               l.area_slug, l.area, l.city,
               u.email as user_email, bp.name as plan_name, bp.badge_label, bp.badge_color,
               bp.price, bp.duration_days
             FROM ec_boost_requests br
             JOIN ec_profiles p ON br.profile_id=p.id
             LEFT JOIN ec_locations l ON p.location_id=l.id
             JOIN ec_users u ON br.user_id=u.id
             LEFT JOIN ec_boost_plans bp ON br.plan_slug=bp.slug`;
    const params: any[] = [];
    if (status) { params.push(status); q += ` WHERE br.status=$1`; }
    q += " ORDER BY br.created_at DESC";
    const r = await pool.query(q, params);
    res.json(r.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: approve boost request (apply boost to profile)
router.put("/admin/requests/:id/approve", requireAdmin as any, async (req: any, res) => {
  try {
    const reqRow = await pool.query(
      "SELECT * FROM ec_boost_requests WHERE id=$1", [req.params.id]
    );
    if (reqRow.rows.length === 0) return res.status(404).json({ error: "Request not found" });
    const br = reqRow.rows[0];
    const plan = await pool.query("SELECT * FROM ec_boost_plans WHERE slug=$1", [br.plan_slug]);
    if (plan.rows.length === 0) return res.status(404).json({ error: "Plan not found" });
    const p = plan.rows[0];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + p.duration_days);
    await pool.query(
      `UPDATE ec_profiles SET boost_plan_slug=$1, boost_expires_at=$2, boost_sort_priority=$3, updated_at=NOW() WHERE id=$4`,
      [p.slug, expiresAt, p.sort_priority, br.profile_id]
    );
    await pool.query(
      "UPDATE ec_boost_requests SET status='approved', admin_note=$1, updated_at=NOW() WHERE id=$2",
      [req.body.note || "", req.params.id]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: reject boost request
router.put("/admin/requests/:id/reject", requireAdmin as any, async (req: any, res) => {
  try {
    await pool.query(
      "UPDATE ec_boost_requests SET status='rejected', admin_note=$1, updated_at=NOW() WHERE id=$2",
      [req.body.note || "", req.params.id]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: directly apply boost to a profile
router.post("/admin/apply", requireAdmin as any, async (req: any, res) => {
  const { profile_id, plan_slug, duration_days } = req.body;
  if (!profile_id || !plan_slug) return res.status(400).json({ error: "profile_id and plan_slug required" });
  try {
    const plan = await pool.query("SELECT * FROM ec_boost_plans WHERE slug=$1", [plan_slug]);
    if (plan.rows.length === 0) return res.status(404).json({ error: "Plan not found" });
    const p = plan.rows[0];
    const days = duration_days || p.duration_days;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    await pool.query(
      `UPDATE ec_profiles SET boost_plan_slug=$1, boost_expires_at=$2, boost_sort_priority=$3, updated_at=NOW() WHERE id=$4`,
      [p.slug, expiresAt, p.sort_priority, profile_id]
    );
    res.json({ success: true, expires_at: expiresAt });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: remove boost from a profile
router.delete("/admin/apply/:profileId", requireAdmin as any, async (req: any, res) => {
  try {
    await pool.query(
      "UPDATE ec_profiles SET boost_plan_slug=NULL, boost_expires_at=NULL, boost_sort_priority=0, updated_at=NOW() WHERE id=$1",
      [req.params.profileId]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: get boost plans (admin CRUD)
router.get("/admin/plans", requireAdmin as any, async (_req: any, res) => {
  try {
    const r = await pool.query("SELECT * FROM ec_boost_plans ORDER BY sort_priority ASC");
    res.json(r.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: update plan price/duration/active
router.put("/admin/plans/:id", requireAdmin as any, async (req: any, res) => {
  const { price, duration_days, is_active, description } = req.body;
  try {
    const r = await pool.query(
      `UPDATE ec_boost_plans SET price=$1, duration_days=$2, is_active=$3, description=$4 WHERE id=$5 RETURNING *`,
      [price, duration_days, is_active, description, req.params.id]
    );
    res.json(r.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: get approved profiles list (for direct apply UI)
router.get("/admin/approved-profiles", requireAdmin as any, async (_req: any, res) => {
  try {
    const r = await pool.query(
      `SELECT p.id, p.title, p.slug, p.boost_plan_slug, p.boost_expires_at,
              l.area, l.city, u.email as user_email,
              bp.badge_label, bp.badge_color
       FROM ec_profiles p
       LEFT JOIN ec_locations l ON p.location_id=l.id
       LEFT JOIN ec_users u ON p.user_id=u.id
       LEFT JOIN ec_boost_plans bp ON p.boost_plan_slug=bp.slug
       WHERE p.status='approved'
       ORDER BY p.updated_at DESC LIMIT 100`
    );
    res.json(r.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export { router as boostsRouter };
