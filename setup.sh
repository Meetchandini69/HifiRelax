#!/usr/bin/env bash
# ============================================================
# EliteEscorts — Local Setup Script
# Usage: bash setup.sh
# ============================================================
set -e

echo ""
echo "============================================"
echo "  EliteEscorts — Local Setup"
echo "============================================"
echo ""

# 1. Check requirements
command -v node  >/dev/null 2>&1 || { echo "ERROR: Node.js is not installed. Install from https://nodejs.org"; exit 1; }
command -v pnpm  >/dev/null 2>&1 || { echo "ERROR: pnpm is not installed. Run: npm install -g pnpm"; exit 1; }

echo "[1/5] Installing dependencies..."
pnpm install

# 2. Create .env if not exists
if [ ! -f .env ]; then
  echo "[2/5] Creating .env from .env.example..."
  cp .env.example .env
  echo "  ✓ .env created — please edit DATABASE_URL and SESSION_SECRET"
else
  echo "[2/5] .env already exists, skipping."
fi

# 3. Create classifieds .env.local if not exists
if [ ! -f artifacts/classifieds/.env.local ]; then
  echo "[3/5] Creating classifieds .env.local..."
  cp artifacts/classifieds/.env.local.example artifacts/classifieds/.env.local
  echo "  ✓ classifieds .env.local created"
else
  echo "[3/5] classifieds .env.local already exists, skipping."
fi

# 4. Create api-server .env if not exists
if [ ! -f artifacts/api-server/.env ]; then
  echo "[4/5] Creating api-server .env..."
  cp artifacts/api-server/.env.example artifacts/api-server/.env
  echo "  ✓ api-server .env created"
else
  echo "[4/5] api-server .env already exists, skipping."
fi

echo ""
echo "[5/5] Setup complete!"
echo ""
echo "  Next steps:"
echo "  1. Edit .env and set DATABASE_URL and SESSION_SECRET"
echo "  2. Start PostgreSQL:"
echo "       docker compose up -d        (uses Docker)"
echo "       -- OR --"
echo "       brew services start postgresql@16  (macOS)"
echo ""
echo "  3. Run the database schema + seed:"
echo "       psql \$DATABASE_URL -f schema/schema.sql"
echo "       psql \$DATABASE_URL -f schema/seed.sql"
echo ""
echo "  4. Start the app:"
echo "       bash start-local.sh"
echo ""
echo "  Admin login: admin@eliteescorts.in / Admin@1234"
echo ""
