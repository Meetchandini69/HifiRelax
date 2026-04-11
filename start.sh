#!/bin/bash
set -e

# Start the API server on port 8080 in the background
PORT=8080 node --enable-source-maps --import=./load-env.mjs ./dist/index.mjs &
API_PID=$!

# Start the frontend on port 5000
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/classifieds run dev
