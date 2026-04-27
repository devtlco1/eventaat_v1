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

**Current code status:** Step 0 of engineering — monorepo foundation, health check, and documentation
skeleton only (see root `README.md`).
