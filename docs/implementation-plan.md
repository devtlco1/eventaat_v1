# Implementation plan (from Product & Execution Blueprint)

This file summarizes the execution **phases** defined in
[`eventaat_product_execution_blueprint_v1.md`](./eventaat_product_execution_blueprint_v1.md). It is not
an implementation commitment beyond what the blueprint states.

## Phase 0 — Product and identity

Goal: lock product shape before heavy engineering. Covers naming, brand, user definitions, first
cities, target restaurants, commercial model, join terms, booking/cancellation/privacy text, and
initial WhatsApp copy. **Outputs:** approved blueprint, business offer, first 30 restaurant list,
simple identity, and technical stack decision.

## Phase 1 — Full prototype with mock data

Goal: near-complete UIs with **no real backend**. **Customer app:** mock registration, home, search, restaurant
page, booking, “my reservations”, details, review. **Restaurant dashboard:** day board, reservations,
details, accept/reject, tables, hours. **eventaat admin:** restaurants, reservations, call center,
complaints, subscriptions. **Output:** near-complete UI, organized mock data, trialed scenario list, gaps
before backend.

The engineering work is split into sub-steps (1A, 1B, …) so the mock contract and shells land before
deep UI work.

### Phase 1A — Mock contract + navigation shells (done in repo)

- **Shared package:** `UserRole`, all lifecycle `*Status` constants, Arabic label maps, entity interfaces,
  and **central** mock files under `packages/shared/src/mock/` (see
  [`mock-data-contract.md`](./mock-data-contract.md)).
- **Web:** RTL dashboard **shell** with **routes/sections** for restaurant, admin, and call center;
  pages are **list/count placeholders** pulling from `@eventaat/shared` only.
- **Mobile (customer):** state-based **navigation** and placeholder **screens** (Welcome → Home, Search, …)
  with mock **cards**; no login/OTP.
- **API:** unchanged; **only** `GET /health`. No Prisma business tables, no new endpoints.

### Phase 1B — Customer mobile UI prototype (done in repo)

- **Shared:** Seating/occasion constants and labels; extended `Restaurant` / `Reservation` fields used by
  the customer prototype; helpers like `getDiscoverableRestaurants` and `getRestaurantById` (see
  [`mock-data-contract.md`](./mock-data-contract.md)).
- **Mobile:** Arabic-first RTL **customer** app with **mock-only** session (guest, mock login, mock OTP,
  mock registration) and **in-memory** pending reservations. Screens: welcome and auth, home,
  search with local filtering, restaurant details, create booking with review, pending confirmation, my
  reservations (grouped by status), reservation details (timeline and prototype actions), profile, support.
  **No** API, **no** real OTP/WhatsApp, **no** Prisma business tables.
- **API:** unchanged; **only** `GET /health` (see [`api-reference.md`](./api-reference.md)).
- **Web / other dashboards:** unchanged placeholders (not part of 1B).

### API Docs Foundation — OpenAPI / Swagger (done in repo)

- **Goal:** ship **documentation infrastructure** before business APIs so every later backend step can
  keep **`/docs`** and **`/openapi.json`** in sync.
- **Implementation:** `@nestjs/swagger` in `apps/api` (`DocumentBuilder` metadata, `HealthController`
  decorators + `HealthResponseDto`, `setupOpenApiDocs` in `openapi.setup.ts`). **No** new business routes.
- **Maintenance rule:** any route add/change/remove must update **both** OpenAPI decorators and
  [`api-reference.md`](./api-reference.md) in the same work item (stated in that file).

### Phase 1C — Restaurant web dashboard in depth (done in repo)

- **Web (restaurant only):** Arabic-first RTL **operational** UI for `r_visible` (shared mock) at
  `/restaurant` (day metrics, by-status lists, late/pending), `/restaurant/reservations` (table + filters
  + status-based actions, detail drawer, reject/alt-time dialogs), `/restaurant/tables`, `/restaurant/branches`,
  `/restaurant/settings` — all **client-side** state, **no** API. Centralized copy in
  `apps/web/lib/arStrings.ts`; role switcher in layout for **restaurant_owner / branch_manager / restaurant_host**.
