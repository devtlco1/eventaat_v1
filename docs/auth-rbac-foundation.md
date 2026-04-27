# Auth, RBAC, and audit foundation (Phase 2A)

This document describes the **Phase 2A** database and domain **foundation** for authentication,
WhatsApp/SMS/manual OTP, user roles, scoped role assignments, future sessions, and auditability. It
implements **no** HTTP API, **no** token issuance, **no** providers, and **no** route guards (those are
**Phase 2B+**).

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
| `providerMessageId` / `providerStatus` | Reserved for **Phase 2C** WhatsApp/SMS providers |
| `metadata` | JSON for extra non-sensitive data |

**Lifecycle (conceptual):** create row → `pending` → (success) `verified` or (timeout/attempts) `expired` / `failed` or `cancelled`. **Phase 2A** does not implement verify/send code paths.

---

## 4. UserSession

Prepares for **Phase 2B+** access and refresh patterns:

- `refreshTokenHash` — no raw refresh tokens in DB
- `userAgent`, `ipAddress`, `expiresAt`, `revokedAt` — session hygiene and security reviews

No JWT or cookie logic in 2A.

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

## 6. Why Phase 2A has no real login or OTP

The blueprint requires a **clear separation**: first **persisted roles and challenge/session shapes**,
then **APIs, transport security, and providers** in a controlled order. Rushing auth routes before the
schema would entangle product rules with throwaway DTOs.

---

## 7. Next sub-phases (not implemented in 2A)

| Sub-phase | Scope |
|----------|--------|
| **2B** | Auth **HTTP** endpoints (request OTP, verify, register, login, refresh, logout), DTOs, **Swagger** updates, `docs/api-reference.md` in the same work item. |
| **2C** | **WhatsApp** (and optional SMS) **adapter**; write `OtpChallenge` and provider message ids; still no product scope outside blueprint. |
| **2D** | **Web and mobile** integration: call APIs, store tokens, Arabic-first RTL **unchanged** in principle. |
| **2E** | **RBAC guards** (NestJS), route protection, and dashboard shells per role/scope. |

---

## 8. Migrations (when the database is available)

From the repo root with PostgreSQL up (e.g. `docker compose up -d postgres`):

```bash
export DATABASE_URL="postgresql://eventaat:eventaat@localhost:5432/eventaat?schema=public"
cd apps/api
npx prisma migrate dev --name auth_foundation
```

If a migration is created in another branch/CI, deploy with your normal **migrate deploy** process.
**Non-destructive** policy: do not run destructive changes without a reviewed migration plan.

---

## 9. Legacy / foundation

`FoundationSchemaMarker` (Step 0) remains in the schema for **existing** empty databases; new installs
get auth tables alongside it. Dropping the marker is **not** required in 2A.
