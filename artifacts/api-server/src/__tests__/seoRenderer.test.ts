import { beforeEach, describe, expect, it, vi } from "vitest";
import { pool } from "@workspace/db";
import request from "supertest";

vi.mock("fs", () => ({
  existsSync: () => true,
  readFileSync: () => `<!doctype html><html><head><link rel="canonical" href="https://build.example/"><title>Default</title><meta name="description"><meta name="robots"><link rel="canonical"><meta property="og:title"><meta property="og:description"><meta property="og:url"><meta property="og:site_name"><meta property="og:image"><meta name="twitter:title"><meta name="twitter:description"><meta name="twitter:image"></head><body><div id="root"></div></body></html>`,
}));

import { invalidateSettingsCache, renderWithMeta } from "../lib/seoRenderer.js";
import app from "../app.js";

const query = vi.mocked(pool.query);

beforeEach(() => {
  invalidateSettingsCache();
  query.mockReset();
  query.mockResolvedValueOnce({
    rows: [
      { key: "site_name", value: "Example Site" },
      { key: "site_url", value: "https://example.com/" },
    ],
  } as any);
});

describe("server-rendered SEO metadata", () => {
  it("uses custom-page title, content description, and absolute canonical URL", async () => {
    query.mockResolvedValueOnce({
      rows: [{
        page_name: `Privacy & "Terms"`,
        content_heading: "Privacy",
        content_html: "<p>How we use &amp; protect your information.</p>",
        content_sections: [],
      }],
    } as any);

    const result = await renderWithMeta("/pages/privacy-policy");

    expect(result?.statusCode).toBe(200);
    expect(result?.html).toContain('<title>Privacy &amp; "Terms" | Example Site</title>');
    expect(result?.html).toContain('property="og:title" content="Privacy &amp; &quot;Terms&quot; | Example Site"');
    expect(result?.html).toContain('content="How we use &amp; protect your information."');
    expect(result?.html).toContain('href="https://example.com/pages/privacy-policy"');
  });

  it("prefers custom-page SEO fields when set", async () => {
    query.mockResolvedValueOnce({
      rows: [{
        page_name: "Privacy Policy",
        content_heading: "Privacy",
        content_html: "<p>Page content.</p>",
        content_sections: [],
        meta_title: "Privacy information",
        meta_description: "How your information is handled.",
      }],
    } as any);
    const result = await renderWithMeta("/pages/privacy-policy");
    expect(result?.html).toContain("<title>Privacy information</title>");
    expect(result?.html).toContain('content="How your information is handled."');
  });

  it("uses the per-article meta title and description", async () => {
    query.mockResolvedValueOnce({
      rows: [{
        title: "Default article title",
        excerpt: "Default excerpt",
        cover_image_url: "",
        meta_title: "Search result title",
        meta_description: "Search result description.",
      }],
    } as any);
    const result = await renderWithMeta("/blog/article-slug");
    expect(result?.html).toContain("<title>Search result title</title>");
    expect(result?.html).toContain('content="Search result description."');
  });

  it("uses configured SEO metadata for the blog index", async () => {
    invalidateSettingsCache();
    query.mockReset();
    query.mockResolvedValueOnce({
      rows: [
        { key: "site_name", value: "Example Site" },
        { key: "site_url", value: "https://example.com" },
        { key: "seo_blog_title", value: "Wellness Articles" },
        { key: "seo_blog_desc", value: "Guides for everyday wellbeing." },
      ],
    } as any);
    const result = await renderWithMeta("/blog");
    expect(result?.html).toContain("<title>Wellness Articles | Example Site</title>");
    expect(result?.html).toContain('content="Guides for everyday wellbeing."');
  });

  it("uses per-listing SEO metadata", async () => {
    query.mockResolvedValueOnce({
      rows: [{
        title: "Default listing",
        name: "Priya",
        age: 28,
        services: [],
        area: "T Nagar",
        city: "Chennai",
        state: "Tamil Nadu",
        meta_title: "Listing search title",
        meta_description: "Listing search description.",
      }],
    } as any);
    const result = await renderWithMeta("/escorts/t-nagar/listing-slug");
    expect(result?.html).toContain("<title>Listing search title</title>");
    expect(result?.html).toContain('content="Listing search description."');
  });

  it("marks private pages noindex in both metadata and response directives", async () => {
    const result = await renderWithMeta("/admin/settings");

    expect(result?.statusCode).toBe(200);
    expect(result?.robots).toBe("noindex, nofollow");
    expect(result?.html).toContain('<meta name="robots" content="noindex, nofollow" />');
  });

  it("renders admin-configured canonical, robots, and JSON-LD in the initial HTML", async () => {
    invalidateSettingsCache();
    query.mockReset();
    query
      .mockResolvedValueOnce({
        rows: [
          { key: "site_name", value: "Example Site" },
          { key: "site_url", value: "https://example.com" },
          { key: "seo_custom_privacy-policy_canonical", value: "/legal/privacy" },
          { key: "seo_custom_privacy-policy_robots", value: "noindex, follow" },
          { key: "seo_custom_privacy-policy_schema", value: '{"@context":"https://schema.org","@type":"WebPage","name":"Privacy"}' },
        ],
      } as any)
      .mockResolvedValueOnce({
        rows: [{
          page_name: "Privacy Policy",
          content_heading: "Privacy",
          content_html: "<p>Our privacy practices.</p>",
          content_sections: [],
        }],
      } as any);

    const result = await renderWithMeta("/pages/privacy-policy");

    expect(result?.robots).toBe("noindex, follow");
    expect(result?.html).toContain('href="https://example.com/legal/privacy"');
    expect(result?.html).toContain('<meta name="robots" content="noindex, follow" />');
    expect(result?.html).toContain('<script type="application/ld+json" data-seo-schema="1">');
    expect(result?.html).toContain('"@type":"WebPage"');
  });

  it("returns a noindex 404 for unknown paths", async () => {
    query.mockResolvedValueOnce({ rows: [] } as any);

    const result = await renderWithMeta("/not-a-real-page");

    expect(result?.statusCode).toBe(404);
    expect(result?.robots).toBe("noindex, nofollow");
  });

  it("sends matching noindex headers and 404 status to crawlers", async () => {
    query.mockResolvedValueOnce({ rows: [] } as any);

    const result = await request(app).get("/not-a-real-page");

    expect(result.status).toBe(404);
    expect(result.headers["x-robots-tag"]).toBe("noindex, nofollow");
    expect(result.text).toContain('<meta name="robots" content="noindex, nofollow" />');
  });

  it("serves a generated sitemap when no sitemap has been configured", async () => {
    invalidateSettingsCache();
    query.mockReset();
    query
      .mockResolvedValueOnce({ rows: [] } as any)
      .mockResolvedValueOnce({ rows: [{ key: "site_url", value: "https://example.com" }] } as any)
      .mockResolvedValueOnce({ rows: [] } as any)
      .mockResolvedValueOnce({ rows: [] } as any)
      .mockResolvedValueOnce({ rows: [{ page_name: "Privacy Policy", slug_ref: "privacy-policy" }] } as any)
      .mockResolvedValueOnce({ rows: [{ title: "Article", slug: "article" }] } as any);

    const result = await request(app).get("/sitemap.xml");

    expect(result.status).toBe(200);
    expect(result.headers["content-type"]).toContain("application/xml");
    expect(result.text).toContain("<loc>https://example.com/pages/privacy-policy</loc>");
    expect(result.text).toContain("<loc>https://example.com/blog/article</loc>");
  });

  it("refreshes legacy auto-generated sitemaps instead of serving stale dates or hosts", async () => {
    invalidateSettingsCache();
    query.mockReset();
    query
      .mockResolvedValueOnce({
        rows: [{ key: "sitemap_xml", value: "<urlset><url><lastmod>2026-07-20</lastmod><changefreq>weekly</changefreq><priority>0.8</priority><loc>http://localhost:3000/</loc></url></urlset>" }],
      } as any)
      .mockResolvedValueOnce({ rows: [{ key: "site_url", value: "https://example.com" }] } as any)
      .mockResolvedValueOnce({ rows: [] } as any)
      .mockResolvedValueOnce({ rows: [] } as any)
      .mockResolvedValueOnce({ rows: [] } as any)
      .mockResolvedValueOnce({ rows: [] } as any);

    const result = await request(app).get("/sitemap.xml");

    expect(result.status).toBe(200);
    expect(result.text).toContain("<loc>https://example.com/</loc>");
    expect(result.text).not.toMatch(/localhost|<lastmod>|yourdomain\.com/);
  });
});
