#!/usr/bin/env bash
# Helper script: push to GitHub using GITHUB_TOKEN (set as a Replit Secret).
# Uses git -c http.extraHeader to inject the token at push time.
# The token is never written to .git/config or any tracked file on disk.
set -e
if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN is not set. Add it as a Replit Secret." >&2
  exit 1
fi
ENCODED_TOKEN=$(printf '%s' "x-token-auth:${GITHUB_TOKEN}" | base64 | tr -d '\n')
git -c "http.https://github.com/.extraHeader=Authorization: Basic ${ENCODED_TOKEN}" \
    push origin main "$@"
