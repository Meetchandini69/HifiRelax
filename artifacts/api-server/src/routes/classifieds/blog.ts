import { Router, type Response } from "express";
import { pool } from "@workspace/db";
import { requireAdmin } from "./middleware.js";
import sanitizeHtml from "sanitize-html";
import { logger } from "../../lib/logger.js";
import { randomUUID } from "crypto";

export const blogRouter = Router();
const summaryColumns = "id, title, slug, excerpt, category, cover_image_url, status, published_at, created_at, updated_at";
const contentSanitizer = {
  allowedTags: [
    "a", "article", "blockquote", "br", "caption", "code", "dd", "div", "dl", "dt",
    "em", "figcaption", "figure", "h2", "h3", "h4", "h5", "h6", "hr", "i", "img",
    "li", "ol", "p", "pre", "section", "strong", "table", "tbody", "td", "th",
    "thead", "tr", "u", "ul",
  ],
  allowedAttributes: {
    a: ["href", "name", "target", "title", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan", "scope"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
  },
};

function parsePost(body: unknown) {
  if (!body || typeof body !== "object") throw new Error("Article details are required");
  const input = body as Record<string, unknown>;
  const read = (key: string, max: number, required = false) => {
    const value = input[key] ?? "";
    if (typeof value !== "string" || value.length > max || (required && !value.trim())) {
      throw new Error(`${key.replaceAll("_", " ")} ${required ? "is required and " : ""}must be text up to ${max} characters`);
    }
    return value.trim();
  };
  const title = read("title", 200, true);
  const slug = read("slug", 200, true);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Slug must use lowercase letters, numbers and hyphens");
  if (slug === "admin") throw new Error("This slug is reserved; choose another article slug");
  const excerpt = read("excerpt", 500);
  const rawContent = read("content", 100000, true);
  if (rawContent.includes("\0")) throw new Error("content must not contain null characters");
  const content = sanitizeHtml(rawContent, contentSanitizer);
  const category = read("category", 50, true);
  if (!["Health", "Lifestyle", "Relationships"].includes(category)) throw new Error("Choose a valid category");
  const status = read("status", 20, true);
  if (!["draft", "published"].includes(status)) throw new Error("Choose draft or published");
  const cover = read("cover_image_url", 2000);
  if (cover) {
    let url: URL;
    try { url = new URL(cover); } catch { throw new Error("Cover image must be an HTTP or HTTPS URL"); }
    if (!["https:", "http:"].includes(url.protocol)) throw new Error("Cover image must be an HTTP or HTTPS URL");
  }
  return [title, slug, excerpt, content, category, cover, status];
}

blogRouter.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

blogRouter.get("/", async (req, res) => {
  const limit = Number(req.query.limit ?? 12);
  const offset = Number(req.query.offset ?? 0);
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 50 || !Number.isSafeInteger(offset) || offset < 0) {
    return res.status(400).json({ error: "Invalid pagination" });
  }
  const result = await pool.query(
    `SELECT ${summaryColumns} FROM ec_blog_posts WHERE status='published' ORDER BY published_at DESC, id DESC LIMIT $1 OFFSET $2`,
    [limit + 1, offset],
  );
  return res.json({ posts: result.rows.slice(0, limit), hasMore: result.rows.length > limit });
});

blogRouter.get("/admin", requireAdmin, async (_req, res) => {
  const result = await pool.query("SELECT * FROM ec_blog_posts ORDER BY updated_at DESC, id DESC");
  res.json(result.rows.map((post: Record<string, unknown>) => ({
    ...post,
    content: sanitizeHtml(String(post.content || ""), contentSanitizer),
  })));
});

blogRouter.post("/admin", requireAdmin, async (req, res) => {
  let values: string[];
  try { values = parsePost(req.body); } catch (error) { return res.status(400).json({ error: (error as Error).message }); }
  try {
    const result = await pool.query(
      `INSERT INTO ec_blog_posts (title, slug, excerpt, content, category, cover_image_url, status, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,CASE WHEN $7='published' THEN NOW() ELSE NULL END) RETURNING *`, values,
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if ((error as { code?: string }).code === "23505") return res.status(409).json({ error: "This slug is already used by another article" });
    return respondToSaveError(error, res, "create", values[1]);
  }
});

blogRouter.put("/admin/:id", requireAdmin, async (req, res) => {
  if (!/^[1-9]\d*$/.test(String(req.params.id))) return res.status(400).json({ error: "Invalid article ID" });
  let values: string[];
  try { values = parsePost(req.body); } catch (error) { return res.status(400).json({ error: (error as Error).message }); }
  try {
    const result = await pool.query(
      `UPDATE ec_blog_posts SET title=$1, slug=$2, excerpt=$3, content=$4, category=$5, cover_image_url=$6, status=$7,
       published_at=CASE WHEN $7='published' THEN COALESCE(published_at, NOW()) ELSE NULL END, updated_at=NOW()
       WHERE id=$8 RETURNING *`, [...values, req.params.id],
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Article not found" });
    return res.json(result.rows[0]);
  } catch (error) {
    if ((error as { code?: string }).code === "23505") return res.status(409).json({ error: "This slug is already used by another article" });
    return respondToSaveError(error, res, "update", String(req.params.id));
  }
});

blogRouter.delete("/admin/:id", requireAdmin, async (req, res) => {
  if (!/^[1-9]\d*$/.test(String(req.params.id))) return res.status(400).json({ error: "Invalid article ID" });
  const result = await pool.query("DELETE FROM ec_blog_posts WHERE id=$1 RETURNING id", [req.params.id]);
  if (!result.rows[0]) return res.status(404).json({ error: "Article not found" });
  return res.json({ ok: true });
});

blogRouter.get("/:slug", async (req, res) => {
  const result = await pool.query("SELECT * FROM ec_blog_posts WHERE slug=$1 AND status='published'", [req.params.slug]);
  if (!result.rows[0]) return res.status(404).json({ error: "Article not found" });
  return res.json({
    ...result.rows[0],
    content: sanitizeHtml(String(result.rows[0].content || ""), contentSanitizer),
  });
});

function respondToSaveError(error: unknown, res: Response, operation: string, articleRef: string) {
  const code = (error as { code?: string })?.code;
  const errorId = randomUUID();
  logger.error({ err: error, errorId, operation, articleRef, databaseCode: code }, "Blog article save failed");
  if (code === "42P01" || code === "42703") {
    return res.status(500).json({ error: `Blog database schema is not up to date. Restart the API so its schema migration can run, then retry. Reference: ${errorId}` });
  }
  if (code === "23514") {
    return res.status(400).json({ error: "Article category or publication status is invalid. Please review the form and retry." });
  }
  if (code === "23502") {
    return res.status(400).json({ error: `A required article field is missing. Check the article form and retry. Reference: ${errorId}` });
  }
  if (code === "42501") {
    return res.status(500).json({ error: `The blog database is missing write permission. Contact support with reference ${errorId}.` });
  }
  if (code === "22001") {
    return res.status(400).json({ error: "One of the article fields is too long. Shorten it and retry." });
  }
  const safeCode = typeof code === "string" && /^[A-Z0-9]{5}$/.test(code) ? ` Database code: ${code}.` : "";
  return res.status(500).json({ error: `Unable to save the article right now. Please retry. If this continues, contact support with reference ${errorId}.${safeCode}` });
}
