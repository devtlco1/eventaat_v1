# Auth, RBAC, and audit foundation (Phases 2A–2E)

This document describes the **Prisma (2A)** database foundation and the **Phase 2B** **HTTP** auth API
that uses it, plus **Phase 2C** **OTP delivery** (mock, optional WhatsApp Cloud API, SMS placeholder; no
real SMS vendor). **2B** adds: OTP request/verify, JWT access token + opaque refresh token (session row stores
**refresh token hash** only), `/auth/me`, `/auth/logout`, and audit events (`auth.otp_verified`,
`auth.login_success`, `auth.logout`). **2E** adds **`RbacGuard`**, `@Roles(…)` / optional `@RoleScopeTypes(…)`, and
`@CurrentUser()` in `apps/api/src/auth/rbac/` for **future** business routes — **no** new public routes in 2E.
Auth routes themselves remain **`JwtSessionGuard`**-only. **2C** does not add new routes; it wires optional
WhatsApp with env + dry-run. Full route list: [`api-reference.md`](./api-reference.md). OTP delivery:
[`otp-delivery-provider.md`](./otp-delivery-provider.md). **Web** route access rules: [`rbac-route-access.md`](./rbac-route-access.md).

**Source of truth (product):** [`eventaat_product_execution_blueprint_v1.md`](./eventaat_product_execution_blueprint_v1.md).

**Prisma schema:** `apps/api/prisma/schema.prisma` (enums and models). Run `npx prisma generate` after
schema changes. Apply migrations with `npx prisma migrate dev` (or your deployment pipeline) when
`DATABASE_URL` is set.

**Shared `UserRole` keys:** `packages/shared/src/constants/roles.ts` — string values are aligned with
the Prisma `UserRole` enum; use `prisma-auth-alignment.ts` for ordered lists and validation helpers.

---

## 1. User

| Concept | Prisma / notes |
|--------|-----------------|
| Identity | `id` (cuid), `phone` (unique), `phoneNormalized` (unique) |
| Profile | `fullName`, `city` optional |
| State | `UserStatus`: `active`, `pending_verification`, `suspended`, `disabled` |
| Primary role | `primaryRole` — fast path for “main” product role; detailed grants use assignments |
| Verification | `isPhoneVerified` + timestamps: `lastLoginAt`, `disabledAt`, `suspendedAt` |

`primaryRole` uses the same **English** `UserRole` values as the shared package (Arabic labels stay in
`USER_ROLE_LABELS_AR` in UI).

---

## 2. UserRoleAssignment (scoped roles)

A user can have **multiple** rows: same `UserRole` can appear in different **scopes** (e.g. owner of
one restaurant, manager of one branch).

| Field | Purpose |
|-------|--------|
| `role` | `UserRole` (same enum as on `User`) |
| `scopeType` | `RoleScopeType`: `platform`, `restaurant`, `branch`, `call_center` |
| `scopeId` | **String**, default `""`. In **2A** there were no `Restaurant` / `Branch` tables; **Phase
3A** added persisted `Restaurant` and `Branch` models — `scopeId` may now hold the same **cuid** as
`Restaurant.id` or `Branch.id` when the app assigns scoped roles (still **no** Prisma FK on
`UserRoleAssignment`; the link is by convention to avoid coupling auth to business deletes). For
**platform**-wide access, use `scopeType = platform` and `scopeId = ""` (empty string) so a unique
index can apply. |
| `isActive` | Soft disable without deleting history |

**Unique rule:** `@@unique([userId, role, scopeType, scopeId])` — prevents duplicate **lines** for
the same scope; application logic can still implement “at most one active owner per restaurant”
later.

**Why not nullable `scopeId`?** A nullable field would complicate unique constraints in PostgreSQL
(multiple `NULL` scope ids). The empty string convention matches common Prisma patterns; API layers
may expose `null` in JSON and map to `""` for Prisma if desired.

No **Prisma** foreign keys from `UserRoleAssignment` to business tables: **by design** so product
`UserRole` and RBAC scopes stay stable. Operational restaurant staff (owner/manager/host **within** a
venue) are modeled separately as **`RestaurantStaffAssignment`** (Phase 3A) — see
[`restaurant-data-model.md`](./restaurant-data-model.md). Do not confuse the two.

---

## 3. OtpChallenge (OTP lifecycle)

| Field | Purpose |
|-------|--------|
| `purpose` | `OtpPurpose`: `login`, `register`, `phone_verification`, `staff_invite` |
| `channel` | `OtpChannel`: `whatsapp`, `sms`, `manual` |
| `status` | `OtpStatus`: `pending`, `verified`, `expired`, `failed`, `cancelled` |
| `codeHash` | **Only** stored secret — e.g. hash of the OTP; **raw codes are never stored** |
| `expiresAt`, `verifiedAt`, `failedAt` | Lifecycle times |
| `attemptCount` / `maxAttempts` | Brute-force limits (default 5) |
| `userId` | Optional link to a `User` (e.g. re-verify phone) |
| `providerMessageId` / `providerStatus` | Filled by the OTP **delivery** layer: `whatsapp` (Graph message id) or
empty; status `queued` \| `sent` \| `skipped` \| `failed` |
| `metadata` | **Sanitized** transport metadata only — **no** raw OTP, no access tokens (see
[`otp-delivery-provider.md`](./otp-delivery-provider.md)) |

