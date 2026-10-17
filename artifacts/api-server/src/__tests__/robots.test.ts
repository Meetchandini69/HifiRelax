import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { pool } from "@workspace/db";
import { robotsRouter } from "../routes/robots.js";
import { settingsRouter } from "../routes/classifieds/settings.js";

vi.mock("fs", () => ({ writeFileSync: vi.fn(), mkdirSync: vi.fn(), existsSync: () => true, readdirSync: () => [], unlinkSync: vi.fn() }));
const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(robotsRouter);
app.use("/settings", settingsRouter);
app.get("/robots.txt", (_req, res) => { res.type("text/plain").send("static fallback"); });
const query = vi.mocked(pool.query);
const auth = `Bearer ${jwt.sign({ id: 1, role: "admin" }, process.env.SESSION_SECRET || "fallback-secret-change-me")}`;
beforeEach(() => query.mockReset());
describe("robots.txt", () => {
  it("serves saved text with a plain-text content type", async () => {
    query.mockResolvedValueOnce({ rows: [{ value: "User-agent: *\nDisallow: /private" }] } as any);
    const result = await request(app).get("/robots.txt");
    expect(result.status).toBe(200);
    expect(result.headers["content-type"]).toContain("text/plain");
    expect(result.text).toBe("User-agent: *\nDisallow: /private");
  });
  it("preserves the static fallback when nothing has been saved", async () => {
    query.mockResolvedValueOnce({ rows: [] } as any);
    expect((await request(app).get("/robots.txt")).text).toBe("static fallback");
  });
  it("serves intentionally empty content", async () => {
    query.mockResolvedValueOnce({ rows: [{ value: "" }] } as any);
    expect((await request(app).get("/robots.txt")).text).toBe("");
  });
  it("returns a temporary failure on database errors", async () => {
    query.mockRejectedValueOnce(new Error("offline"));
    expect((await request(app).get("/robots.txt")).status).toBe(503);
  });
  it("requires admin authentication to save", async () => {
    expect((await request(app).post("/settings/seo-files").send({ robots_txt: "text" })).status).toBe(401);
    expect(query).not.toHaveBeenCalled();
  });
  it.each([123, "a\0b", "x".repeat(500001)])("rejects invalid content", async robots_txt => {
    expect((await request(app).post("/settings/seo-files").set("Authorization", auth).send({ robots_txt })).status).toBe(400);
    expect(query).not.toHaveBeenCalled();
  });
  it("persists uploaded text after removing its BOM", async () => {
    query.mockResolvedValue({ rows: [] } as any);
    const result = await request(app).post("/settings/seo-files").set("Authorization", auth).send({ robots_txt: "\uFEFFUser-agent: *" });
    expect(result.status).toBe(200);
    expect(query).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO ec_settings"), ["robots_txt", "User-agent: *"]);
  });
  it("leaves robots untouched when saving unrelated SEO files", async () => {
    query.mockResolvedValue({ rows: [] } as any);
    await request(app).post("/settings/seo-files").set("Authorization", auth).send({ sitemap_xml: "" });
    expect(query.mock.calls.some(call => (call[1] as string[])[0] === "robots_txt")).toBe(false);
  });
});
