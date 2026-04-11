import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "@workspace/db";
import { requireAuth, type AuthRequest } from "./middleware.js";

const router = Router();
const JWT_SECRET = process.env.SESSION_SECRET || "fallback-secret-change-me";

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "email, password, name are required" });
  }
  try {
    const existing = await pool.query("SELECT id FROM ec_users WHERE email=$1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      "INSERT INTO ec_users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, role",
      [email, hash, name]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ user, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }
  try {
    const result = await pool.query("SELECT * FROM ec_users WHERE email=$1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/me", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { id: number; role: string };
    const result = await pool.query("SELECT id, email, name, role FROM ec_users WHERE id=$1", [payload.id]);
    if (result.rows.length === 0) return res.status(401).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

// User: update name
router.put("/me", requireAuth as any, async (req: AuthRequest, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "name is required" });
  try {
    const r = await pool.query(
      "UPDATE ec_users SET name=$1 WHERE id=$2 RETURNING id, email, name, role",
      [name.trim(), req.user!.id]
    );
    res.json(r.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// User: change password
router.put("/change-password", requireAuth as any, async (req: AuthRequest, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return res.status(400).json({ error: "current_password and new_password are required" });
  }
  if (new_password.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters" });
  }
  try {
    const r = await pool.query("SELECT password_hash FROM ec_users WHERE id=$1", [req.user!.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: "User not found" });
    const valid = await bcrypt.compare(current_password, r.rows[0].password_hash);
    if (!valid) return res.status(400).json({ error: "Current password is incorrect" });
    const hash = await bcrypt.hash(new_password, 12);
    await pool.query("UPDATE ec_users SET password_hash=$1 WHERE id=$2", [hash, req.user!.id]);
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export { router as authRouter };