- **Not in 1C:** **Admin** and **call center** detailed UIs; **no** new backend, **no** new routes beyond existing
  [`api-reference.md`](./api-reference.md) surface.
- **API / DB:** still **`GET /health` only**; no Prisma business schema.

### UI Recovery + Dashboard Polish (done in repo)

- **Not** a new product phase; this step **upgrades the web** (`apps/web`) to a professional Arabic
  RTL **operational mock** look: **Almarai** (via `next/font/google`), a shared set of **dashboard UI
  components** under `components/ui/`, `components/dashboard/`, and feature folders under
  `components/admin/`, `components/call-center/`, and existing `components/restaurant/`.
- **Admin** (`/admin`, restaurants, reservations, complaints, subscriptions), **call center**
  (`/call-center/*`), and **platform** (`/dashboard`) use **KPIs, toolbars, tables, drawers, and
  local state** only; all numbers come from **`@eventaat/shared`** (including helpers in
  `mock/platform-aggregates.ts`, extended complaints/tasks/subscriptions, and
  `communication-logs` / `admin-extras` where needed).
- **No** new API routes, **no** backend business logic, **no** Prisma business schema changes.
  **Only** `GET /health` plus **`/docs`** / **`/openapi.json`** (see [`api-reference.md`](./api-reference.md)).

### Phase 1E — Mock E2E scenario testing + UI polish (done in repo)

- **Goal:** Validate and polish the **full mock prototype** (customer mobile + restaurant + admin + call
  center web) for coherence and realistic coverage **before** real backend work.
- **Docs:** Checklist in [`mock-e2e-scenarios.md`](./mock-e2e-scenarios.md). **Web:** busier tables use
  a primary **عرض** action plus compact row menus; detail drawers include summary, related entities, timeline
  or communication log where relevant, and suggested next step; **Arabic-first** nav labels and
  operational copy (see `apps/web/lib/arStrings.ts` and shell nav). **Shared:** mock data extended only
  in `packages/shared/src/mock/` (no hardcoded domain arrays in components).
- **Not in 1E:** business APIs, Prisma business schema, real auth, OTP, WhatsApp send, payments, or billing.
- **API / DB:** still **`GET /health` only**; **Swagger/OpenAPI** unchanged in purpose
  ([`api-reference.md`](./api-reference.md)).

## Phase 2 — Accounts and permissions

Goal: sign-in and role foundation. **Includes:** customer phone sign-up, WhatsApp OTP, account
creation, restaurant staff login, eventaat admin login, roles, permissions, activity log, role-based
screen protection. **Testing focus:** new/old customer, OTP errors, staff without permission, disabled
restaurant, call center agent, admin.

### Phase 2A — Auth / RBAC database foundation (done in repo)

- **Prisma:** `User`, `UserRoleAssignment`, `OtpChallenge`, `UserSession`, `AuditLog` + enums
  (`UserRole` aligns with `packages/shared`, `UserStatus`, OTP enums, `RoleScopeType`, `AuditActorType`).
  **No** `Restaurant` / `Branch` Prisma models yet; assignments use `scopeId` (empty string = platform
  key) for future business FKs. **FoundationSchemaMarker** retained. Raw OTP **never** stored; only
  `codeHash` on `OtpChallenge`.
- **Migrations:** create with `npx prisma migrate dev --name auth_foundation` when `DATABASE_URL`
  points at a live Postgres (e.g. `docker compose up -d postgres` from repo root). If no DB in CI,
  run **`npx prisma validate`**, **`npx prisma generate`**; apply migration in each environment.
- **API:** still **no** new HTTP routes, **no** login/OTP/JWT/guards. **Only** `GET /health` + **Swagger
  surfaces** ([`api-reference.md`](./api-reference.md)). Lightweight `apps/api/src/auth/` holds docs +
  type mirrors only.
- **Shared:** `prisma-auth-alignment.ts` keeps `UserRole` string values conceptually aligned with
  Prisma. Mock UI unchanged.
- **Product doc:** [`auth-rbac-foundation.md`](./auth-rbac-foundation.md) describes models and follow-on
  phases 2B–2E.

### Phase 2B — Auth HTTP API: OTP, JWT, session (done in repo)

