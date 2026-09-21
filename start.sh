#!/bin/bash

echo "🚀 Starting Sree Padmavathi Silks on Replit..."

# --- CLEANUP ---
echo "🧹 Cleaning up old processes and caches..."
pkill -f "java" || true
pkill -f "node" || true
pkill -f "next" || true
pkill -f "localtunnel" || true

# Source backend env vars safely
if [ -f "backend/saree-backend/.env" ]; then
  echo "📥 Loading backend environment variables..."
  set -a
  source backend/saree-backend/.env
  set +a
fi

# --- MEMORY OPTIMIZATION ---
echo "⚛️ Step 1: Building Next.js Frontend..."
cd frontend
export NEXT_PUBLIC_API_BASE_URL="/api"
if [ ! -d "node_modules" ]; then
  npm install --legacy-peer-deps
fi
npm run build
cd ..

echo "☕ Step 2: Building Java Backend..."
cd backend/saree-backend
mvn clean install -DskipTests
cd ../..

echo "🚀 Step 3: Starting both servers on correct separate ports..."
if [ -n "$PGHOST" ]; then
  export DB_URL="jdbc:postgresql://${PGHOST}:${PGPORT}/${PGDATABASE}"
fi
export DB_USERNAME=${PGUSER:-"postgres"}
export DB_PASSWORD=${PGPASSWORD:-"postgres"}

# Start Backend on Port 8080
cd backend/saree-backend
export SERVER_PORT=8080
mvn spring-boot:run &
BACKEND_PID=$!

# Wait 10 seconds to let Backend start compiling/booting
sleep 10

# Start Frontend on Port 3000
cd ../../frontend
export PORT=3000
npm start &
FRONTEND_PID=$!

# Wait 5 seconds to ensure frontend starts listening
sleep 5

cd ..
echo "🌍 Generating public link for your friends..."
rm -f tunnel.log
npx --yes localtunnel --port 3000 --local-host 127.0.0.1 > tunnel.log 2>&1 &
TUNNEL_PID=$!

sleep 4
echo "=========================================================="
echo "🎯 YOUR PUBLIC SHARE LINK (Copy and send to friends):"
grep -o 'https://.*\.loca\.lt' tunnel.log || echo "(Link generating, please check back in a few seconds...)"
echo "=========================================================="

# Wait for all processes
wait $BACKEND_PID $FRONTEND_PID $TUNNEL_PID
