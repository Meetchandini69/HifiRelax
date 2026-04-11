import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { createTestApp } from "./helpers/app.js";
import { pool } from "@workspace/db";

const JWT_SECRET = process.env.SESSION_SECRET || "fallback-secret-change-me";
const app = createTestApp();
const mockQuery = vi.mocked(pool.query);

function adminToken() {
  return jwt.sign({ id: 1, role: "admin" }, JWT_SECRET, { expiresIn: "1h" });
}
function userToken() {
  return jwt.sign({ id: 2, role: "user" }, JWT_SECRET, { expiresIn: "1h" });
}

beforeEach(() => {
  mockQuery.mockReset();
});

describe("GET /api/classifieds/page-content (public)", () => {
  it("returns null when page_key is missing", async () => {
    const res = await request(app).get("/api/classifieds/page-content");
    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });

  it("returns null when page_key has no content", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as any);
    const res = await request(app).get("/api/classifieds/page-content?page_key=area_nonexistent");
    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });

  it("returns content for a known page_key", async () => {
    const mockContent = {
      id: 1, page_key: "area_peelamedu", page_type: "area",
      content_heading: "Escorts in Peelamedu",
      content_html: "<p>Great escorts here</p>",
      faq_json: [{ q: "Q1", a: "A1" }],
    };
    mockQuery.mockResolvedValueOnce({ rows: [mockContent] } as any);
    const res = await request(app).get("/api/classifieds/page-content?page_key=area_peelamedu");
    expect(res.status).toBe(200);
    expect(res.body.content_heading).toBe("Escorts in Peelamedu");
    expect(res.body.faq_json).toHaveLength(1);
  });
});

describe("POST /api/classifieds/page-content/admin/upsert", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).post("/api/classifieds/page-content/admin/upsert").send({
      page_key: "area_test",
    });
    expect(res.status).toBe(401);
  });

  it("returns 403 for non-admin user", async () => {
    const res = await request(app)
      .post("/api/classifieds/page-content/admin/upsert")
      .set("Authorization", `Bearer ${userToken()}`)
      .send({ page_key: "area_test" });
    expect(res.status).toBe(403);
  });

  it("returns 400 if page_key is missing", async () => {
    const res = await request(app)
      .post("/api/classifieds/page-content/admin/upsert")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ content_heading: "No Key" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/page_key/i);
  });

  it("upserts and returns the page content record", async () => {
    const mockRecord = {
      id: 5, page_key: "area_peelamedu", page_type: "area",
      content_heading: "Escorts in Peelamedu",
      content_html: "<p>Content</p>",
      faq_json: [],
    };
    mockQuery.mockResolvedValueOnce({ rows: [mockRecord] } as any);
    const res = await request(app)
      .post("/api/classifieds/page-content/admin/upsert")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({
        page_key: "area_peelamedu",
        page_type: "area",
        content_heading: "Escorts in Peelamedu",
        content_html: "<p>Content</p>",
        faq_json: [],
      });
    expect(res.status).toBe(200);
    expect(res.body.page_key).toBe("area_peelamedu");
    expect(res.body.content_heading).toBe("Escorts in Peelamedu");
  });

  it("defaults faq_json to empty array when not provided", async () => {
    const mockRecord = { id: 6, page_key: "state_tamilnadu", faq_json: [] };
    mockQuery.mockResolvedValueOnce({ rows: [mockRecord] } as any);
    const res = await request(app)
      .post("/api/classifieds/page-content/admin/upsert")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ page_key: "state_tamilnadu" });
    expect(res.status).toBe(200);
    const call = mockQuery.mock.calls[0];
    expect(call[1]).toContain("[]");
  });
});

describe("GET /api/classifieds/page-content/admin/list", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/classifieds/page-content/admin/list");
    expect(res.status).toBe(401);
  });

  it("returns all page content records for admin", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: 1, page_key: "listings_all" },
        { id: 2, page_key: "state_tamilnadu" },
      ],
    } as any);
    const res = await request(app)
      .get("/api/classifieds/page-content/admin/list")
      .set("Authorization", `Bearer ${adminToken()}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe("DELETE /api/classifieds/page-content/admin/:id", () => {
  it("returns 403 for non-admin", async () => {
    const res = await request(app)
      .delete("/api/classifieds/page-content/admin/1")
      .set("Authorization", `Bearer ${userToken()}`);
    expect(res.status).toBe(403);
  });

  it("deletes a page content record", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as any);
    const res = await request(app)
      .delete("/api/classifieds/page-content/admin/1")
      .set("Authorization", `Bearer ${adminToken()}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