- **HTTP:** `POST /auth/otp/request`, `POST /auth/otp/verify`, `GET /auth/me`, `POST /auth/logout` in
  `apps/api`. **No** real WhatsApp send; no restaurant/reservation/payment routes. **Swagger** and
  [`api-reference.md`](./api-reference.md) updated in the same step. Environment variables: see
  `apps/api/.env.example` (`JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_DAYS`,
  `OTP_EXPIRES_MINUTES`, `OTP_MAX_ATTEMPTS`, `AUTH_DEV_EXPOSE_OTP` for dev-only `devOtp` in the request
  response when enabled).
- **Prisma (unchanged business models):** uses 2A tables only. E2E auth tests run when `DATABASE_URL` and
  `JWT_ACCESS_SECRET` are set; unit tests cover phone + crypto helpers. Apply schema with
  `prisma migrate` / `prisma db push` before first real auth run (see
  [`auth-rbac-foundation.md`](./auth-rbac-foundation.md)).
- **Not 2B:** at-the-time, real WhatsApp wire-up (added in 2C); RBAC **route** guards, mobile/web client
  wiring (Phase 2D+).

### Phase 2B.1 — Auth migration + local DB verification (done in repo)

- **Prisma:** committed migration `apps/api/prisma/migrations/*/auth_foundation` (timestamped folder) creates
  enums and tables for **User**, **UserRoleAssignment**, **OtpChallenge**, **UserSession**, **AuditLog**,
  plus **FoundationSchemaMarker**. Apply with `npx prisma migrate deploy` (or `migrate dev` in development)
  when `DATABASE_URL` points at PostgreSQL.
- **Docker:** `docker compose up -d postgres redis` from the repo root for local services.
- **E2E:** with `DATABASE_URL` + `JWT_ACCESS_SECRET` (+ `AUTH_DEV_EXPOSE_OTP=true` for `devOtp` assertions), **`npx
  jest --config ./test/jest-e2e.json` runs the auth e2e suite (not skipped)**. **No** new HTTP routes; **no** auth
  behavior change beyond any test fixes.
- **Docs:** [`local-auth-verification.md`](./local-auth-verification.md), updates to this file,
  [`api-reference.md`](./api-reference.md), [`auth-rbac-foundation.md`](./auth-rbac-foundation.md), **README**.

### Phase 2C — OTP delivery provider layer (done in repo)

- **Code:** `apps/api/src/auth/otp/` — `OtpProviderConfig`, `MockOtpProvider`, `WhatsappOtpProvider` (Graph
  template, timeout, response sanitization), `SmsOtpProvider` (placeholder, no real vendor), `OtpDispatcherService`.
- **No** new public HTTP routes; `POST /auth/otp/request` **behavior** and persistence of `OtpChallenge.provider*`
  fields. **No** Prisma schema change. **No** real SMS integration.
- **Env:** `OTP_DELIVERY_PROVIDER`, `OTP_DELIVERY_DRY_RUN`, WhatsApp `WHATSAPP_*` variables, SMS placeholder
  `SMS_PROVIDER` / `SMS_DRY_RUN` (see `apps/api/.env.example` and
  [`otp-delivery-provider.md`](./otp-delivery-provider.md)). Default transport is **mock** (safe).
- **Tests:** unit tests for selection, dry-run, missing WhatsApp config, response sanitization, and no OTP in logs;
  e2e with mock + DB assertions. **Not** used: real Graph calls in tests.
- **Docs:** this file, `README`, [`api-reference.md`](./api-reference.md), [`local-auth-verification.md`](./local-auth-verification.md), [`auth-rbac-foundation.md`](./auth-rbac-foundation.md), [`whatsapp-templates.md`](./whatsapp-templates.md), [`otp-delivery-provider.md`](./otp-delivery-provider.md).
- **Not 2C:** client apps (2D+), full RBAC route guards (2E), real SMS provider.

### Phase 2D — Frontend auth integration (done in repo)

