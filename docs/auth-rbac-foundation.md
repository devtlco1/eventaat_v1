# Auth, RBAC, and audit foundation (Phases 2A–2D)

This document describes the **Prisma (2A)** database foundation and the **Phase 2B** **HTTP** auth API
that uses it, plus **Phase 2C** **OTP delivery** (mock, optional WhatsApp Cloud API, SMS placeholder; no
real SMS vendor). **2B** adds: OTP request/verify, JWT access token + opaque refresh token (session row stores
**refresh token hash** only), `/auth/me`, `/auth/logout`, and audit events (`auth.otp_verified`,
`auth.login_success`, `auth.logout`). It does **not** add product RBAC **guards** on business routes yet
(**2E**). **2C** does not add new routes; it wires optional WhatsApp with env + dry-run. Full route list:
[`api-reference.md`](./api-reference.md). OTP delivery: [`otp-delivery-provider.md`](./otp-delivery-provider.md).

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
| `scopeId` | **String**, default `""`. **No** `Restaurant` / `Branch` Prisma models in 2A — this holds a
future entity id. For **platform**-wide access, use `scopeType = platform` and `scopeId = ""`
(empty string) so a unique index can apply. For restaurant/branch/call-center, set `scopeId` to the
target id when those tables exist. |
| `isActive` | Soft disable without deleting history |

**Unique rule:** `@@unique([userId, role, scopeType, scopeId])` — prevents duplicate **lines** for
the same scope; application logic can still implement “at most one active owner per restaurant”
later.

**Why not nullable `scopeId`?** A nullable field would complicate unique constraints in PostgreSQL
(multiple `NULL` scope ids). The empty string convention matches common Prisma patterns; API layers
may expose `null` in JSON and map to `""` for Prisma if desired.

No foreign keys to business tables in **Phase 2A** by design.

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
| **2E** | **RBAC guards** (Nest), route protection, and dashboard shells per role/scope. |

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

---

## 9. Legacy / foundation

`FoundationSchemaMarker` (Step 0) remains in the schema for **existing** empty databases; new installs
get auth tables alongside it. Dropping the marker is **not** required in 2A.
