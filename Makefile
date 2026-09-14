# ==============================================================================
# SREE PADMAVATHI SILKS - Developer convenience commands
# ==============================================================================

.PHONY: backend frontend backend-build frontend-build clean setup install

## Start the Spring Boot backend (http://localhost:8080)
backend:
	cd backend/saree-backend && mvn spring-boot:run

## Start the Next.js frontend dev server (http://localhost:3000)
frontend:
	cd frontend && npm run dev

## Compile the backend (skips tests)
backend-build:
	cd backend/saree-backend && mvn -q -DskipTests compile

## Build the frontend for production
frontend-build:
	cd frontend && npm run build

## Clean all build artifacts
clean:
	cd backend/saree-backend && mvn clean
	cd frontend && rm -rf .next out

## Install all dependencies (frontend)
install:
	cd frontend && npm install

## Copy .env.example files into place (does not overwrite existing .env)
setup:
	@test -f .env || cp .env.example .env; \
	test -f backend/saree-backend/.env || cp backend/saree-backend/.env.example backend/saree-backend/.env; \
	test -f frontend/.env || cp frontend/.env.example frontend/.env; \
	echo "Environment files ready. Fill in real values before running."