#!/usr/bin/env bash
# Deployment build: install deps, build frontend + backend jar.
# Runs once per Replit deployment (and can be run manually).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> [build] Installing frontend dependencies"
cd "$ROOT/frontend"
npm ci

echo "==> [build] Building frontend (same-origin /api proxy mode)"
export NEXT_PUBLIC_API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-/api}"
npm run build

echo "==> [build] Building backend jar (skip tests: they need a live DB)"
if command -v javac >/dev/null 2>&1; then
  export JAVA_HOME="${JAVA_HOME:-$(dirname "$(dirname "$(readlink -f "$(command -v javac)")")")}"
fi
cd "$ROOT/backend/saree-backend"
mvn -B -q -DskipTests package

echo "==> [build] Complete"
