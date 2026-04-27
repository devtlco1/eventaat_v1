# Restaurant data model (Phase 3A — database only)

**Source of truth (product):** [`eventaat_product_execution_blueprint_v1.md`](./eventaat_product_execution_blueprint_v1.md).

Phase **3A** adds **persisted** Prisma models for restaurants, branches, seating areas, tables, and
**restaurant staff** links. It does **not** add reservation or payment tables, **does not** add public HTTP
APIs, and **does not** connect dashboards to the database — mock UIs remain unchanged.

---

## Scope of this phase

| In scope | Out of scope (later phases) |
|----------|------------------------------|
| Enums and tables listed below | `Reservation`, waitlist, payments |
| `User.restaurantStaffAssignments` | Restaurant CRUD / admin HTTP APIs (e.g. **3B**) |
| Migration + `prisma generate` | Integrating web/mobile with real rows |
| Documentation + label maps in `@eventaat/shared` for **Prisma** enum keys | Production seed scripts (optional **3B**) |

**No new API endpoints** were added in Phase 3A. Whenever routes are added later, update **Swagger** and
[`api-reference.md`](./api-reference.md) in the same change.

---

## Enums (Prisma / English keys)

- **`RestaurantStatus`:** `draft`, `pending_review`, `active`, `needs_changes`, `bookings_disabled`, `suspended`, `archived`
- **`BranchStatus`:** `open`, `closed`, `temporarily_closed`, `bookings_disabled`, `archived`
- **`SeatingAreaType`:** `indoor`, `outdoor`, `family`, `vip`, `smoking`, `non_smoking`, `mixed`
- **`TableStatus`:** `available`, `reserved`, `occupied`, `waiting_cleaning`, `cleaning`, `blocked`, `out_of_service`, `archived`
- **`RestaurantUserRole`:** `owner`, `manager`, `host`, `viewer` — **operational** staff scope (not the same as `UserRole` in RBAC)
- **`RestaurantOnboardingStatus`:** `not_started`, `profile_pending`, `branches_pending`, `tables_pending`, `under_review`, `approved`, `needs_changes`

Arabic UI labels for these keys (where needed in future UIs) live in `packages/shared` as
`prismaRestaurantStatusLabelsAr`, `prismaTableStatusLabelsAr`, and related maps in
`prisma-entity-labels.ts`. **Internal** values stay English; customer-facing copy remains Arabic-first / RTL
in the apps.

**Mock `RestaurantStatus` / `TableStatus` in `packages/shared` are a separate prototype vocabulary** (see
[`mock-data-contract.md`](./mock-data-contract.md)). They are not a 1:1 match to Prisma; Phase 3B+ APIs and
mappers can bridge them.

---

## Models (summary)

### `Restaurant`

Core catalog and operations settings: bilingual names, `slug` (unique), address fields, `status`,
`onboardingStatus`, `bookingsEnabled`, `isVisible`, `cuisineTypes` (string array), optional `tags` (JSON),
ratings, cancellation text, default reservation duration and grace minutes, `archivedAt`.

**Relations:** `branches`, `seatingAreas`, `tables`, `staffAssignments` (all via foreign keys from child tables).

**Indexes:** `status`, `[city, area]`, `bookingsEnabled`, `isVisible` (plus unique `slug`).

### `Branch`

A physical location under a restaurant: bilingual name, `city` / `area`, `addressText`, optional `landmark` /
`phone`, `status`, `bookingsEnabled`, optional `defaultHoursAr`, optional `latitude` / `longitude`,
`archivedAt`.

**Relations:** `restaurant`, `seatingAreas`, `tables`, `staffAssignments`.

**Indexes:** `restaurantId`, `status`, `[city, area]`, `bookingsEnabled`.

### `SeatingArea`

Operational **zone** (indoor / outdoor / VIP, etc.) at **restaurant** level, optionally scoped to a **branch**
(`branchId` nullable). Used to group `RestaurantTable` rows and future availability rules.

**Indexes:** `restaurantId`, `branchId`, `type`, `isActive`.

### `RestaurantTable`

