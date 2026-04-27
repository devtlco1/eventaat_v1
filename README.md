# eventaat

**eventaat** is a restaurant table reservation platform for Iraq (starting from Baghdad), described in
the [Product & Execution Blueprint](./docs/eventaat_product_execution_blueprint_v1.md). This repository
is a **TypeScript monorepo** for mobile (customer app), web (restaurant and operations dashboards), and
a shared backend API.

## Stack

| Area | Technology |
|------|------------|
| Language | TypeScript |
| Mobile | Expo (React Native) |
| Web | Next.js (App Router) |
| API | NestJS |
| Database | PostgreSQL (via Prisma) |
| Caching / future OTP & queues | Redis (URL reserved; not used in Step 0) |

## Monorepo layout

| Path | Role |
|------|------|
| `apps/mobile` | Expo customer app |
| `apps/web` | Next.js dashboards (shell placeholder) |
| `apps/api` | NestJS API |
| `packages/shared` | Shared types/constants (minimal) |
| `packages/config` | Shared `tsconfig.base.json` and future shared tooling |
| `docs/` | Product blueprint and engineering docs |

## Prerequisites

- **Node.js** 20 or newer  
- **pnpm** 9 (`corepack enable` and `corepack prepare pnpm@9.15.0 --activate`, or use your pnpm install)  
- **PostgreSQL** when running the API with Prisma (optional local `docker compose up -d` for Postgres/Redis)  
- **iOS/Android** toolchains only if you run the mobile app on simulators or devices

## Environment files

| App | Example |
|-----|--------|
| API | [`apps/api/.env.example`](./apps/api/.env.example) |
| Web | [`apps/web/.env.example`](./apps/web/.env.example) |
| Mobile | [`apps/mobile/.env.example`](./apps/mobile/.env.example) |

Copy to `.env` (or `.env.local`) and adjust. For a quick local database URL matching `docker-compose.yml`:

`postgresql://eventaat:eventaat@localhost:5432/eventaat?schema=public`

## Install (once)

```bash
pnpm install
```

If `pnpm install` fails on a `napi-postinstall` or similar **postinstall** script, try:

```bash
pnpm install --ignore-scripts
```

Then generate the Prisma client (also runs on API `build` / `start:dev`):

```bash
cd apps/api && npx prisma generate
```

> **Path note:** some tools (including pnpm) mishandle the colon (`:`) in a folder name such as
> `DEV :./`. If workspace commands like `pnpm --filter …` error when updating `PATH`, run commands
> from each app directory with `npx` (as in this README) or **rename the project directory** to a
> path without `:`.

## Run each app (development)

| App | Command (from repository root) |
|-----|---------------------------------|
| **API** | `cd apps/api && pnpm run start:dev` (or `npx nest start --watch` after `npx prisma generate`) — `http://localhost:3000` (override with `API_PORT` / `PORT`). |
| **Web** | `cd apps/web && pnpm run dev` — `http://localhost:3001`. |
| **Mobile** | `cd apps/mobile && pnpm run start` — Expo dev server (`i` / `a` for simulators, or scan QR in Expo Go). |

If pnpm’s workspace `PATH` handling works in your environment, you can also use the root scripts:

`pnpm run dev:api` · `pnpm run dev:web` · `pnpm run dev:mobile`

**Health check:** with the API running, `GET /health` returns JSON `{ "status": "ok", "app": "eventaat", ... }`.

## Quality commands

```bash
pnpm run typecheck
pnpm -r run build
```

(Adjust per package; mobile may require Expo dependencies resolved after the first `pnpm install`.)

## Current implementation status (Step 0)

- Monorepo: **pnpm workspaces** with `apps/*` and `packages/*`.
- **Shared TypeScript** base in `packages/config` (packages extend or mirror as needed for Next/Expo/Nest).
- **Web:** Next.js app with a **RTL** dashboard **placeholder** (no product features).
- **Mobile:** Expo app with a **welcome** screen only.
- **API:** NestJS with **`GET /health`**, `ConfigModule`, and **Prisma** wired to PostgreSQL; schema contains only
  a non–business foundation marker (no domain tables). **Redis** is documented in `.env.example` for future
  use.
- **No** authentication, reservations, restaurants, WhatsApp, or payments in code.
- **Documentation** under `docs/`: implementation phases, API surface, roles, reservation states, WhatsApp
  template index.

## Next planned phase (not implemented here)

**Blueprint engineering Phase 1 (prototype with mock data):** full UI flows with fake data, aligned with
`docs/implementation-plan.md` — no real backend yet.

See [`docs/implementation-plan.md`](./docs/implementation-plan.md) for the full roadmap.
