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
| `apps/web` | Next.js: Arabic RTL **dashboards** (restaurant, admin, call center, platform) with **Almarai** and shared UI components; all **mock** until backend phases |
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

**OpenAPI (Swagger):** the NestJS app exposes **Swagger UI** at **`/docs`** and the raw spec at **`/openapi.json`**
(see `apps/api/src/openapi.setup.ts`). The document title is **eventaat API**, version **0.1.0**.  
Local URLs (default port 3000): `http://127.0.0.1:3000/docs` · `http://127.0.0.1:3000/openapi.json`  
**Maintenance:** whenever a route is added, changed, or removed, update Nest **Swagger decorators** and
[`docs/api-reference.md`](./docs/api-reference.md) in the same change (see that file for the project rule).

## Quality commands

```bash
pnpm run typecheck
pnpm -r run build
```

(Adjust per package; mobile may require Expo dependencies resolved after the first `pnpm install`.)

## Current implementation status (Phases 1A–1E: mock prototype + API docs foundation)

- **Shared (`@eventaat/shared`):** `UserRole` (aligned with Prisma `UserRole` in **Phase 2A**; see
  `prisma-auth-alignment.ts`), all lifecycle `*Status` values (reservation, restaurant, table, complaint,
  subscription), entity interfaces, Arabic label maps, **seating / occasion** labels, and **central** mock
  data under `packages/shared/src/mock/`. See [`docs/mock-data-contract.md`](./docs/mock-data-contract.md).
- **Web:** **Almarai** (Google Font via `next/font/google`), RTL **shell** (polished sidebar + top bar
  with route titles, subtle **نموذج تجريبي** note). **Restaurant (Phase 1C + polish):** operational
  mock at `/restaurant` and sub-routes; **UI Recovery** adds shared **MetricCard / SectionCard / PageHeader** and
  tighter layout. **Admin, call center, and platform** (`/dashboard`, `/admin/*`, `/call-center/*`) use the
  same design system: KPIs, toolbars, tables, drawers — all **mock-only** from `@eventaat/shared` (no API).
  **Role switcher** (مطعم) unchanged; no real auth.
- **Mobile:** **Customer** app — Arabic-first, RTL, **state-based** navigation (`AppProvider` +
  `ScreenRouter`); full **prototype** flows: Welcome (mock sign-in and guest entry), mock login/OTP,
  mock registration, Home (بغداد, discovery, categories, areas), Search with local filters, restaurant
  details, create **pending** reservation in local state only, confirmation, grouped **My
  reservations** with details and a mock lifecycle timeline, Profile, and Support. **No** real auth,
  OTP, or API calls.
- **API:** **Functional** HTTP routes: **`GET /health`** and **Phase 2B auth** (`POST /auth/otp/request`, `POST /auth/otp/verify`, `GET /auth/me`, `POST /auth/logout`). **Swagger/OpenAPI** is at `/docs` and `/openapi.json` (see
  [`docs/api-reference.md`](./docs/api-reference.md)). **Prisma (Phase 2A+)** has **User**, **OtpChallenge**, **UserSession**, **AuditLog**,
  and related enums — **no** restaurant/reservation tables yet. **No** real WhatsApp send (Phase 2C); **no** payment APIs.
- **Documentation:** `docs/` includes `mock-data-contract.md`, [`docs/mock-e2e-scenarios.md`](./docs/mock-e2e-scenarios.md) (Phase 1E
  checklist), **[`docs/auth-rbac-foundation.md`](./docs/auth-rbac-foundation.md)** (Phase 2A), and
  the OpenAPI/Swagger maintenance rule in `docs/api-reference.md`.

## Next sub-phase (not fully implemented)

**Phase 2C** — **WhatsApp / SMS OTP provider** interface and delivery — **not** a real external send in 2B; see
[`docs/auth-rbac-foundation.md`](./docs/auth-rbac-foundation.md#7-roadmap-after-2b) and
[`docs/implementation-plan.md`](./docs/implementation-plan.md).