Physical table: `branchId` **required**; optional `seatingAreaId`, `tableNumber` (string, unique **per
branch** via `@@unique([branchId, tableNumber])`), capacity min/max, `TableStatus`, `isBookable`, `sortOrder`,
`archivedAt`. If a branch is deleted, its tables are removed (`onDelete: Cascade` from `Branch`).

### `RestaurantStaffAssignment`

Links a **`User`** to a **`Restaurant`** and optionally a **`Branch`** with `RestaurantUserRole`. Used for
**in-venue operations** scoping (who can act for which restaurant/branch in future admin APIs).

**Not** a replacement for **`UserRole` / `UserRoleAssignment`**: the latter are product **auth/RBAC** roles
and string scopes (see [`auth-rbac-foundation.md`](./auth-rbac-foundation.md)). A person may have
`UserRoleAssignment` rows (e.g. `restaurant_owner` with `scopeType=restaurant`, `scopeId=<restaurant cuid>`)
**and** one or more `RestaurantStaffAssignment` rows; product rules in later phases define how they interact.

**Uniqueness:** `@@unique([userId, restaurantId, role, branchId])`. **Limitation:** in PostgreSQL, `NULL` in
`branchId` is treated as distinct in unique checks, so multiple inactive or duplicate **restaurant-wide** rows
with `branchId = null` could be inserted unless the application enforces a single row per
(user, restaurant, role) for the “all branches” case. Prefer explicit validation in **3B+** or a follow-up
migration with a partial unique index if required.

---

## Status lifecycles (high level)

- **Restaurant / branch:** move through **draft → review → active** (and operational states like
  `bookings_disabled`, `suspended`, `archived`) per operations policy — detailed transitions are for **API**
  layers, not this schema-only phase.
- **Table:** operational states from `available` through cleaning / blocked / `out_of_service` / `archived` —
  aligned with floor-plan and housekeeping flows in the blueprint. **Reservation-driven** state changes come
  with the reservation model (not in 3A).

---

## Why reservations are not in 3A

The blueprint separates **venue setup** (restaurant, branch, tables) from **booking engine** (requests,
approvals, lifecycle). Phase **3A** establishes only the **static / semi-static** structure so **3B/3C** can add
**internal** restaurant-admin APIs and later **customer-facing** booking without revisiting base tables.

---

## RBAC and `UserRoleAssignment`

- **`UserRole` / `UserRoleAssignment`:** unchanged in purpose; `scopeId` can now be set to a real
  `Restaurant.id` or `Branch.id` (string) when the app grants platform-defined roles in scope.
- **`RestaurantStaffAssignment`:** additional business table for **restaurant operations** roles (`owner` /
  `manager` / `host` / `viewer` in the **dedicated** enum). Controllers in future phases can require both
  JWT + RBAC and a valid staff row where appropriate.

---

## Migration

**Name:** `restaurant_branch_table_foundation`

**Create / apply (development, with Postgres running):**

```bash
cd apps/api
export DATABASE_URL="postgresql://eventaat:eventaat@localhost:5432/eventaat?schema=public"
npx prisma migrate dev --name restaurant_branch_table_foundation
```

**Folder:** `apps/api/prisma/migrations/<timestamp>_restaurant_branch_table_foundation/migration.sql`

**CI / production:** `npx prisma migrate deploy` with the same `DATABASE_URL` secret.

After schema changes: `npx prisma generate` (the API `build` / `postinstall` paths usually run this).

---

## Intended seed (documented only — Phase 3B or later)

For local development and demos, a future seed may create:

- One **active** `Restaurant` (or `pending_review` for admin review flows)
- **Multiple** `Branch` rows
- Several `SeatingArea` rows (mixed **restaurant-level** and **branch-level**)
- Many `RestaurantTable` rows across branches
- At least one `RestaurantStaffAssignment` linking a test `User` to that restaurant (and optionally a branch)

**No** seed script is required to complete Phase 3A; keep seeds small and isolated when implemented.

---

## No new HTTP endpoints in Phase 3A

The API surface is unchanged: `GET /health` and existing **auth** routes. **Swagger** at `/docs` and
**OpenAPI** at `/openapi.json` are unchanged in **route** list (only the underlying database grew).

**Recommended next step:** **Phase 3B** — seed data and **internal** restaurant-admin APIs (still no public
customer booking APIs until the blueprint’s reservation phase is implemented).
