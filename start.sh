#!/bin/bash

echo "🚀 Starting Sree Padmavathi Silks on Replit..."

# --- MEMORY OPTIMIZATION ---
# Replit has strict memory limits. We must build sequentially to avoid crashing.

echo "⚛️ Step 1: Building Next.js Frontend (This takes 1-2 minutes)..."
cd frontend
export NEXT_PUBLIC_API_BASE_URL="http://localhost:8080/api"
npm install
npm run build
cd ..

echo "☕ Step 2: Building Java Backend (This takes 1-2 minutes)..."
cd backend/saree-backend
mvn clean install -DskipTests
cd ../..

echo "🚀 Step 3: Starting both servers..."
# Convert Replit's DATABASE_URL (postgres://...) to Spring Boot JDBC format
if [ -n "$DATABASE_URL" ]; then
  JDBC_URL=$(echo $DATABASE_URL | sed 's/postgres:\/\//jdbc:postgresql:\/\//')
  export DB_URL=$JDBC_URL
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
