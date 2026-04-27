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

### Phase 1B — (planned) Customer mobile UI prototype

Deeper **customer** flows and UI polish on top of the same mock contract (blueprint **§98** customer
list: registration mock, home, search, restaurant page, create booking, my reservations, details, review screen layout).

### Phase 1C / 1D — (planned) Staff dashboards in depth

Detailed **tables**, filters, and interactions for **restaurant / admin / call center** (Phase 1C/1D in
project plan); still mock-backed until the backend exists.

## Phase 2 — Accounts and permissions

Goal: sign-in and role foundation. **Includes:** customer phone sign-up, WhatsApp OTP, account
creation, restaurant staff login, eventaat admin login, roles, permissions, activity log, role-based
screen protection. **Testing focus:** new/old customer, OTP errors, staff without permission, disabled
restaurant, call center agent, admin.

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

**Current code status:** **Phase 1A** is implemented: shared mock contract, web dashboard routes/shell, and
customer mobile screen placeholders (see root [`README.md`](../README.md) and
[`mock-data-contract.md`](./mock-data-contract.md)). Real backend, auth, and business APIs are **out of scope**
until the blueprint phases that introduce them.
