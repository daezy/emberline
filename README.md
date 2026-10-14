# Emberline

Emberline keeps serverless and scale-to-zero services warm, records their
readiness and latency, detects probable cold starts, and alerts owners when a
service repeatedly fails or recovers.

This repository is a pnpm/Turborepo monorepo containing the web application,
API, background workers, database schema, and shared packages.

## Features

- Email/password and Google authentication with rotating refresh tokens
- Projects and monitored HTTP endpoints
- Interval, scheduled, and manual warming policies
- SSRF-protected endpoint probes with redirect and timeout handling
- Readiness history, latency baselines, and cold-start detection
- Failure, recovery, and repeated cold-start notifications
- PostgreSQL-backed scheduling and job processing with pg-boss

## Repository layout

| Path | Purpose |
| --- | --- |
| `apps/api` | NestJS API, workers, Drizzle schema, and migrations |
| `apps/web` | React and TanStack Start web application |
| `packages/contracts` | Shared workspace package for cross-app contracts |
| `docs` | Product requirements, scope, and brand guidance |

More implementation detail is available in the
[API README](apps/api/README.md).

## Requirements

- Node.js 22.12 or newer (pg-boss requires it)
- pnpm 11
- PostgreSQL
- SMTP credentials for real email delivery; without them, emails are logged

## Getting started

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
pnpm --filter @server-ping/api db:migrate
pnpm dev
```

The web application runs at `http://localhost:3000` and the API at
`http://localhost:4000`. API liveness and readiness endpoints are available at
`/health` and `/health/ready`.

Before starting, set `DATABASE_URL`, `JWT_SECRET`, and `PASSWORD_PEPPER` in
`apps/api/.env`. Use a direct `DATABASE_URL_UNPOOLED` for migrations when your
database provider distinguishes pooled and direct connections.

`WORKER_ENABLED=true` runs the scheduler, endpoint-check workers, retention
task, and notification workers in the API process. Set it to `false` for
HTTP-only instances.

## Common commands

Run these from the repository root:

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start all development processes |
| `pnpm build` | Build every workspace package |
| `pnpm typecheck` | Type-check the workspace |
| `pnpm lint` | Run workspace lint tasks |
| `pnpm test` | Run workspace unit tests |
| `pnpm --filter @server-ping/api db:check` | Validate migration metadata |
| `pnpm --filter @server-ping/api db:migrate` | Apply pending migrations |

The API end-to-end suite initializes the complete application and requires a
dedicated test database. Never point it at production data.

## Deployment

Both apps are long-running Node servers. The API also runs the check scheduler
and pg-boss workers, so host it somewhere it stays running: a host that sleeps
idle services, or runs code as serverless functions, will stop checks and
alerts.

```bash
pnpm install --frozen-lockfile
pnpm exec turbo run build --filter=@server-ping/api --filter=@server-ping/web
pnpm --filter @server-ping/api db:migrate      # before each API release
node apps/api/dist/src/main                     # API
node apps/web/.output/server/index.mjs          # web
```

Configure each app with the variables in its `.env.example`, plus
`NODE_ENV=production`. The web server calls the API server-to-server through
`API_URL`, so the API can stay on a private network. Health checks are at
`/health` (process up) and `/health/ready` (database reachable).

In production the API refuses to start with `CHECK_ALLOW_PRIVATE_NETWORKS`
enabled or a localhost `WEB_APP_URL`, and warns when `SMTP_URL` is missing.

## Security notes

Endpoint checks reject private, loopback, link-local, and reserved network
addresses by default. `CHECK_ALLOW_PRIVATE_NETWORKS=true` disables this SSRF
protection and should only be used in trusted development environments.

Keep `JWT_SECRET` and `PASSWORD_PEPPER` secret. Changing the password pepper
invalidates existing password hashes.

## License

This software is proprietary and confidential. See [LICENSE](LICENSE).
