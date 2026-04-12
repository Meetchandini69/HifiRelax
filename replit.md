# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### chennai-agency (React + Vite)
- **Path**: `artifacts/chennai-agency/`
- **Preview**: `/` (root)
- **Purpose**: SEO-optimized landing page for "Chennai Call Girls Services Agency"
- **Sections**: Hero, About, Benefits (8-grid), Services, Escort Categories, CTA Banner, Locations (5 areas), Featured Profiles, Hiring Process, FAQ accordion, Keyword-rich Footer
- **Design**: Mobile-first, deep rose/pink premium palette, sticky navbar, repeated CTAs, placeholder Unsplash images

### classifieds (React + Vite + Express API)
- **Path**: `artifacts/classifieds/` (frontend), `artifacts/api-server/` (API)
- **Preview**: `/classifieds/`
- **Purpose**: Full-stack dynamic escort classifieds platform
- **Features**:
  - **SEO silo URLs**: `/:state_slug` → `/escorts/:city_slug` → `/escorts/:area_slug` → `/escorts/:area_slug/:profile_slug`
  - **User panel**: Register, login, post profile, dashboard, image cropper (3:4), boost ads
  - **Admin panel**: Overview, Listings (approve/reject/verify), Locations, Boosts, **Users**, Settings
  - **Ad Boost system**: top_ad/featured tiers (1w/2w/1m pricing); ⭐ Trending badge; Gallery Boost addon; stacking by `boost_approved_at`; user request flow + admin approve/reject; Manage Plans tab
  - **Settings panel**: 5 tabs — Profile, SEO/URL Master, Header & Footer, Theme (8 colors via `--ec-primary` CSS var), Users
  - **Footer**: settings-driven with links, about text, copyright, contact
  - **Account types**: agent (3 listings, 3 photos) / independent (1 listing, 1 photo) chosen at registration
  - **Math captcha** on registration form
  - **Edit-after-approve**: any edit resets status to `pending` for re-approval
  - **Verified badge**: blue ✓ badge on listing cards; admin can toggle via Verify button in Listings panel
  - **Admin user management**: list, create, edit role/account_type/status, delete users at `/admin/users`
  - **Role-based limits**: admin/supervisor=unlimited; agent=3 profiles max; independent=1 profile max; `/profiles/my-limits` endpoint
- **DB tables**: `ec_users` (incl. `account_type`), `ec_profiles` (incl. `verified`), `ec_locations`, `ec_settings`, `ec_boost_plans`, `ec_boost_plan_tiers`, `ec_boost_requests`
- **Admin login**: `admin@eliteescorts.in` / `Admin@1234`
- **API base**: `/classifieds/api/` (proxied to port 8080)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
