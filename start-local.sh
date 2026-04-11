#!/usr/bin/env bash
# ============================================================
# EliteEscorts — Start Local Development Servers
# Usage: bash start-local.sh
# ============================================================

# Load root .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo ""
echo "Starting EliteEscorts local dev servers..."
echo "  API Server  → http://localhost:8080"
echo "  Frontend    → http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers."
echo ""

# Start API server in background
(
  cd artifacts/api-server
  [ -f .env ] && export $(grep -v '^#' .env | xargs)
  export PORT=8080
  pnpm run dev
) &
API_PID=$!

# Wait for API server to start
sleep 4

# Start frontend dev server
(
  cd artifacts/classifieds
  [ -f .env.local ] && export $(grep -v '^#' .env.local | xargs)
  export PORT=3000
  npx vite --config vite.config.local.ts --host
) &
FRONTEND_PID=$!

# Trap Ctrl+C and kill both
trap "kill $API_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'; exit 0" SIGINT SIGTERM

wait
