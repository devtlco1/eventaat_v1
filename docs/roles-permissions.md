# Roles and permissions (blueprint)

This document structures **roles and permission themes** as described in
[`eventaat_product_execution_blueprint_v1.md`](./eventaat_product_execution_blueprint_v1.md) (Part 5
— الأدوار والصلاحيات). **Phase 1A** shipped **static** copy and mock labels only. **Phase 2E** adds
**enforcement** in the **web** shell (when `NEXT_PUBLIC_AUTH_REQUIRED=true`) and an **API** `RbacGuard` for
future business routes — not full blueprint-level permission matrix yet.

**Code (Phase 1A+):** canonical role keys and Arabic labels for UI and mock data live in
`packages/shared` as `UserRole` and `USER_ROLE_LABELS_AR` (see
[`mock-data-contract.md`](./mock-data-contract.md)). That includes
`content_manager` and `finance_manager` for future admin/finance **screens**; business actions remain
blueprint-constrained. **Phase 2B (API):** the backend issues JWTs and returns `User` + `roleAssignments` on
`GET /auth/me`. **Phase 2E (done):** the **web** app enforces **path-level** access by `primaryRole` when
`NEXT_PUBLIC_AUTH_REQUIRED=true` (see [`rbac-route-access.md`](./rbac-route-access.md)). The **API** ships
`RbacGuard` for **future** business controllers (no new public routes in 2E). **Prototype** browsing with
`NEXT_PUBLIC_AUTH_REQUIRED=false` keeps all dashboard areas visible for **review**; copy explains this is
not real authorization. **Mobile** is customer-oriented; **non-customer** logins see an Arabic message to
use the **web** dashboard.

## Principles

- No one sees or changes more than needed.
- Important operations must be recorded in an activity log: who, when, which reservation, what
  changed, and why.

## Customer (الزبون)

**May:** edit profile, create booking requests, view own reservations, cancel per policy, request
changes, review after the visit, open a complaint, save favorite restaurants.

**May not:** self-confirm where restaurant approval is required, change a confirmed time without
approval, rate without a **Completed** reservation, delete the reservation history from the system.

## Restaurant owner (صاحب المطعم)

**May:** see all of their restaurant’s branches, edit restaurant data, add/suspend staff, manage
branches and tables, view reports, accept/reject reservations, manage offers, view ratings/complaints
for their restaurant, pay subscription or view subscription status.

**May not:** see other restaurants’ data, change eventaat admin decisions, delete complaints
permanently, delete reservations from the log, change customer reviews.

## Branch manager (مدير الفرع)

**May:** see that branch’s reservations, accept/reject in that branch, manage that branch’s tables,
update visit-state fields, suggest alternative times, create temporary closures for that branch when
permitted.

**May not:** manage restaurant subscription, see all branches if not authorized, change main
restaurant data, add a new owner.

## Reception / Host (موظف الاستقبال)

**May:** see today’s reservations, check customer arrival, seat, complete the reservation, mark
**عدم حضور (لم يحضر)** per policy, add operational notes, suggest an alternative time when allowed.

**May not:** change restaurant settings, change subscription, delete reservations, add staff, change
cancellation policy.

## Call center agent (Call Center Agent)

**May:** see assigned or all reservations per policy, contact customer/restaurant, add notes, send
reminders, open a complaint, escalate, mark “needs follow-up”.

**May not:** delete a reservation, change payment amounts, refund a deposit without approval, disable
a restaurant, change subscription, change sensitive data without approval.

## Call center supervisor (Call Center Supervisor)

**May:** all agent permissions, assign tasks, review agent performance, close some complaints, approve
escalation, review disputed **عدم حضور (لم يحضر)** cases, request temporary restaurant suspension.

## Operations admin (Operations Admin)

**May:** manage restaurants, enable or disable booking operations, follow complaints, review
restaurant quality, manage cities and categories, review anomalous reservations.

## Super admin (Super Admin)

**May do everything;** use must be very limited; all actions must be logged.

---

**Phase 2A (done in API schema):** Prisma models `User`, `UserRoleAssignment`, and enums align with the
`UserRole` string keys in `packages/shared` — no HTTP enforcement yet. See
[`auth-rbac-foundation.md`](./auth-rbac-foundation.md) (including **next sub-phases**). **UI** and
mock data continue to work without a real API.

*JWT/session and `GET /auth/me` are **Phase 2B**. **Path-level** web dashboard protection and the **API** `RbacGuard`
foundation are **Phase 2E**; fine-grained per-screen permissions for `content_manager` / `finance_manager` may
evolve in later phases — see [`rbac-route-access.md`](./rbac-route-access.md).*

**Phase 3A (Prisma, no new HTTP routes):** the database adds **`RestaurantStaffAssignment`** with
`RestaurantUserRole` (`owner`, `manager`, `host`, `viewer`) to scope a **`User`** to a **restaurant** and
optionally a **branch** for **operational** access. This is separate from product **`UserRole`** /
**`UserRoleAssignment`** (see [`auth-rbac-foundation.md`](./auth-rbac-foundation.md) and
[`restaurant-data-model.md`](./restaurant-data-model.md)). Future APIs can combine JWT + RBAC with staff
rows as needed.
