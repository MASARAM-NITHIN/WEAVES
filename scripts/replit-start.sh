#!/usr/bin/env bash
# Runtime entrypoint for Replit (workspace Run button AND deployment).
# Starts Spring Boot (internal :8080) + Next.js (public :3000, proxies /api/* and /uploads/*).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ---------- Java ----------
if command -v javac >/dev/null 2>&1; then
  export JAVA_HOME="${JAVA_HOME:-$(dirname "$(dirname "$(readlink -f "$(command -v javac)")")")}"
fi

# ---------- Database ----------
# Replit Postgres exposes a single DATABASE_URL (postgresql://user:pass@host:port/db?params).
# Spring needs a jdbc: URL plus separate credentials, so derive them (unless explicitly overridden).
if [ -n "${DATABASE_URL:-}" ] && [ -z "${DB_URL:-}" ]; then
  echo "==> [db] Deriving Spring datasource settings from DATABASE_URL"
  # NOTE: the node program is fed via a heredoc redirect (not $()) because
  # bash requires balanced quotes inside heredocs used in command substitutions.
  DB_ENV_FILE="$(mktemp)"
  node > "$DB_ENV_FILE" <<'NODE_EOF'
    const raw = process.env.DATABASE_URL;
    const u = new URL(raw);
    const params = new URLSearchParams(u.search);
    // Replit dev DB (Helium) runs alongside the app WITHOUT SSL; forcing
    // sslmode=require breaks it. Drop SSL params for local/private hosts only.
    const host = u.hostname || '';
    if (/helium|localhost|^127\.|^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\./.test(host)) {
      params.delete('sslmode');
      params.delete('ssl');
    }
    const qs = params.toString();
    const path = u.pathname && u.pathname !== '/' ? u.pathname : '/postgres';
    let jdbc = 'jdbc:postgresql://' + host + (u.port ? ':' + u.port : '') + path;
    if (qs) jdbc += '?' + qs;
    // Single-quote shell escaping (safe for $, backticks, quotes in passwords).
    const sh = (s) => "'" + String(s).replace(/'/g, "'\\''") + "'";
    console.log('export DB_URL=' + sh(jdbc));
    console.log('export DB_USERNAME=' + sh(decodeURIComponent(u.username || 'postgres')));
    console.log('export DB_PASSWORD=' + sh(decodeURIComponent(u.password || '')));
NODE_EOF
  # shellcheck disable=SC1090
  source "$DB_ENV_FILE"
  rm -f "$DB_ENV_FILE"
  # Make sure stale SPRING_DATASOURCE_* vars (direct property bindings) don't override these.
  unset SPRING_DATASOURCE_URL SPRING_DATASOURCE_USERNAME SPRING_DATASOURCE_PASSWORD
fi

if [ -z "${JWT_SECRET:-}" ]; then
  echo "==> [warn] JWT_SECRET is not set. Set it in Replit Secrets for any real deployment."
fi

# ---------- Ports ----------
# NOTE: Replit reserves :8080 for its own infrastructure (bind test = EADDRINUSE
# with no Java running), so the backend lives on :8081 here. Local dev still
# uses :8080 via application.yml default / Makefile.
export BACKEND_PORT="${BACKEND_PORT:-8081}"
export PORT="${PORT:-3000}"  # public port: Replit maps external 80 -> this
export BACKEND_INTERNAL_URL="${BACKEND_INTERNAL_URL:-http://localhost:${BACKEND_PORT}}"

# ---------- Backend ----------
cd "$ROOT/backend/saree-backend"
# Pre-flight: kill any orphan backend from a previous run holding the port.
pkill -f 'saree-backend.*\.jar' 2>/dev/null || true
sleep 2
JAR="$(ls -t target/*.jar 2>/dev/null | grep -v -e sources -e javadoc | head -n 1 || true)"
if [ -z "${JAR:-}" ]; then
  echo "==> [backend] No jar found, building..."
  mvn -B -q -DskipTests package
  JAR="$(ls -t target/*.jar 2>/dev/null | grep -v -e sources -e javadoc | head -n 1)"
fi
echo "==> [backend] Starting Spring Boot on :${BACKEND_PORT} (${JAR})"
PORT="$BACKEND_PORT" java -jar "$JAR" &
BACKEND_PID=$!

# ---------- Frontend ----------
cd "$ROOT/frontend"
if [ ! -f "node_modules/.package-lock.json" ]; then
  echo "==> [frontend] Installing dependencies"
  npm ci
fi
if [ ! -d ".next" ]; then
  echo "==> [frontend] No .next build found, building..."
  NEXT_PUBLIC_API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-/api}" npm run build
fi
echo "==> [frontend] Starting Next.js on :${PORT} (proxy -> ${BACKEND_INTERNAL_URL})"
PORT="$PORT" npm run start &
FRONTEND_PID=$!

cleanup() {
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

wait