**Lifecycle (runtime, Phase 2B):** see `AuthService` in `apps/api/src/auth/` — verify compares against
`codeHash` only; **raw OTP** is never written to the database.

---

## 4. UserSession

- `refreshTokenHash` — scrypt-based hash; **raw refresh token** is returned once to the client, never
  stored in plain form.
- `userAgent`, `ipAddress`, `expiresAt`, `revokedAt` — session hygiene; logout sets `revokedAt`.

Access is represented by a **short-lived JWT** (payload includes `userId` + `sessionId`); the guard
checks the session is not revoked and not past `expiresAt`.

---

## 5. AuditLog

**Append-style** log for important actions: **auth**, admin, support, or system jobs.

- `actorType` — `user` | `system` | `support`
- `action` — short string code (e.g. `user.login`, `user.role.assign`) to be normalized in 2B+
- `entityType` / `entityId` — optional free-form reference to future business entities
- `metadata` — JSON for structured extra fields
- `actorUserId` — optional; `null` for system/support automation when no user row

Indexes support filtering by user, action, entity, and time range.

---

## 6. Why Phase 2A shipped schema first

The blueprint favors **persisted roles, OTP challenge, and session shapes** before **transport** and
**providers** so product rules and migrations stay stable.

---

## 7. Roadmap after 2B

| Sub-phase | Scope |
|----------|--------|
| **2B** (done) | Auth HTTP: `POST /auth/otp/*`, `GET /auth/me`, `POST /auth/logout`, Swagger + `api-reference.md` (transport expanded in 2C). |
| **2B.1** (done) | Committed Prisma migration `auth_foundation` + e2e against local Postgres; **no** new API routes. |
| **2C** (done) | OTP **adapter**: mock, WhatsApp Cloud (env + dry-run), SMS **placeholder**; `providerMessageId` / `providerStatus`; no real SMS vendor, no new routes. |
| **2D** (done) | **Web and mobile** call **auth** APIs via `@eventaat/shared` `auth-client`; token storage; Arabic-first login/OTP; business data **still mock** in clients. |
| **2E** (done) | **RBAC** (`RbacGuard`, `@Roles`, optional `@RoleScopeTypes`, `@CurrentUser`) in `apps/api/src/auth/rbac/` — **no** new public routes. **Web** protected shell when `NEXT_PUBLIC_AUTH_REQUIRED=true` — see [`rbac-route-access.md`](./rbac-route-access.md). |
| **3A** (done) | **Prisma** restaurant/branch/seating/tables + **`RestaurantStaffAssignment`**. **No** new HTTP routes; no reservation model. See [`restaurant-data-model.md`](./restaurant-data-model.md). |

---

## 8. Migrations (Phase 2B.1: `auth_foundation` in the repo)

The first checked-in migration is under:

`apps/api/prisma/migrations/20260427142646_auth_foundation/migration.sql`

(The timestamp prefix is assigned by Prisma; the migration **name** is `auth_foundation`.) It creates
**enums**, **users**, **user_role_assignments**, **otp_challenges**, **user_sessions**, **audit_logs**, and
**foundation_schema_marker** as in the current `schema.prisma`.

**New environment / first clone:**

```bash
export DATABASE_URL="postgresql://eventaat:eventaat@localhost:5432/eventaat?schema=public"
cd apps/api
npx prisma migrate deploy
```

**Local stack:** from the repo root, `docker compose up -d postgres redis` then set `DATABASE_URL` in
`apps/api/.env`. Manual API checks: [`local-auth-verification.md`](./local-auth-verification.md). Automated
`jest` e2e (including auth) runs with `DATABASE_URL` and `JWT_ACCESS_SECRET` set; auth tests are **not
skipped** when the database is reachable.

**CI / production:** use **`prisma migrate deploy`**, not `migrate dev`, in pipelines. **Non-destructive**
policy: do not run destructive changes without a reviewed plan.

**Phase 3A — `restaurant_branch_table_foundation`:** see [`restaurant-data-model.md`](./restaurant-data-model.md) for
the migration name and `prisma migrate dev` example.

---

## 9. Restaurant staff vs auth roles (Phase 3A)

- **`User` / `UserRole` / `UserRoleAssignment`:** product-wide identity and **RBAC** (platform, restaurant, branch, call
  center **scopes** as strings). Unchanged in meaning from Phase 2A.
- **`RestaurantStaffAssignment`:** links a **User** to a **Restaurant** and optionally a **Branch** with
  `RestaurantUserRole` (**owner** / **manager** / **host** / **viewer**) for **in-venue operations**
  scoping. This is **not** a duplicate of `UserRole` — a user may be `restaurant_owner` in RBAC and also
  have staff rows, or the product may use assignments differently in Phase 3B+ APIs. See
  [`restaurant-data-model.md`](./restaurant-data-model.md).

---

## 10. Legacy / foundation

`FoundationSchemaMarker` (Step 0) remains in the schema for **existing** empty databases; new installs
get auth tables alongside it. Dropping the marker is **not** required in 2A.
