import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { createTestApp } from "./helpers/app.js";
import { pool } from "@workspace/db";

const JWT_SECRET = process.env.SESSION_SECRET || "fallback-secret-change-me";
const app = createTestApp();
const mockQuery = vi.mocked(pool.query);

function userToken(id = 1, role = "user") {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "1h" });
}
function adminToken() {
  return jwt.sign({ id: 1, role: "admin" }, JWT_SECRET, { expiresIn: "1h" });
}

beforeEach(() => {
  mockQuery.mockReset();
});

describe("GET /api/classifieds/profiles (public list)", () => {
  it("returns profiles and total count", async () => {
    const mockProfiles = [
      { id: 1, title: "Priya VIP", name: "Priya", area_slug: "peelamedu", status: "approved", effective_priority: 30 },
    ];
    mockQuery
      .mockResolvedValueOnce({ rows: mockProfiles } as any)
      .mockResolvedValueOnce({ rows: [{ count: "1" }] } as any);
    const res = await request(app).get("/api/classifieds/profiles");
    expect(res.status).toBe(200);
    expect(res.body.profiles).toHaveLength(1);
    expect(res.body.total).toBe(1);
    expect(res.body.profiles[0].title).toBe("Priya VIP");
  });

  it("filters by area_slug query parameter", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] } as any)
      .mockResolvedValueOnce({ rows: [{ count: "0" }] } as any);
    const res = await request(app).get("/api/classifieds/profiles?area_slug=peelamedu");
    expect(res.status).toBe(200);
    const call = mockQuery.mock.calls[0];
    expect(call[1]).toContain("peelamedu");
  });

  it("returns empty profiles array when none exist", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] } as any)
      .mockResolvedValueOnce({ rows: [{ count: "0" }] } as any);
    const res = await request(app).get("/api/classifieds/profiles");
    expect(res.status).toBe(200);
    expect(res.body.profiles).toEqual([]);
    expect(res.body.total).toBe(0);
  });
});

describe("GET /api/classifieds/profiles/stats", () => {
  it("returns stats with total, approved, and byArea", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ count: "10" }] } as any)
      .mockResolvedValueOnce({ rows: [{ count: "7" }] } as any)
      .mockResolvedValueOnce({ rows: [{ area: "Peelamedu", area_slug: "peelamedu", count: "5" }] } as any);
    const res = await request(app).get("/api/classifieds/profiles/stats");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(10);
    expect(res.body.approved).toBe(7);
    expect(res.body.byArea).toHaveLength(1);
  });
});

describe("POST /api/classifieds/profiles (create listing)", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).post("/api/classifieds/profiles").send({ title: "Test" });
    expect(res.status).toBe(401);
  });

  it("returns 400 if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/classifieds/profiles")
      .set("Authorization", `Bearer ${userToken()}`)
      .send({ title: "Test" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it("creates a profile and returns pending status", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ count: "0" }] } as any)
      .mockResolvedValueOnce({ rows: [{ id: 10, title: "Priya", status: "pending" }] } as any);
    const res = await request(app)
      .post("/api/classifieds/profiles")
      .set("Authorization", `Bearer ${userToken()}`)
      .send({ title: "Priya Escort", name: "Priya", location_id: 2 });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("pending");
  });

  it("returns 403 FREE_LIMIT_REACHED for second listing without boost", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ count: "1" }] } as any)
      .mockResolvedValueOnce({ rows: [{ count: "0" }] } as any);
    const res = await request(app)
      .post("/api/classifieds/profiles")
      .set("Authorization", `Bearer ${userToken()}`)
      .send({ title: "Second Listing", name: "Rekha", location_id: 2 });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FREE_LIMIT_REACHED");
  });

  it("allows second listing if user has active boost", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ count: "1" }] } as any)
      .mockResolvedValueOnce({ rows: [{ count: "1" }] } as any)
      .mockResolvedValueOnce({ rows: [{ id: 11, title: "Second OK", status: "pending" }] } as any);
    const res = await request(app)
      .post("/api/classifieds/profiles")
      .set("Authorization", `Bearer ${userToken()}`)
      .send({ title: "Second OK", name: "Nisha", location_id: 2 });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("pending");
  });

  it("admin can create listings without any limit", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 12, title: "Admin Created", status: "pending" }] } as any);
    const res = await request(app)
      .post("/api/classifieds/profiles")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ title: "Admin Created", name: "Admin", location_id: 1 });
    expect(res.status).toBe(200);
  });
});

describe("GET /api/classifieds/profiles/mine", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/classifieds/profiles/mine");
    expect(res.status).toBe(401);
  });

  it("returns user's own profiles", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, title: "My Profile" }] } as any);
    const res = await request(app)
      .get("/api/classifieds/profiles/mine")
      .set("Authorization", `Bearer ${userToken(5)}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("My Profile");
  });
});

describe("DELETE /api/classifieds/profiles/:id", () => {
  it("returns 403 if profile is not owned by user", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as any);
    const res = await request(app)
      .delete("/api/classifieds/profiles/99")
      .set("Authorization", `Bearer ${userToken()}`);
    expect(res.status).toBe(403);
  });

  it("deletes the profile if owned by user", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 99 }] } as any)
      .mockResolvedValueOnce({ rows: [] } as any);
    const res = await request(app)
      .delete("/api/classifieds/profiles/99")
      .set("Authorization", `Bearer ${userToken()}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("Admin: GET /api/classifieds/profiles/admin/all", () => {
  it("returns 403 for non-admin user", async () => {
    const res = await request(app)
      .get("/api/classifieds/profiles/admin/all")
      .set("Authorization", `Bearer ${userToken()}`);
    expect(res.status).toBe(403);
  });

  it("returns all profiles for admin", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 1 }, { id: 2 }] } as any)
      .mockResolvedValueOnce({ rows: [{ count: "2" }] } as any);
    const res = await request(app)
      .get("/api/classifieds/profiles/admin/all")
      .set("Authorization", `Bearer ${adminToken()}`);
    expect(res.status).toBe(200);
    expect(res.body.profiles).toHaveLength(2);
    expect(res.body.total).toBe(2);
  });
});

describe("Admin: PUT /api/classifieds/profiles/admin/:id/approve", () => {
  it("approves a profile and builds its full_url", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 5, slug: "priya-escort", location_id: 2 }] } as any)
      .mockResolvedValueOnce({ rows: [{ id: 2, url_base: "escorts/peelamedu" }] } as any)
      .mockResolvedValueOnce({ rows: [{ id: 5, status: "approved", full_url: "escorts/peelamedu/priya-escort" }] } as any);
    const res = await request(app)
      .put("/api/classifieds/profiles/admin/5/approve")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("approved");
    expect(res.body.full_url).toContain("priya-escort");
  });
});

describe("Admin: PUT /api/classifieds/profiles/admin/:id/reject", () => {
  it("rejects a profile with a reason", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 3, status: "rejected", rejection_reason: "Fake photos" }],
    } as any);
    const res = await request(app)
      .put("/api/classifieds/profiles/admin/3/reject")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ reason: "Fake photos" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("rejected");
    expect(res.body.rejection_reason).toBe("Fake photos");
  });
});
