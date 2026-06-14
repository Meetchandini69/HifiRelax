#!/usr/bin/env bash
# Helper script: authenticated push to GitHub using GITHUB_TOKEN secret
set -e
if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN environment variable is not set." >&2
  exit 1
fi
git remote set-url origin "https://${GITHUB_TOKEN}@github.com/Meetchandini69/HifiRelax.git"
git push origin main "$@"
