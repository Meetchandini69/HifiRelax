import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { pool } from "@workspace/db";
import { blogRouter } from "../routes/classifieds/blog.js";

const app = express();
app.use(express.json());
app.use("/blog", blogRouter);
const query = vi.mocked(pool.query);
const token = (role: string) => jwt.sign({ id: 1, role }, process.env.SESSION_SECRET || "fallback-secret-change-me");
const article = { title: "Making time together", slug: "making-time-together", excerpt: "Everyday connection", content: "Spend time listening to each other.", category: "Relationships", cover_image_url: "", status: "draft" };
beforeEach(() => query.mockReset());

describe("blog access and publishing", () => {
  it.each(["get", "post", "put", "delete"] as const)("protects admin %s operations", async method => {
    const url = ["put", "delete"].includes(method) ? "/blog/admin/1" : "/blog/admin";
    expect((await request(app)[method](url).send(article)).status).toBe(401);
    expect((await request(app)[method](url).set("Authorization", `Bearer ${token("user")}`).send(article)).status).toBe(403);
    expect(query).not.toHaveBeenCalled();
  });
  it("lists only published summaries with bounded pagination", async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 3 }, { id: 2 }, { id: 1 }, { id: 0 }] } as any);
    const res = await request(app).get("/blog?limit=3&offset=6");
    expect(res.body).toEqual({ posts: [{ id: 3 }, { id: 2 }, { id: 1 }], hasMore: true });
    expect(query).toHaveBeenCalledWith(expect.stringContaining("WHERE status='published'"), [4, 6]);
    expect(query.mock.calls[0][0]).not.toMatch(/SELECT \*/);
  });
  it.each(["limit=0", "limit=100", "offset=-1", "limit=abc", "offset=0.5"])("rejects invalid pagination %s", async params => {
    expect((await request(app).get(`/blog?${params}`)).status).toBe(400);
    expect(query).not.toHaveBeenCalled();
  });
  it("does not expose a missing or draft article", async () => {
    query.mockResolvedValueOnce({ rows: [] } as any);
    expect((await request(app).get("/blog/private-draft")).status).toBe(404);
    expect(query).toHaveBeenCalledWith(expect.stringContaining("AND status='published'"), ["private-draft"]);
  });
  it("allows an admin to read drafts", async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 1, ...article }] } as any);
    const res = await request(app).get("/blog/admin").set("Authorization", `Bearer ${token("admin")}`);
    expect(res.status).toBe(200);
    expect(res.body[0].status).toBe("draft");
  });
  it.each(["draft", "published"])("saves a new %s article", async status => {
    query.mockResolvedValueOnce({ rows: [{ id: 1, ...article, status }] } as any);
    const res = await request(app).post("/blog/admin").set("Authorization", `Bearer ${token("admin")}`).send({ ...article, status });
    expect(res.status).toBe(201);
    expect(query.mock.calls[0][1]).toEqual([article.title, article.slug, article.excerpt, article.content, article.category, "", status]);
  });
  it("unpublishes an existing article and clears its publication date", async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 1, ...article, published_at: null }] } as any);
    const res = await request(app).put("/blog/admin/1").set("Authorization", `Bearer ${token("admin")}`).send(article);
    expect(res.status).toBe(200);
    expect(query.mock.calls[0][0]).toContain("ELSE NULL END");
    expect(query.mock.calls[0][1]).toEqual(expect.arrayContaining(["draft", "1"]));
  });
  it.each([{ title: " " }, { slug: "Invalid Slug" }, { slug: "admin" }, { content: " " }, { status: "scheduled" }, { category: "unknown" }, { cover_image_url: "javascript:alert(1)" }, { excerpt: "x".repeat(501) }])("validates article input %j", async patch => {
    const res = await request(app).post("/blog/admin").set("Authorization", `Bearer ${token("admin")}`).send({ ...article, ...patch });
    expect(res.status).toBe(400);
    expect(query).not.toHaveBeenCalled();
  });
  it("reports duplicate slugs", async () => {
    query.mockRejectedValueOnce({ code: "23505" });
    const res = await request(app).post("/blog/admin").set("Authorization", `Bearer ${token("admin")}`).send(article);
    expect(res.status).toBe(409);
  });
  it("deletes an article", async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 1 }] } as any);
    const res = await request(app).delete("/blog/admin/1").set("Authorization", `Bearer ${token("admin")}`);
    expect(res.body).toEqual({ ok: true });
  });
  it("returns 404 when editing a deleted article", async () => {
    query.mockResolvedValueOnce({ rows: [] } as any);
    expect((await request(app).put("/blog/admin/1").set("Authorization", `Bearer ${token("admin")}`).send(article)).status).toBe(404);
  });
});
