#!/bin/bash

echo "🚀 Starting Sree Padmavathi Silks on Replit..."

# --- CLEANUP ---
echo "🧹 Cleaning up old processes and caches..."
pkill -f "java" || true
pkill -f "node" || true
pkill -f "next" || true

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
else
  export DB_URL="jdbc:postgresql://localhost:5432/saree_db"
fi
export DB_USERNAME=${PGUSER:-"postgres"}
export DB_PASSWORD=${PGPASSWORD:-"postgres"}

# Start Backend on Port 8080
cd backend/saree-backend
export SERVER_PORT=8080
mvn spring-boot:run &
BACKEND_PID=$!

# Wait a few seconds to let Backend start before frontend
sleep 5

# Start Frontend on Port 3000
cd ../../frontend
export PORT=3000
npm start &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
