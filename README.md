# EliteEscorts — Full Stack Adult Classifieds Platform

Tamil Nadu's verified escort classified platform built with React, TypeScript, Node.js, Express, and PostgreSQL.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Wouter |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL 14+ (raw SQL via `pg`) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Testing | Vitest + Supertest + Testing Library |
| Monorepo | pnpm workspaces |

---

## Prerequisites

- **Node.js** v20+ → https://nodejs.org
- **pnpm** v9+ → `npm install -g pnpm`
- **PostgreSQL** v14+ → https://postgresql.org **OR** Docker

---

## Quick Start (Local)

### Option A — With Docker (Recommended)

```bash
# 1. Start PostgreSQL (auto-creates schema + seed data)
docker compose up -d

# 2. Run setup
bash setup.sh

# 3. Edit .env — set SESSION_SECRET to a random string
nano .env

# 4. Start both servers
bash start-local.sh
```

Open: http://localhost:3000

### Option B — Without Docker

```bash
# 1. Create the database
psql -U postgres -c "CREATE DATABASE eliteescorts;"

# 2. Run schema and seed
psql -U postgres -d eliteescorts -f schema/schema.sql
psql -U postgres -d eliteescorts -f schema/seed.sql

# 3. Run setup (creates .env files)
bash setup.sh

# 4. Edit .env with your DATABASE_URL
nano .env

# 5. Start both servers
bash start-local.sh
```

---

## Environment Variables

### Root `.env`
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eliteescorts
SESSION_SECRET=your-long-random-secret-32-chars-min
PORT=8080
```

### Frontend `artifacts/classifieds/.env.local`
```env
PORT=3000
BASE_PATH=/
# Optional — for Cloudflare Pages / external API:
# VITE_API_URL=https://api.yourdomain.com
```

### API Server `artifacts/api-server/.env`
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eliteescorts
SESSION_SECRET=same-secret-as-root-env
PORT=8080
CORS_ORIGINS=http://localhost:3000
```

---

## Running Tests

```bash
# Run all tests (from project root)
pnpm test

# API server tests only
pnpm --filter @workspace/api-server run test

# Frontend component tests only
pnpm --filter @workspace/classifieds run test

# Watch mode
pnpm --filter @workspace/api-server run test:watch

# Coverage report
pnpm test:coverage
```

**96 tests total:** 63 backend (auth, profiles, page content, settings, middleware) + 33 frontend (ProfileCard, PageContentSection).

---

## Admin Panel

**URL:** http://localhost:3000/admin  
**Login:** admin@eliteescorts.in / Admin@1234

Admin features:
- Approve / reject / delete escort listings
- Manage boost plans and boost requests
- Edit site settings (name, tagline, watermark, SEO fields)
- Manage all users (activate / pause / delete)
- Edit SEO content and FAQs for every page

---

## Project Structure

```
workspace/
├── artifacts/
│   ├── api-server/            # Express REST API (port 8080)
│   │   ├── src/
│   │   │   ├── app.ts         # Express app (CORS, routes)
│   │   │   ├── index.ts       # Server entry point
│   │   │   ├── routes/classifieds/
│   │   │   │   ├── auth.ts        # Register, login, /me
│   │   │   │   ├── profiles.ts    # Listings CRUD + admin
│   │   │   │   ├── boosts.ts      # Boost plans + requests
│   │   │   │   ├── locations.ts   # State/city/area data
│   │   │   │   ├── settings.ts    # Site settings + users
│   │   │   │   ├── pageContent.ts # SEO content per page
│   │   │   │   └── middleware.ts  # JWT auth middleware
│   │   │   └── __tests__/     # Vitest unit tests (63 tests)
│   │   ├── vitest.config.ts
│   │   └── package.json
│   │
│   ├── classifieds/           # React frontend (port 3000)
│   │   ├── src/
│   │   │   ├── pages/         # Route pages (Home, State, City, Area, Admin)
│   │   │   ├── components/    # UI components (ProfileCard, Navbar, etc.)
│   │   │   ├── lib/api.ts     # All API calls (uses VITE_API_URL or proxy)
│   │   │   └── __tests__/     # Vitest component tests (33 tests)
│   │   ├── vite.config.ts         # Replit config (uses PORT + BASE_PATH env)
│   │   ├── vite.config.local.ts   # Local dev config (port 3000, proxy /api)
│   │   ├── vitest.config.ts
│   │   └── package.json
│   │
│   ├── chennai-agency/        # Standalone Chennai landing page
│   └── coimbatore-agency/     # Standalone Coimbatore landing page
│
├── schema/
│   ├── schema.sql             # Complete PostgreSQL schema
│   └── seed.sql               # Seed data (admin, boost plans, locations)
│
├── libs/db/                   # Shared @workspace/db package (pg Pool)
├── docker-compose.yml         # Local PostgreSQL (auto-seeds on first run)
├── setup.sh                   # One-time local setup script
├── start-local.sh             # Start both servers for local dev
└── package.json               # pnpm workspace root
```

---

## Database Schema

| Table | Purpose |
|---|---|
| `ec_users` | User accounts (role: user/admin) |
| `ec_profiles` | Escort listings with boost priority |
| `ec_locations` | State/city/area with slugs for SEO URLs |
| `ec_boost_plans` | VIP / Premium / Featured plan definitions |
| `ec_boost_requests` | User boost purchase requests |
| `ec_settings` | Key-value site settings |
| `ec_page_content` | Admin-managed SEO content + FAQs per page |

---

## SEO URL Structure

```
/                           → Home (all listings)
/tamilnadu                  → State page
/escorts/coimbatore         → City page  
/escorts/peelamedu          → Area page
/escorts/peelamedu/slug     → Profile detail page
```

---

## Cloudflare Deployment

### Option 1 — Cloudflare Proxy (Simplest)
Deploy your server on any VPS (DigitalOcean, Hetzner, Railway), point your domain through Cloudflare DNS with the orange cloud enabled. No code changes needed.

### Option 2 — Cloudflare Pages (Frontend)
```bash
cd artifacts/classifieds
VITE_API_URL=https://api.yourdomain.com npx vite build --config vite.config.local.ts
# Upload the dist/ folder to Cloudflare Pages
# Set VITE_API_URL in Cloudflare Pages environment variables
```

For the API server, deploy separately to Railway, Render, or any Node.js-compatible host and set `CORS_ORIGINS=https://yourdomain.com` in its environment variables.

### Recommended Production Database
Use **Neon** (https://neon.tech) — free PostgreSQL with serverless-friendly connection pooling. Set `DATABASE_URL` to the Neon connection string (append `?sslmode=require`).

---

## Generating a New SESSION_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
