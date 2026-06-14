---
name: Express 5 SSR catch-all pattern
description: How to serve SSR-injected HTML for all SPA routes in Express 5, including the root path.
---

## Rule
Use `app.use(async (req, res, next) => { ... })` (no path argument) for the HTML catch-all, NOT `app.get("/*splat", ...)`.

**Why:** Express 5 uses path-to-regexp v8 which requires named wildcards (`/*splat`), but `/*splat` does NOT reliably match the bare root path `/`. `app.use()` with no path prefix matches every request that reaches it, including `/`.

**How to apply:**
- Place `app.use(...)` AFTER all API routers and `express.static(...)` middleware.
- Inside the handler, check `req.method !== "GET"` and `call next()` for non-GET requests.
- Skip asset paths with `/\.[a-z0-9]{1,8}$/i.test(req.path)` → `next()`.
- The same approach applies for any Express 5 SPA with SSR metadata injection.
