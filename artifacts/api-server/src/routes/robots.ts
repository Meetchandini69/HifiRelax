import { Router } from "express";
import { pool } from "@workspace/db";

export const robotsRouter = Router();
robotsRouter.get("/robots.txt", async (_req, res, next) => {
  try {
    const result = await pool.query("SELECT value FROM ec_settings WHERE key = 'robots_txt'");
    // Preserve an existing static file until an administrator saves an override.
    if (!result.rows.length) { next(); return; }
    res.set("Cache-Control", "no-cache").type("text/plain").send(result.rows[0].value ?? "");
  } catch {
    res.status(503).type("text/plain").send("Temporarily unable to load robots.txt");
  }
});