- **Shared:** `packages/shared/src/auth-client/` — `createAuthApi`, DTO-shaped types, `AuthApiError`.
- **Mobile:** `EXPO_PUBLIC_API_BASE_URL` + `expo-secure-store`; real OTP/login/register when the base URL is set
  (or `EXPO_PUBLIC_MOCK_AUTH=true` / no URL to keep the mock UI path). Arabic-first strings; `devOtp` only in
  a marked local-dev area when the API returns it. **No** new API routes.
- **Web:** `NEXT_PUBLIC_API_BASE_URL` (default `http://127.0.0.1:3000` in code), `NEXT_PUBLIC_AUTH_REQUIRED` (default
  `false`) + `/login` + `WebAuthProvider` + `AuthGate` + `localStorage` (prototype; production should use
  httpOnly cookies — documented). Session chip and logout in `DashboardShell`.
- **API:** CORS in `main.ts` via `CORS_ORIGINS` / `CORS_ALLOW_DEV_ALL` (documented in `apps/api/.env.example`). **No**
  auth contract changes; **no** business routes.
- **Docs:** `README`, [`api-reference.md`](./api-reference.md) (2D: no new endpoints; future rule preserved),
  [`frontend-auth-integration.md`](./frontend-auth-integration.md), [`local-auth-verification.md`](./local-auth-verification.md), [`auth-rbac-foundation.md`](./auth-rbac-foundation.md), [`mock-e2e-scenarios.md`](./mock-e2e-scenarios.md) (note on real auth), app `.env.example` files.
- **Not 2D:** full **RBAC** route guards (2E), business APIs, real reservation/restaurant data from the backend.
- **Type alignment:** root `package.json` **pnpm `overrides`** for `@types/react` / `@types/react-dom` to keep **Next**
  `next build` typecheck stable with React 19.

### Phase 2E — RBAC guard foundation + protected dashboard shells (done in repo)

- **API (Nest):** `apps/api/src/auth/rbac/` — `@Roles(…)` (optional `@RoleScopeTypes(…)` for scope filtering),
  **`RbacGuard`** (use **after** `JwtSessionGuard` for future business controllers), utilities, **`@CurrentUser()`**
  decorator, unit tests. **No** new public HTTP routes; **auth** routes (`/auth/otp/*`, `/auth/me`, `/auth/logout`) do
  **not** require `RbacGuard`.
- **Shared:** `packages/shared/src/rbac/` — role **area** helpers (`canAccessDashboardPath`, `CUSTOMER_ROLES`,
  `RESTAURANT_ROLES`, etc.); used by the web shell.
- **Web:** `AuthGate` + `canAccessDashboardPath` when `NEXT_PUBLIC_AUTH_REQUIRED=true` — unauthenticated users →
  `/login`; **authenticated but wrong role** → Arabic **unauthorized** screen (`غير مصرح بالوصول`). Sidebar can hide
  nav groups the role cannot use. Prototype mode (`AUTH_REQUIRED=false`) keeps all routes browsable; footer shows
  “وضع العرض التجريبي” when appropriate. See [`rbac-route-access.md`](./rbac-route-access.md).
- **Mobile:** customer-first; if the signed-in user is **not** `customer` (operator account), show a friendly
  **Arabic** message to use the **web** dashboard; **no** operator features on mobile. Guest/mock path unchanged.
- **Docs:** `README`, this file, [`api-reference.md`](./api-reference.md) (2E: no new endpoints), `auth-rbac-foundation.md`,
  `frontend-auth-integration.md`, `roles-permissions.md`, `mock-e2e-scenarios.md`, [`rbac-route-access.md`](./rbac-route-access.md).
- **Not 2E:** business **API** endpoints, refresh route, per-resource `content_manager` / `finance_manager` URL
  **granularity** (Phase 2E may allow all `/admin/*` for `content_manager`; `finance_manager` is limited to
  `/admin/subscriptions` in path rules — see `rbac-route-access.md`).

### Phase 2E.1 — Web dashboard usability (done in repo)

- **No** new API routes; **no** Prisma changes; business data still **mock-only**.
- **Layout:** `DashboardShell` — **fixed** sidebar, **independent** scroll for main content (single main scrollbar, RTL-safe).
- **Tables:** `TablePagination` + `usePaginatedRows` — default **10** rows; sizes **10 / 20 / 50**; Arabic range text;
  **client-side** only; page resets when filters (serialized `resetKey`) change. Applied to listed admin, call
  center, and restaurant table views, plus **branch** cards and **subscription** list where applicable.
