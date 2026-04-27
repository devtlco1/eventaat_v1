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
- **Not 2B:** real WhatsApp, RBAC **route** guards, mobile/web client wiring (Phase 2C+).

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

**Current code status:** **Phases 1A–1E**, **Phase 2A** (Prisma auth schema), and **Phase 2B** (auth **HTTP** API
for OTP + JWT + session) are in the repo. The **public** **HTTP** surface includes **`GET /health`** and
**`POST /auth/…`** / **`GET /auth/me`** as in [`api-reference.md`](./api-reference.md) — not restaurant,
reservation, or payment resources yet. See
[`prisma/schema.prisma`](../apps/api/prisma/schema.prisma) and
[`auth-rbac-foundation.md`](./auth-rbac-foundation.md) for the documentation maintenance rule.
