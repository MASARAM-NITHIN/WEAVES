# Sree Padmavathi Silks — Saree E-Commerce Platform

Luxury saree e-commerce store running at [sreepadmavathi.com](https://www.sreepadmavathi.com). This repository contains a modern frontend (Next.js) and a secure REST API (Spring Boot) backed by PostgreSQL.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, Bootstrap 5, Axios, Swiper, Framer Motion |
| Backend | Spring Boot 3.2, Java 21, Spring Security (JWT), Spring Data JPA, Flyway |
| Database | PostgreSQL (local, Replit Postgres, or any hosted Postgres) |
| Object Storage | Database (images stored as data-URIs in TEXT columns) |
| Build | Maven, npm |

## Repository Layout

```
.
├── backend/
│   └── saree-backend/          # Spring Boot REST API
│       ├── src/main/java/...   # controllers, services, entities, security, mappers
│       └── src/main/resources/
│           ├── application.yml # externalized config (env vars)
│           └── db/migration/   # Flyway migrations (V1..V20)
├── frontend/                   # Next.js storefront + admin UI
│   └── src/
│       ├── app/                # App Router pages
│       ├── components/         # reusable UI components
│       ├── context/            # Auth, Cart, Products, Wishlist
│       ├── lib/                # API client + helpers
│       └── views/              # page-level view components
└── .env.example                # global env template (copy to .env)
```

## Prerequisites

- Node.js >= 20
- Java 21 (JDK)
- Maven 3.9+
- PostgreSQL (local, Replit Postgres, or any hosted Postgres)

## Getting Started

### 1. Environment configuration

Copy the example files and fill in your values. `.env` files are gitignored and must never be committed.

```bash
cp .env.example .env                       # global env (repo root)
cp backend/saree-backend/.env.example backend/saree-backend/.env
cp frontend/.env.example frontend/.env
```

Key variables (root `.env`):

| Variable | Purpose |
|---|---|
| `SPRING_DATASOURCE_URL` / `_USERNAME` / `_PASSWORD` | PostgreSQL connection (or just `DATABASE_URL` on Replit) |
| `JWT_SECRET` | 256-bit+ secret for signing JWTs |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |
| `APP_STORAGE_DIR` | Legacy disk dir still served at `/uploads/**` for old rows (default `./uploads`) |
| `NEXT_PUBLIC_API_BASE_URL` | API base used by the browser (`/api` = same-origin proxy) |

### 2. Start the backend

```bash
make backend
# or
cd backend/saree-backend && mvn spring-boot:run
```

- Starts on `http://localhost:8080` (configurable via `PORT`).
- On startup, Flyway applies any pending migrations in `src/main/resources/db/migration/` — the schema is managed exclusively by Flyway, never by Hibernate auto-DDL.
- Health check: `GET /api/health`.

### 3. Start the frontend

```bash
make frontend
# or
cd frontend && npm install && npm run dev
```

- Starts on `http://localhost:3000` (Next.js default).

### Useful commands

```bash
make backend      # run Spring Boot backend
make frontend     # run Next.js dev server
make backend-build    # compile backend (skips tests)
make frontend-build   # build frontend for production
make clean            # clean build artifacts
```

## Database & Migrations

The database schema is versioned with Flyway. Migration scripts live in
`backend/saree-backend/src/main/resources/db/migration/` and run automatically on backend startup.
`ddl-auto` is `validate`, so Hibernate only validates the schema against the JPA entities.

To change the schema, add a new numbered migration (e.g. `V21__description.sql`) — do not edit applied migrations.

## Security Notes

- Stateless JWT auth; admin routes require `ROLE_OWNER`.
- Rate limiting (Bucket4j) and admin action logging filters.
- All secrets are externalized via environment variables. `.env` files are gitignored.
- If you fork this repo, rotate any previous credentials immediately (see `.gitignore` history).

## API Overview

| Area | Base path |
|---|---|
| Sarees (public) | `/api/sarees` |
| Theme collections (public) | `/api/theme-collections`, `/api/collections` |
| Fabric types (public) | `/api/fabric-types`, `/api/fabrics` |
| Reviews (public read) | `/api/reviews` |
| Orders (public place/lookup) | `/api/orders` |
| Admin auth + management | `/api/admin` |
| Health | `/api/health` |

## Deploying on Replit

Architecture: **one public port**. Next.js serves the storefront on `:3000`
(mapped to external `80`) and proxies `/api/*` and `/uploads/*` to Spring Boot
on internal `:8081` on Replit (Replit reserves `:8080` for itself; see `BACKEND_PORT` in `scripts/replit-start.sh`). The browser
never talks to the backend directly, so no CORS or absolute-URL configuration
is needed — `NEXT_PUBLIC_API_BASE_URL=/api` works on any host.

PostgreSQL comes from **Replit Postgres** (Helium). `scripts/replit-start.sh`
converts the auto-provided `DATABASE_URL` into Spring's `DB_URL` /
`DB_USERNAME` / `DB_PASSWORD` (and drops `sslmode` for the SSL-less dev DB).
**Flyway creates the full schema automatically on first boot** — no manual SQL.

Image uploads (saree/collection/fabric photos) are compressed (max 1200px,
JPEG q0.82 — in the browser for admin uploads, in Java for API uploads) and
stored as Base64 data-URIs directly in the existing TEXT columns. A plain
database backup therefore restores **everything**, images included. Rows
created before this change may still reference `/uploads/**` disk files,
which remain served for backward compatibility.

### Steps

1. **Import** this repo into Replit (GitHub import). Required files
   (`.replit`, `replit.nix`) are already present; the Nix env provides
   JDK 21, Maven, and Node 20.
2. **Add a database**: open the Database tool → create a PostgreSQL database.
   `DATABASE_URL` is injected automatically.
3. **Set Secrets** (workspace Secrets for dev; **Deployment Secrets**
   separately — they do not sync):
   - `JWT_SECRET` — long random string (required for production)
   - `OWNER_DEFAULT_USERNAME` / `OWNER_DEFAULT_PASSWORD` — seeds the first
     admin account on first boot (only when no admin exists)
4. **Run** (dev): press Run → `scripts/replit-start.sh` builds anything
   missing and starts backend + frontend.
5. **Deploy**: Publishing → Autoscale (or Reserved VM) → Deploy. Build
   (`scripts/replit-build.sh`) compiles the jar and the Next.js app;
   run (`scripts/replit-start.sh`) starts both services.

### Notes

- Both servers must bind `0.0.0.0` (Spring Boot and `next start` do by default).
- The deployment health check hits `/` (Next.js homepage), which renders
  without the backend, so slow Spring startup never fails promotion.
- Uploads live in the database (data-URIs), so a database backup restores
  images too. Legacy `/uploads/**` disk files (if any) should be copied
  alongside, or re-uploaded once through the admin UI to migrate them into
  the database.
- Never upload `.env` files to Replit — use Secrets. `.env` is gitignored.