- **Row actions:** `RowActionMenu` — menu **portaled** to `document.body`, `z-index` above tables; outside click
  and **Escape** close. See [`../apps/web/components/ui/RowActionMenu.tsx`](../apps/web/components/ui/RowActionMenu.tsx).
- **Login:** clearer Arabic copy when the API is unreachable (network / wrong base URL); no auth API code changes.
- **Docs:** `README`, [`api-reference.md`](./api-reference.md) (2E.1: no new endpoints), [`local-auth-verification.md`](./local-auth-verification.md)
  (copy-paste start commands for API + web), this file, [`frontend-auth-integration.md`](./frontend-auth-integration.md). Developer
  port/env notes: API **3000**, web **3001**; `AUTH_DEV_EXPOSE_OTP` local only.

## Phase 3 — Restaurants, branches, tables

Goal: operational setup for each restaurant. **Includes:** create/review/activate restaurant, branch, tables,
hours, temporary closure, photos, info, tags, areas. **Testing focus:** under review, needs edit,
active, closed branch, out-of-service table, Ramadan hours, etc.

## Phase 4 — Core reservation flow

Goal: end-to-end reservation from customer to restaurant. **Includes:** create request, Pending, approve,
reject, alternative time, customer cancel, restaurant cancel, Expired, WhatsApp notifications, change log. **Testing focus:**
success, reject, alternative, no response, cancels, time/headcount issues.

## Phase 5 — Day of visit and presence

Goal: in-venue day-of operations. **Includes:** on the way, Arrived, Waiting, Seated, Completed, late,
No Show, reminders, call center follow-up. **Testing focus:** on time, late, no-show, different
party size, table not ready, table change.

## Phase 6 — Call center and complaints

Goal: human operations layer. **Includes:** call center board, follow-up tasks, comms log, complaints, escalation,
close, internal notifications. **Testing focus:** long-pending, customer vs restaurant complaint,
supervisor escalation, close/reopen.

## Phase 7 — Subscriptions and business model

Goal: financial relationship with restaurants. **Includes:** join package, first 3 months free, monthly
subscription, subscription status, expiring warnings, late payment, suspend reservations when needed,
simple invoices. **States:** Trial Active, Active, Payment Due, Overdue, Suspended, Cancelled.

## Phase 8 — Reviews and trust

Goal: quality and trust on the platform. **Includes:** review after Completed, internal customer score,
trust points, quality alerts, high-cancel restaurants, No Show customers.

## Phase 9 — Offers and occasions

Goal: revenue and value. **Includes:** restaurant offers, offer review, premium placement, special
occasions, large parties, depostits (later in blueprint context).

## Phase 10 — Pilot launch

Goal: real but limited go-live. **Scope:** Baghdad only, 2–3 areas, 10–30 restaurants, approval-only
bookings, no e-payment at start, WhatsApp OTP and basic notifications, active call center. **Success
criteria** (as in blueprint): e.g. 30 active restaurants, booking volume, response time, complaint rate,
No Show, retention.

## Phase 11 — Scale

Goal: after pilot success. **Blueprint lists:** instant booking for trusted restaurants, deposit payment,
waitlist, paid promos, better reports, separate restaurant app, loyalty, new cities.

---

**Current code status:** **Phases 1A–1E**, **2A/2B** (auth Prisma + HTTP), **2B.1**, **2C** (OTP delivery), **2D** (client
auth), **2E** (RBAC **guard** + **web** route shell; **no** new public API routes), and **2E.1** (web **ux**: fixed
sidebar, table pagination, row action menus, login error copy, docs) are in the repo. The **public** **HTTP** surface (besides 2A–2D) has **no** 2E additions: **`GET /health`**
and auth routes as in [`api-reference.md`](./api-reference.md). See
[`prisma/migrations`](../apps/api/prisma/migrations/),
[`local-auth-verification.md`](./local-auth-verification.md),
[`auth-rbac-foundation.md`](./auth-rbac-foundation.md), and [`rbac-route-access.md`](./rbac-route-access.md).
