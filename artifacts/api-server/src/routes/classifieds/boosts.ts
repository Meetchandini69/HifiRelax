import { Router } from "express";
import { pool } from "@workspace/db";
import { requireAuth, requireAdmin, type AuthRequest } from "./middleware.js";

const router = Router();

// Public: list all active boost plans with their tiers
router.get("/plans", async (_req, res) => {
  try {
    const plans = await pool.query(
      "SELECT * FROM ec_boost_plans WHERE is_active=true ORDER BY sort_priority DESC"
    );
    const tiers = await pool.query(
      "SELECT * FROM ec_boost_plan_tiers WHERE plan_slug = ANY($1) ORDER BY duration_days ASC",
      [plans.rows.map((p: any) => p.slug)]
    );
    const result = plans.rows.map((plan: any) => ({
      ...plan,
      tiers: tiers.rows.filter((t: any) => t.plan_slug === plan.slug),
    }));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// User: submit boost request (supports tier + addon)
router.post("/request", requireAuth as any, async (req: AuthRequest, res) => {
  const { profile_id, plan_slug, tier_slug, addon_gallery } = req.body;
  if (!profile_id || !plan_slug) return res.status(400).json({ error: "profile_id and plan_slug required" });
  try {
    const own = await pool.query("SELECT id FROM ec_profiles WHERE id=$1 AND user_id=$2", [profile_id, req.user!.id]);
    if (own.rows.length === 0) return res.status(403).json({ error: "Not your profile" });

    const plan = await pool.query("SELECT * FROM ec_boost_plans WHERE slug=$1 AND is_active=true", [plan_slug]);
    if (plan.rows.length === 0) return res.status(404).json({ error: "Plan not found" });

    // Validate tier if provided
    if (tier_slug) {
      const tier = await pool.query("SELECT * FROM ec_boost_plan_tiers WHERE plan_slug=$1 AND tier_slug=$2", [plan_slug, tier_slug]);
      if (tier.rows.length === 0) return res.status(404).json({ error: "Tier not found" });
    }

    const existing = await pool.query(
      "SELECT id FROM ec_boost_requests WHERE profile_id=$1 AND plan_slug=$2 AND status='pending'", [profile_id, plan_slug]
    );
    if (existing.rows.length > 0) {
      await pool.query(
        "UPDATE ec_boost_requests SET tier_slug=$1, addon_gallery=$2, updated_at=NOW() WHERE profile_id=$3 AND plan_slug=$4 AND status='pending'",
        [tier_slug || null, addon_gallery || false, profile_id, plan_slug]
      );
    } else {
      await pool.query(
        "INSERT INTO ec_boost_requests (profile_id, user_id, plan_slug, tier_slug, addon_gallery, status) VALUES ($1,$2,$3,$4,$5,'pending')",
        [profile_id, req.user!.id, plan_slug, tier_slug || null, addon_gallery || false]
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
      `SELECT br.*, p.title as profile_title, bp.name as plan_name, bp.badge_label, bp.badge_color, bp.price,
              t.label as tier_label, t.duration_days as tier_duration_days, t.price as tier_price
       FROM ec_boost_requests br
       JOIN ec_profiles p ON br.profile_id=p.id
       LEFT JOIN ec_boost_plans bp ON br.plan_slug=bp.slug
       LEFT JOIN ec_boost_plan_tiers t ON t.plan_slug=br.plan_slug AND t.tier_slug=br.tier_slug
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
               bp.price, bp.duration_days,
               t.label as tier_label, t.duration_days as tier_duration_days, t.price as tier_price
             FROM ec_boost_requests br
             JOIN ec_profiles p ON br.profile_id=p.id
             LEFT JOIN ec_locations l ON p.location_id=l.id
             JOIN ec_users u ON br.user_id=u.id
             LEFT JOIN ec_boost_plans bp ON br.plan_slug=bp.slug
             LEFT JOIN ec_boost_plan_tiers t ON t.plan_slug=br.plan_slug AND t.tier_slug=br.tier_slug`;
    const params: any[] = [];
    if (status) { params.push(status); q += ` WHERE br.status=$1`; }
    q += " ORDER BY br.created_at DESC";
    const r = await pool.query(q, params);
    res.json(r.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: approve boost request
router.put("/admin/requests/:id/approve", requireAdmin as any, async (req: any, res) => {
  try {
    const reqRow = await pool.query("SELECT * FROM ec_boost_requests WHERE id=$1", [req.params.id]);
    if (reqRow.rows.length === 0) return res.status(404).json({ error: "Request not found" });
    const br = reqRow.rows[0];

    const plan = await pool.query("SELECT * FROM ec_boost_plans WHERE slug=$1", [br.plan_slug]);
    if (plan.rows.length === 0) return res.status(404).json({ error: "Plan not found" });
    const p = plan.rows[0];

    // Resolve duration from tier if provided, else use plan default
    let durationDays = p.duration_days;
    if (br.tier_slug) {
      const tier = await pool.query("SELECT * FROM ec_boost_plan_tiers WHERE plan_slug=$1 AND tier_slug=$2", [br.plan_slug, br.tier_slug]);
      if (tier.rows.length > 0) durationDays = tier.rows[0].duration_days;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    if (br.plan_slug === "top_ad") {
      // For top_ad: apply boost with approval timestamp for position ordering
      await pool.query(
        `UPDATE ec_profiles SET boost_plan_slug=$1, boost_expires_at=$2, boost_sort_priority=$3,
         boost_approved_at=NOW(), updated_at=NOW() WHERE id=$4`,
        [p.slug, expiresAt, p.sort_priority, br.profile_id]
      );
    } else if (br.plan_slug === "gallery_boost") {
      // Gallery boost is an addon: just extend gallery access, don't change main boost
      await pool.query(
        `UPDATE ec_profiles SET gallery_boost_expires_at=$1, updated_at=NOW() WHERE id=$2`,
        [expiresAt, br.profile_id]
      );
    } else {
      await pool.query(
        `UPDATE ec_profiles SET boost_plan_slug=$1, boost_expires_at=$2, boost_sort_priority=$3,
         boost_approved_at=NOW(), updated_at=NOW() WHERE id=$4`,
        [p.slug, expiresAt, p.sort_priority, br.profile_id]
      );
    }

    // Handle addon_gallery on same request
    if (br.addon_gallery && br.plan_slug !== "gallery_boost") {
      await pool.query(
        `UPDATE ec_profiles SET gallery_boost_expires_at=$1, updated_at=NOW() WHERE id=$2`,
        [expiresAt, br.profile_id]
      );
    }

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
  const { profile_id, plan_slug, tier_slug, duration_days, addon_gallery } = req.body;
  if (!profile_id || !plan_slug) return res.status(400).json({ error: "profile_id and plan_slug required" });
  try {
    const plan = await pool.query("SELECT * FROM ec_boost_plans WHERE slug=$1", [plan_slug]);
    if (plan.rows.length === 0) return res.status(404).json({ error: "Plan not found" });
    const p = plan.rows[0];

    let days = duration_days || p.duration_days;
    if (tier_slug && !duration_days) {
      const tier = await pool.query("SELECT * FROM ec_boost_plan_tiers WHERE plan_slug=$1 AND tier_slug=$2", [plan_slug, tier_slug]);
      if (tier.rows.length > 0) days = tier.rows[0].duration_days;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    if (plan_slug === "gallery_boost") {
      await pool.query(
        `UPDATE ec_profiles SET gallery_boost_expires_at=$1, updated_at=NOW() WHERE id=$2`,
        [expiresAt, profile_id]
      );
    } else {
      await pool.query(
        `UPDATE ec_profiles SET boost_plan_slug=$1, boost_expires_at=$2, boost_sort_priority=$3,
         boost_approved_at=NOW(), updated_at=NOW() WHERE id=$4`,
        [p.slug, expiresAt, p.sort_priority, profile_id]
      );
    }

    if (addon_gallery && plan_slug !== "gallery_boost") {
      await pool.query(
        `UPDATE ec_profiles SET gallery_boost_expires_at=$1, updated_at=NOW() WHERE id=$2`,
        [expiresAt, profile_id]
      );
    }

    res.json({ success: true, expires_at: expiresAt });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: remove boost from a profile
router.delete("/admin/apply/:profileId", requireAdmin as any, async (req: any, res) => {
  const { type } = req.query as Record<string, string>;
  try {
    if (type === "gallery") {
      await pool.query(
        "UPDATE ec_profiles SET gallery_boost_expires_at=NULL, updated_at=NOW() WHERE id=$1",
        [req.params.profileId]
      );
    } else if (type === "all") {
      await pool.query(
        "UPDATE ec_profiles SET boost_plan_slug=NULL, boost_expires_at=NULL, boost_sort_priority=0, boost_approved_at=NULL, gallery_boost_expires_at=NULL, updated_at=NOW() WHERE id=$1",
        [req.params.profileId]
      );
    } else {
      await pool.query(
        "UPDATE ec_profiles SET boost_plan_slug=NULL, boost_expires_at=NULL, boost_sort_priority=0, boost_approved_at=NULL, updated_at=NOW() WHERE id=$1",
        [req.params.profileId]
      );
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: seed default boost plans (idempotent — only inserts if empty)
router.post("/admin/seed-plans", requireAdmin as any, async (_req: any, res) => {
  try {
    await pool.query(`
      INSERT INTO ec_boost_plans (name, slug, badge_label, badge_color, sort_priority, description, price, duration_days, is_active)
      VALUES
        ('Top Ad / Featured Listing', 'top_ad', '⭐ Trending', 'rose', 100,
         'Your ad appears at the top of selected state/city/area pages with a Trending badge. Multiple purchases stack in purchase order.',
         299, 7, true),
        ('Gallery Boost', 'gallery_boost', '🖼 Gallery', 'violet', 0,
         'Add-on: Unlock 10–20 photos with slideshow format instead of 3–5 photos.',
         99, 7, true)
      ON CONFLICT (slug) DO NOTHING
    `);
    const existing = await pool.query(
      `SELECT COUNT(*) FROM ec_boost_plan_tiers WHERE plan_slug IN ('top_ad','gallery_boost')`
    );
    if (parseInt(existing.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO ec_boost_plan_tiers (plan_slug, tier_slug, label, duration_days, price)
        VALUES
          ('top_ad',       '1w', '1 Week',  7,  299),
          ('top_ad',       '2w', '2 Weeks', 14, 499),
          ('top_ad',       '1m', '1 Month', 30, 899),
          ('gallery_boost','1w', '1 Week',  7,  99),
          ('gallery_boost','2w', '2 Weeks', 14, 149),
          ('gallery_boost','1m', '1 Month', 30, 199)
      `);
    }
    res.json({ success: true, message: "Default boost plans seeded." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: get boost plans with tiers
router.get("/admin/plans", requireAdmin as any, async (_req: any, res) => {
  try {
    const plans = await pool.query("SELECT * FROM ec_boost_plans ORDER BY sort_priority DESC");
    const tiers = await pool.query("SELECT * FROM ec_boost_plan_tiers ORDER BY duration_days ASC");
    const result = plans.rows.map((plan: any) => ({
      ...plan,
      tiers: tiers.rows.filter((t: any) => t.plan_slug === plan.slug),
    }));
    res.json(result);
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

// Admin: update a specific tier price
router.put("/admin/tiers/:id", requireAdmin as any, async (req: any, res) => {
  const { price } = req.body;
  try {
    const r = await pool.query(
      "UPDATE ec_boost_plan_tiers SET price=$1 WHERE id=$2 RETURNING *",
      [price, req.params.id]
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
              p.gallery_boost_expires_at, p.boost_approved_at,
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
