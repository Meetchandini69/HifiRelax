#!/usr/bin/env bash
# Helper script: push to GitHub using GITHUB_TOKEN via credential helper.
# The token is never written to .git/config or any file on disk.
set -e
if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN environment variable is not set." >&2
  exit 1
fi
git push origin main "$@"
