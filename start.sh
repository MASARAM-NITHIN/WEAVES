#!/bin/bash

echo "🚀 Starting Sree Padmavathi Silks on Replit..."

# 1. Start the Java Spring Boot Backend in the background
echo "☕ Building and starting Java Backend..."
cd backend/saree-backend

# Convert Replit's DATABASE_URL (postgres://...) to Spring Boot JDBC format (jdbc:postgresql://...)
if [ -n "$DATABASE_URL" ]; then
  JDBC_URL=$(echo $DATABASE_URL | sed 's/postgres:\/\//jdbc:postgresql:\/\//')
  export DB_URL=$JDBC_URL
else
  export DB_URL="jdbc:postgresql://localhost:5432/saree_db"
fi

export DB_USERNAME=${PGUSER:-"postgres"}
export DB_PASSWORD=${PGPASSWORD:-"postgres"}
export PORT=8080

# Build and run
mvn clean install -DskipTests
mvn spring-boot:run &
BACKEND_PID=$!

# 2. Start the Next.js Frontend
echo "⚛️ Building and starting Next.js Frontend..."
cd ../../frontend
export NEXT_PUBLIC_API_BASE_URL="http://localhost:8080/api"
npm install
npm run build
npm start &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
