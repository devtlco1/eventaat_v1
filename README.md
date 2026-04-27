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

**PostgreSQL (auth) — local:** `docker compose up -d postgres redis` from the repository root, then set
`DATABASE_URL` in `apps/api/.env` (see [`apps/api/.env.example`](./apps/api/.env.example)). Apply migrations:

```bash
cd apps/api
npx prisma migrate deploy
```

**Phase 2B.1** includes the `auth_foundation` migration under `apps/api/prisma/migrations/`. **Phase 3A** adds the
`restaurant_branch_table_foundation` migration (restaurant, branch, seating area, table, and restaurant staff
assignment tables — **no** new HTTP routes; see [`docs/restaurant-data-model.md`](./docs/restaurant-data-model.md)). **Phase 2C** adds the
**OTP delivery** layer (mock default, optional WhatsApp Cloud API with dry-run, SMS placeholder — **no** real
SMS). See [`docs/otp-delivery-provider.md`](./docs/otp-delivery-provider.md). **Phase 2D** connects the
**Expo** and **Next.js** frontends to the same auth API via `@eventaat/shared`’s **`auth-client`**; business data in
UIs remain mock. **Phase 2E** adds **RBAC** (`RbacGuard` in the API for future routes, no new public endpoints) and
**web** dashboard path protection when `NEXT_PUBLIC_AUTH_REQUIRED=true` (see
[`docs/rbac-route-access.md`](./docs/rbac-route-access.md), [`docs/frontend-auth-integration.md`](./docs/frontend-auth-integration.md)). **Phase 2E.1** improves
the **web** shell (fixed sidebar + scroll, client-side table **pagination**, **row action** menus via portal, better
**login** network hint in Arabic) — still **no** new API; see [`docs/api-reference.md`](./docs/api-reference.md) and
[`docs/local-auth-verification.md`](./docs/local-auth-verification.md) for start commands. For manual
auth **curl** checks and the e2e command, see [`docs/local-auth-verification.md`](./docs/local-auth-verification.md).

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

## Current implementation status (Phases 1A–1E: mock prototype + Phases 2A–2E: auth, OTP delivery, and RBAC shell + Phase 3A: restaurant DB)

- **Shared (`@eventaat/shared`):** `UserRole` (aligned with Prisma `UserRole` in **Phase 2A**; see
  `prisma-auth-alignment.ts`), all lifecycle `*Status` values (reservation, restaurant, table, complaint,
  subscription), entity interfaces, Arabic label maps, `prisma-entity-labels.ts` (Arabic labels for **Prisma**
  restaurant-related enums, Phase **3A**), **seating / occasion** labels, **`auth-client`**, and
  **`rbac/role-areas` helpers** (Phase 2E). **Central** mock
  data under `packages/shared/src/mock/`. See [`docs/mock-data-contract.md`](./docs/mock-data-contract.md).
- **Web:** **Almarai** (Google Font via `next/font/google`), RTL **shell** (polished sidebar + top bar
  with route titles, **prototype** vs **strict auth** per `NEXT_PUBLIC_AUTH_REQUIRED`). **Restaurant (Phase 1C + polish):** operational
  mock at `/restaurant` and sub-routes; **Admin, call center, and platform** mock KPIs and tables. When **auth
  required** is on, `AuthGate` + `canAccessRoute` enforce **role-appropriate** paths; otherwise full prototype
  navigation remains for review. Business data: **mock-only** (no new backend APIs in 2E).
- **Mobile:** **Customer** app — Arabic-first, RTL, **state-based** navigation; **real auth** when
  `EXPO_PUBLIC_API_BASE_URL` is set, **or** guest/mock path. **Phase 2E:** **non-customer** roles see an Arabic
  message to use the **web** dashboard. Reservations remain **mock** in shared data.
- **API:** **Functional** HTTP routes: **`GET /health`** and **Phase 2B auth** (`POST /auth/otp/request`, `POST /auth/otp/verify`, `GET /auth/me`, `POST /auth/logout`) — same **surface** in 2E/3A (**no** new business routes). **2E** adds **`RbacGuard`** (use on future
  business controllers). **Swagger/OpenAPI** is at `/docs` and `/openapi.json` (see
  [`docs/api-reference.md`](./docs/api-reference.md)). **Prisma:** **2A** auth models + **3A** **Restaurant**, **Branch**,
  **SeatingArea**, **RestaurantTable**, **RestaurantStaffAssignment** (see [`docs/restaurant-data-model.md`](./docs/restaurant-data-model.md)) —
  **no** reservation or payment tables yet. **No** payment APIs.
- **Documentation:** `docs/` includes `mock-data-contract.md`, [`docs/mock-e2e-scenarios.md`](./docs/mock-e2e-scenarios.md) (Phase 1E
  checklist), **[`docs/auth-rbac-foundation.md`](./docs/auth-rbac-foundation.md)** (auth + 2E guards + 3A staff model note), [`docs/rbac-route-access.md`](./docs/rbac-route-access.md), [`docs/restaurant-data-model.md`](./docs/restaurant-data-model.md) (Phase 3A),
  **[`docs/local-auth-verification.md`](./docs/local-auth-verification.md)** (Postgres + curl, Phase 2B.1), and
  the OpenAPI/Swagger maintenance rule in `docs/api-reference.md`.

## Next sub-phase (not implemented)

**3B** — **Seed data** and **restaurant admin internal APIs** (per blueprint/implementation plan). **Not** implemented in
this repository step; see [`docs/implementation-plan.md`](./docs/implementation-plan.md) and
[`eventaat_product_execution_blueprint_v1.md`](./docs/eventaat_product_execution_blueprint_v1.md).
