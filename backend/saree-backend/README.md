# Saree E-Commerce Backend

This is the Spring Boot 3 + PostgreSQL (Supabase) backend for the Saree E-Commerce platform.

## Deployment Configuration

This application is ready for deployment. All sensitive configurations have been externalized via environment variables.

### Required Environment Variables

When deploying to production, you **MUST** provide the following environment variables:

| Variable | Description | Example |
|---|---|---|
| `DB_URL` | The PostgreSQL JDBC connection string provided by Supabase | `jdbc:postgresql://db.xyz.supabase.co:5432/postgres` |
| `DB_USERNAME` | The database user | `postgres` |
| `DB_PASSWORD` | The database password | `your-secure-password` |
| `JWT_SECRET` | A secure, 256-bit+ secret key used to sign Admin access and refresh tokens | `a-very-long-random-string-at-least-256-bits` |
| `FRONTEND_ORIGIN` | The exact URL of the deployed frontend for strict CORS policies | `https://www.sreepadmavathi.com` |
| `SUPABASE_URL` | The base URL for Supabase API requests | `https://xyz.supabase.co` |
| `SUPABASE_SERVICE_KEY` | The secret service_role key used for server-side operations (like file uploads) | `eyJhbG...` |
| `PORT` | (Optional) The port the application will bind to. Defaults to 8080. | `8080` |

### Database Migrations (Flyway)
On startup, Flyway will automatically run all migrations located in `src/main/resources/db/migration/`.
The application is configured to **fail fast** (`fail-on-missing-locations: true`) if the migration directory is missing, or if a migration script fails to apply cleanly against the production database. This prevents the application from starting in an inconsistent state.

### Health Check
A public health check endpoint is available for load balancers or uptime monitoring tools:
`GET /api/health`
Returns HTTP 200 OK with `{"status": "UP"}`.
