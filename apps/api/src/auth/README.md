# Auth & RBAC (API) — foundation

**Phase 2A** adds the **database schema** and this folder for **constants/types** only. There are **no** HTTP
routes, **no** JWT, **no** guards, and **no** OTP send/verify implementation here.

## Prisma models (source of truth)

| Model | Purpose |
|-------|--------|
| `User` | Account: phone, normalized phone, display fields, `primaryRole`, `status`, verification flags. |
| `UserRoleAssignment` | One row per scoped role: `RoleScopeType` + `scopeId` (empty string = platform scope key; non-empty = future entity id). |
| `OtpChallenge` | OTP **metadata** and **code hash** only; raw codes are never stored. |
| `UserSession` | Future refresh/session records (`refreshTokenHash` optional until Phase 2B+). |
| `AuditLog` | Append-only style log for security-relevant events (`actorType` = user, system, support). |

## Role meanings

Align with the product blueprint and `packages/shared` `UserRole` + `USER_ROLE_LABELS_AR`. **Super admin**
is rare and fully audited; restaurant roles apply per future restaurant/branch ids via `UserRoleAssignment`.

## Next phases (not implemented in 2A)

- **2B** — Auth HTTP API (login, token refresh, logout), DTOs, **Swagger** decorators, same step updates `docs/api-reference.md`.
- **2C** — WhatsApp (and optional SMS) **provider** interface; persist `OtpChallenge` and provider ids only.
- **2D** — Web/mobile clients: store tokens, call auth APIs, Arabic RTL UI unchanged in principle.
- **2E** — **RBAC** guards, Nest `ExecutionContext` role/scope rules, protected dashboard shells.

See `docs/auth-rbac-foundation.md` for the full data model and lifecycle.
