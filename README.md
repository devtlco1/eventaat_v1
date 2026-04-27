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
| Caching / future OTP & queues | Redis (URL reserved; not used yet) |

## Monorepo layout

| Path | Role |
|------|------|
| `apps/mobile` | Expo customer app |
| `apps/web` | Next.js: RTL **dashboard** (`/`, `/dashboard`, … — see app routes) |
| `apps/api` | NestJS API |
| `packages/shared` | Domains: **constants**, **types**, **mock data** (Phase 1A; single source for UI) |
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
| **Web** | `cd apps/web && pnpm run dev` — `http://localhost:3001` ( `/` → `/dashboard` ). |
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

## Current implementation status (Phase 1A)

- **Shared (`@eventaat/shared`):** `UserRole`, all lifecycle `*Status` values (reservation, restaurant, table,
  complaint, subscription), entity interfaces, Arabic label maps, and **central** mock data under
  `packages/shared/src/mock/`. See [`docs/mock-data-contract.md`](./docs/mock-data-contract.md).
- **Web:** RTL **layout** (header + sidebar), routes for **restaurant** / **admin** / **call center**;
  every page is a **placeholder** that only reads from `@eventaat/shared` (no in-component mock data).
- **Mobile:** **Customer** flow — state-based screens: Welcome, Home, Search, Restaurant, Create
  Reservation, My Reservations, Details, Profile; mock **cards**; `I18nManager` RTL; **no** auth.
- **API:** Unchanged: **`GET /health` only** (no new business routes). **Prisma** still has no domain
  tables. **No** real OTP, WhatsApp, or payments.
- **Documentation:** `docs/` includes `mock-data-contract.md` and updated implementation plan / API
  / roles / reservation notes.

## Next planned phase (not implemented)

**Phase 1B** — Deeper **customer** mobile **UI** on the same mock contract (blueprint §98 customer
screens): richer layouts and flows, still no backend. See
[`docs/implementation-plan.md`](./docs/implementation-plan.md).
