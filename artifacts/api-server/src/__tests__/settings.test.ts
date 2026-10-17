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

describe("GET /api/classifieds/settings/public", () => {
  it("returns only safe public settings keys", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { key: "site_name", value: "EliteEscorts" },
        { key: "site_tagline", value: "Tamil Nadu No.1 Escorts" },
        { key: "watermark_text", value: "EliteEscorts.in" },
        { key: "seo_home_title", value: "Best Escorts TN" },
        { key: "admin_email", value: "admin@secret.com" },
        { key: "theme_color", value: "#e11d48" },
        { key: "footer_link_groups", value: "[]" },
        { key: "footer_logo_url", value: "/footer-logo.svg" },
        { key: "footer_badge_image_url", value: "/adult-badge.png" },
      ],
    } as any);
    const res = await request(app).get("/api/classifieds/settings/public");
    expect(res.status).toBe(200);
    expect(res.body.site_name).toBe("EliteEscorts");
    expect(res.body.watermark_text).toBe("EliteEscorts.in");
    expect(res.body.seo_home_title).toBe("Best Escorts TN");
    expect(res.body.theme_color).toBe("#e11d48");
    expect(res.body.footer_link_groups).toBe("[]");
    expect(res.body.footer_logo_url).toBe("/footer-logo.svg");
    expect(res.body.footer_badge_image_url).toBe("/adult-badge.png");
    expect(res.body.admin_email).toBeUndefined();
  });

  it("exposes all seo_* prefixed keys", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { key: "seo_home_title", value: "Home Title" },
        { key: "seo_home_desc", value: "Home Desc" },
        { key: "seo_city_coimbatore", value: "CBE" },
      ],
    } as any);
    const res = await request(app).get("/api/classifieds/settings/public");
    expect(res.status).toBe(200);
    expect(Object.keys(res.body).filter(k => k.startsWith("seo_"))).toHaveLength(3);
  });
});

describe("GET /api/classifieds/settings (admin all settings)", () => {
  it("returns 403 for non-admin", async () => {
    const res = await request(app)
      .get("/api/classifieds/settings")
      .set("Authorization", `Bearer ${userToken()}`);
    expect(res.status).toBe(403);
  });

  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/classifieds/settings");
    expect(res.status).toBe(401);
  });

  it("returns all settings for admin", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { key: "site_name", value: "EliteEscorts" },
        { key: "admin_email", value: "admin@secret.com" },
        { key: "watermark_text", value: "EliteEscorts.in" },
      ],
    } as any);
    const res = await request(app)
      .get("/api/classifieds/settings")
      .set("Authorization", `Bearer ${adminToken()}`);
    expect(res.status).toBe(200);
    expect(res.body.site_name).toBe("EliteEscorts");
    expect(res.body.admin_email).toBe("admin@secret.com");
  });
});

describe("PUT /api/classifieds/settings (admin bulk update)", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).put("/api/classifieds/settings").send({ site_name: "Test" });
    expect(res.status).toBe(401);
  });

  it("returns 403 for non-admin", async () => {
    const res = await request(app)
      .put("/api/classifieds/settings")
      .set("Authorization", `Bearer ${userToken()}`)
      .send({ site_name: "Hacked" });
    expect(res.status).toBe(403);
  });

  it("updates settings and returns success", async () => {
    mockQuery.mockResolvedValue({ rows: [] } as any);
    const res = await request(app)
      .put("/api/classifieds/settings")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ site_name: "NewName", watermark_text: "NewWM" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockQuery).toHaveBeenCalledTimes(2);
  });

  it("generates sitemap URLs for custom pages and published blog posts", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ key: "site_url", value: "https://example.com/" }] } as any)
      .mockResolvedValueOnce({ rows: [{ state: "Tamil Nadu", city: "Chennai", area: "T & Nagar", state_slug: "tamil-nadu", city_slug: "chennai", area_slug: "t-nagar" }] } as any)
      .mockResolvedValueOnce({ rows: [{ slug: "profile-one", area_slug: "t-nagar" }] } as any)
      .mockResolvedValueOnce({ rows: [{ page_name: "Privacy & Terms", slug_ref: "privacy-policy" }] } as any)
      .mockResolvedValueOnce({ rows: [{ title: "A & B", slug: "a-b" }] } as any);

    const res = await request(app)
      .get("/api/classifieds/settings/generate-sitemap")
      .set("Authorization", `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.sitemap_xml).toContain("<loc>https://example.com/pages/privacy-policy</loc>");
    expect(res.body.sitemap_xml).toContain("<loc>https://example.com/blog/a-b</loc>");
    expect(res.body.sitemap_xml).toContain("https://example.com/escorts/t-nagar/profile-one");
    expect(res.body.sitemap_xml).not.toMatch(/localhost|yourdomain\.com|<lastmod>/);
    expect(res.body.sitemap_html).toContain("Privacy &amp; Terms");
    expect(res.body.stats.customPages).toBe(1);
    expect(res.body.stats.blogPosts).toBe(1);
  });
});

describe("GET /api/classifieds/settings/users (admin list users)", () => {
  it("returns 403 for non-admin", async () => {
    const res = await request(app)
      .get("/api/classifieds/settings/users")
      .set("Authorization", `Bearer ${userToken()}`);
    expect(res.status).toBe(403);
  });

  it("returns all users for admin", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: 1, name: "Admin", email: "admin@test.com", role: "admin", profile_count: "0" },
        { id: 2, name: "User", email: "user@test.com", role: "user", profile_count: "2" },
      ],
    } as any);
    const res = await request(app)
      .get("/api/classifieds/settings/users")
      .set("Authorization", `Bearer ${adminToken()}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].role).toBe("admin");
  });
});

describe("DELETE /api/classifieds/settings/users/:id (admin delete user)", () => {
  it("returns 400 when admin tries to delete their own account", async () => {
    const res = await request(app)
      .delete("/api/classifieds/settings/users/1")
      .set("Authorization", `Bearer ${adminToken()}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/own account/i);
  });

  it("deletes user and their profiles", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] } as any)
      .mockResolvedValueOnce({ rows: [] } as any);
    const res = await request(app)
      .delete("/api/classifieds/settings/users/99")
      .set("Authorization", `Bearer ${adminToken()}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(String(mockQuery.mock.calls[0][1])).toContain("99");
  });
});
