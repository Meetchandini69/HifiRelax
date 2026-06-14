#!/usr/bin/env bash
# Git credential helper: reads GITHUB_TOKEN from environment at push time.
# Token is never written to .git/config or any tracked file on disk.
echo "username=x-token-auth"
echo "password=${GITHUB_TOKEN}"
