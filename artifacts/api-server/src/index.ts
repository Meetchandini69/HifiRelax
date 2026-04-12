import { readFileSync } from "fs";
import { join } from "path";
import app from "./app";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function runSqlFile(filename: string, label: string) {
  const candidates = [
    join(process.cwd(), `schema/${filename}`),
    join(process.cwd(), `../../schema/${filename}`),
  ];
  let sql: string | null = null;
  for (const p of candidates) {
    try { sql = readFileSync(p, "utf-8"); break; } catch { /* try next */ }
  }
  if (!sql) {
    logger.warn(`${label} file not found — skipping`);
    return;
  }
  try {
    await pool.query(sql);
    logger.info(`${label} applied`);
  } catch (err) {
    logger.warn({ err }, `${label} error`);
  }
}

async function runSchemaMigration() {
  await runSqlFile("schema.sql", "Schema migration");
}

async function runSeedData() {
  await runSqlFile("seed.sql", "Seed data");
}

async function seedBoostPlans() {
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
    logger.info("Boost plans seeded (or already exist)");
  } catch (err) {
    logger.warn({ err }, "Boost plan seed skipped");
  }
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
  await runSchemaMigration();
  await runSeedData();
  await seedBoostPlans();
});
