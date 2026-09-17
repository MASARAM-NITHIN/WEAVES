#!/bin/bash

echo "🚀 Starting Sree Padmavathi Silks on Replit..."

# --- CLEANUP ---
echo "🧹 Cleaning up old processes and caches..."
pkill -f "java" || true
pkill -f "node" || true
pkill -f "next" || true

# --- MEMORY OPTIMIZATION ---
echo "⚛️ Step 1: Building Next.js Frontend (This takes 1-2 minutes)..."
cd frontend
export NEXT_PUBLIC_API_BASE_URL="http://localhost:8080/api"
# Delete node_modules completely to remove Next 16 and lockfile to bypass the firewall
rm -rf node_modules package-lock.json .next
npm install
npm run build
cd ..

echo "☕ Step 2: Building Java Backend (This takes 1-2 minutes)..."
cd backend/saree-backend
mvn clean install -DskipTests
cd ../..

echo "🚀 Step 3: Starting both servers..."
# Use Replit's explicit PG variables instead of parsing DATABASE_URL
if [ -n "$PGHOST" ]; then
  export DB_URL="jdbc:postgresql://${PGHOST}:${PGPORT}/${PGDATABASE}"
else
  export DB_URL="jdbc:postgresql://localhost:5432/saree_db"
fi
export DB_USERNAME=${PGUSER:-"postgres"}
export DB_PASSWORD=${PGPASSWORD:-"postgres"}
export PORT=8080

# Start Backend
cd backend/saree-backend
mvn spring-boot:run &
BACKEND_PID=$!

# Start Frontend
cd ../../frontend
npm start &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
