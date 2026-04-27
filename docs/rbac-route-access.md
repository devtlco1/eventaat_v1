# RBAC and web route access (Phase 2E)

**Phase 2E** adds **server-side** authorization building blocks and **client-side** dashboard path rules. **No new
public API endpoints** were added; the OpenAPI document is unchanged in surface area. See
[`api-reference.md`](./api-reference.md) for the maintenance rule when routes change.

**Product source:** [`eventaat_product_execution_blueprint_v1.md`](./eventaat_product_execution_blueprint_v1.md)

---

## API (Nest): `RbacGuard` and decorators

- **Location:** `apps/api/src/auth/rbac/`
- **Usage (future business controllers):** `UseGuards(JwtSessionGuard, RbacGuard)` after controllers are
  added; **`@Roles(UserRole.…)`**; optional **`@RoleScopeTypes(RoleScopeType.…)`** to require matching
  assignment scope types.
- **Behavior (summary):** `super_admin` is always allowed. Otherwise checks **`primaryRole`** and active
  **`UserRoleAssignment`** rows (with optional scope type filter from metadata). **Disabled** / **suspended**
  users get **403**. Unauthenticated requests are rejected (**401/403** depending on guard order — keep
  `JwtSessionGuard` first).
- **Auth routes** (`/auth/otp/*`, `/auth/me`, `/auth/logout`) stay **without** `RbacGuard` — only session/JWT
  as today.

`@CurrentUser()` reads the user attached by the JWT guard. Details: [`auth-rbac-foundation.md`](./auth-rbac-foundation.md).

---

## Web: `NEXT_PUBLIC_AUTH_REQUIRED`

| Value | Behavior |
|-------|----------|
| `false` (default) | All dashboard routes stay **browsable** for prototype review. **Navigation** is **not** hidden by role. Footer can show “وضع العرض التجريبي” and a **login** link; session chip when signed in. |
| `true` | **Unauthenticated** users are redirected to **`/login`**. **Authenticated** users are checked with **`canAccessRoute`** (alias of `canAccessDashboardPath` in `@eventaat/shared`). If denied → **غير مصرح بالوصول** (see `UnauthorizedView`). **Sidebar** entries are filtered to allowed paths. |

**Implementation:** `AuthGate`, `apps/web/lib/routeAccess.ts` (re-exports shared helpers), `DashboardShell`.

**Arabic labels** for roles: `USER_ROLE_LABELS_AR` in `@eventaat/shared` and web shell.

---

## Role → area (path) rules (coarse, Phase 2E)

All checks use **English** `UserRole` values; UI shows **Arabic** labels.

| Area / path prefix | Allowed roles (high level) |
|--------------------|----------------------------|
| **`/dashboard` (hub)** | `operations_admin`, `content_manager`, `super_admin` — not restaurant-only, call center-only, or `finance_manager` (finance uses subscriptions path only) |
| **`/restaurant`, `/restaurant/*`** | `restaurant_owner`, `branch_manager`, `restaurant_host` + `super_admin` |
| **`/call-center`, `/call-center/*`** | `call_center_agent`, `call_center_supervisor`, `operations_admin`, `super_admin` |
| **`/admin`, `/admin/*` (except subscriptions)** | `operations_admin`, `content_manager`, `super_admin` — **not** call center agents, not restaurant staff |
| **`/admin/subscriptions*`** | `finance_manager` (only admin path they can use in 2E), plus `super_admin` / `operations_admin` as full admin where applicable |

**`customer`:** not a dashboard operator — **no** access to these shells in strict mode (unauthorized or redirect pattern).

**Limitation (2E):** `content_manager` can reach **all** `/admin/*` paths in the path helper — **not** a fine-grained
per-resource policy yet. `finance_manager` is limited to **subscriptions** URL prefix only for `/admin` access.

**Super admin:** all areas.

**Shared helpers:** `packages/shared/src/rbac/role-areas.ts` — `CUSTOMER_ROLES`, `RESTAURANT_ROLES`,
`CALL_CENTER_ROLES`, `PLATFORM_ADMIN_ROLES`, `canAccessDashboardPath`, `canRoleAccessArea`.

---

## Mobile

Primary **customer** app. If `primaryRole !== customer` when using the real API, show: **هذا الحساب مخصص
للوحة التحكم. يرجى استخدام لوحة الويب.** **No** operator features on mobile; guest/mock paths unchanged.

---

## Tests

- API: `apps/api/src/auth/rbac/rbac.guard.spec.ts` (and existing auth e2e).
- Shared: type-safe; path logic is single-module.

## Next phase

**3A** — restaurant / branch / table **Prisma** foundation (not part of 2E).
