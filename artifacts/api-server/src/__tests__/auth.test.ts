import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { createTestApp } from "./helpers/app.js";
import { pool } from "@workspace/db";

const JWT_SECRET = process.env.SESSION_SECRET || "fallback-secret-change-me";
const app = createTestApp();
const mockQuery = vi.mocked(pool.query);

beforeEach(() => {
  mockQuery.mockReset();
});

describe("POST /api/classifieds/auth/register", () => {
  it("returns 400 if required fields are missing", async () => {
    const res = await request(app).post("/api/classifieds/auth/register").send({ email: "a@b.com" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it("returns 409 if email is already registered", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] } as any);
    const res = await request(app).post("/api/classifieds/auth/register").send({
      email: "existing@test.com", password: "Password1!", name: "Test",
    });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already registered/i);
  });

  it("registers a new user and returns a JWT token", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] } as any)
      .mockResolvedValueOnce({ rows: [{ id: 99, email: "new@test.com", name: "New User", role: "user" }] } as any);
    const res = await request(app).post("/api/classifieds/auth/register").send({
      email: "new@test.com", password: "Password1!", name: "New User",
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("new@test.com");
    const payload = jwt.verify(res.body.token, JWT_SECRET) as any;
    expect(payload.id).toBe(99);
    expect(payload.role).toBe("user");
  });
});

describe("POST /api/classifieds/auth/login", () => {
  it("returns 400 if email or password is missing", async () => {
    const res = await request(app).post("/api/classifieds/auth/login").send({ email: "a@b.com" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it("returns 401 if user not found", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as any);
    const res = await request(app).post("/api/classifieds/auth/login").send({
      email: "nobody@test.com", password: "pass",
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid credentials/i);
  });

  it("returns 401 if password is wrong", async () => {
    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.hash("correctpassword", 4);
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, email: "u@t.com", name: "U", role: "user", password_hash: hash }] } as any);
    const res = await request(app).post("/api/classifieds/auth/login").send({
      email: "u@t.com", password: "wrongpassword",
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid credentials/i);
  });

  it("returns token and user on successful login", async () => {
    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.hash("Correct1!", 4);
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 7, email: "user@test.com", name: "Alice", role: "user", password_hash: hash }],
    } as any);
    const res = await request(app).post("/api/classifieds/auth/login").send({
      email: "user@test.com", password: "Correct1!",
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toMatchObject({ id: 7, email: "user@test.com", name: "Alice", role: "user" });
    const payload = jwt.verify(res.body.token, JWT_SECRET) as any;
    expect(payload.id).toBe(7);
  });
});

describe("GET /api/classifieds/auth/me", () => {
  it("returns 401 with no auth header", async () => {
    const res = await request(app).get("/api/classifieds/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns 401 with invalid token", async () => {
    const res = await request(app)
      .get("/api/classifieds/auth/me")
      .set("Authorization", "Bearer badtoken");
    expect(res.status).toBe(401);
  });

  it("returns user object with valid token", async () => {
    const token = jwt.sign({ id: 3, role: "user" }, JWT_SECRET, { expiresIn: "1h" });
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 3, email: "me@test.com", name: "Me", role: "user" }] } as any);
    const res = await request(app)
      .get("/api/classifieds/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 3, email: "me@test.com" });
  });

  it("returns 401 when user does not exist in DB", async () => {
    const token = jwt.sign({ id: 999, role: "user" }, JWT_SECRET, { expiresIn: "1h" });
    mockQuery.mockResolvedValueOnce({ rows: [] } as any);
    const res = await request(app)
      .get("/api/classifieds/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(401);
  });
});

describe("PUT /api/classifieds/auth/me", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).put("/api/classifieds/auth/me").send({ name: "New" });
    expect(res.status).toBe(401);
  });

  it("returns 400 if name is empty", async () => {
    const token = jwt.sign({ id: 1, role: "user" }, JWT_SECRET, { expiresIn: "1h" });
    const res = await request(app)
      .put("/api/classifieds/auth/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "  " });
    expect(res.status).toBe(400);
  });

  it("updates and returns user on valid name", async () => {
    const token = jwt.sign({ id: 1, role: "user" }, JWT_SECRET, { expiresIn: "1h" });
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, email: "u@t.com", name: "Updated", role: "user" }] } as any);
    const res = await request(app)
      .put("/api/classifieds/auth/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated");
  });
});
