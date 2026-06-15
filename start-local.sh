#!/usr/bin/env bash
# ============================================================
# EliteEscorts — Start Local SSR Preview
# Usage: bash start-local.sh
# ============================================================

# Load root .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo ""
echo "Starting EliteEscorts local SSR preview..."
echo "  API Server  → http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop the server."
echo ""

# Build frontend so the API server can inject route-specific metadata
(
  cd artifacts/classifieds
  pnpm run build
)

# Start API server and serve the built frontend with SSR metadata
cd artifacts/api-server
[ -f .env ] && export $(grep -v '^#' .env | xargs)
export PORT=8080
pnpm run dev
