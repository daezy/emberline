# Emberline API

NestJS API and background workers for Emberline. It owns authentication,
projects, monitored services, scheduled endpoint checks, incident detection,
and notifications.

## Local setup

From `apps/api`:

```bash
cp .env.example .env
pnpm install
pnpm db:migrate
pnpm dev
```

The API listens on `http://localhost:4000` by default. Use `GET /health` for
liveness and `GET /health/ready` for database readiness.

## Database

Runtime traffic uses `DATABASE_URL`. Set `DATABASE_URL_UNPOOLED` as well when
your provider exposes a direct connection for migrations.

```bash
pnpm db:generate  # generate a migration after a schema change
pnpm db:check     # validate migration snapshots and the journal
pnpm db:migrate   # apply pending migrations
pnpm db:studio    # inspect the database
```

## Workers

`WORKER_ENABLED=true` starts the scheduler, check workers, retention task, and
notification workers in the API process. Set it to `false` on HTTP-only
instances. Jobs live in the `pgboss` schema of the application database.

Endpoint checks reject private and reserved network addresses by default to
prevent SSRF. `CHECK_ALLOW_PRIVATE_NETWORKS=true` is intended only for trusted
development environments.

Without `SMTP_URL`, notification emails are logged instead of sent.

## Verification

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

The end-to-end suite initializes the full application and therefore requires a
test PostgreSQL database. Do not point it at a production database.
