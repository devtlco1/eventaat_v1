# Mock end-to-end scenario checklist (Phase 1E)

**Purpose:** Verify the **mock prototype** (no real backend) across the customer mobile app and web
dashboards before **Phase 2** (auth, OTP, real APIs). All flows use **local / shared mock data** in
`@eventaat/shared` and UI state only.

**Rules:** Code paths, IDs, and internal statuses stay **English**; **Arabic** copy is centralized in
`apps/web/lib/arStrings.ts` and shared label maps. The English phrase “No Show” does **not** appear in
user-visible Arabic UI — use **«لم يحضر»** / **«تسجيل عدم حضور»** / **«احتمال عدم حضور»** as
documented in [`reservation-lifecycle.md`](./reservation-lifecycle.md).

---

## 1. Customer (mobile) — `apps/mobile`

| # | Scenario | How to verify |
|---|----------|---------------|
| 1.1 | Guest entry | From Welcome, continue as guest; reach Home. |
| 1.2 | Mock login | Mock phone + confirm; reach authenticated Home. |
| 1.3 | Mock OTP | Enter mock OTP; transition to next step. |
| 1.4 | Account creation (mock) | Complete registration form; see confirmation / Home. |
| 1.5 | Home discovery | See areas/categories; tap items (mock). |
| 1.6 | Search restaurants | Search + filters; list updates from mock data. |
| 1.7 | Restaurant details | Open a restaurant; see details, hours, policy snippets. |
| 1.8 | Create reservation | Fill booking; submit → **pending** in local state. |
| 1.9 | Pending confirmation | See pending state / confirmation copy (mock). |
| 1.10 | My reservations | List groups by status; open an item. |
| 1.11 | Reservation details | Timeline, status, actions (mock). |
| 1.12 | Cancel pending (mock) | Cancel from pending; state updates. |
| 1.13 | Approved reservation actions (mock) | e.g. review / actions shown for approved. |
| 1.14 | Completed reservation → review (mock) | Open completed; review entry (mock). |
| 1.15 | Support entry (mock) | Open Support; submit shows prototype feedback. |

---

## 2. Restaurant dashboard (web) — `apps/web` under `/restaurant/*`

| # | Scenario | How to verify |
|---|----------|---------------|
| 2.1 | Daily dashboard review | `/restaurant` — KPIs, lists, late/pending areas. |
| 2.2 | View pending reservations | `/restaurant/reservations` — filter pending. |
| 2.3 | Approve reservation (mock) | Accept; toast / local state. |
| 2.4 | Reject with reason (mock) | Reject; dialog with Arabic reasons. |
| 2.5 | Propose alternative time (mock) | Suggest new time; confirm. |
| 2.6 | Register arrival (mock) | Action on row / detail. |
| 2.7 | Register seating (mock) | Seated action. |
| 2.8 | Complete reservation (mock) | Complete flow. |
| 2.9 | Register absence — **«تسجيل عدم حضور»** | Label in Arabic; internal `no_show` OK. |
| 2.10 | Table status changes (mock) | `/restaurant/tables` — block, clean, OOS, etc. |
| 2.11 | Branch view | `/restaurant/branches` — summary + cards. |
| 2.12 | Settings view | `/restaurant/settings` — sections/tabs, toggles (no persistence). |

---

## 3. eventaat admin (web) — `/admin/*`

| # | Scenario | How to verify |
|---|----------|---------------|
| 3.1 | Platform overview | `/admin` or `/dashboard` as routed — KPIs / summary. |
| 3.2 | Restaurant review | `/admin/restaurants` — list, filters, **عرض** where applicable. |
| 3.3 | Restaurant detail drawer | Row → drawer: notes, status, follow-up. |
| 3.4 | Reservations monitoring | `/admin/reservations` — **رصد الحجوزات**; row menu + drawer. |
| 3.5 | Complaint monitoring | `/admin/complaints` — list + detail drawer. |
| 3.6 | Subscription follow-up | `/admin/subscriptions` — table + **عرض** + commercial block. |
| 3.7 | Commercial package visibility | Package terms visible on subscriptions page. |

---

## 4. Call center (web) — `/call-center/*`

| # | Scenario | How to verify |
|---|----------|---------------|
| 4.1 | Task queue | `/call-center/tasks` — **مهام المتابعة**; primary **عرض**; row menu. |
| 4.2 | Reservation follow-up | `/call-center/reservations` — **متابعة الحجوزات**; drawer. |
| 4.3 | Complaint follow-up | `/call-center/complaints` — **متابعة الشكاوى**; drawer. |
| 4.4 | Add note (mock) | Action → confirm dialog (prototype). |
| 4.5 | Escalate (mock) | From row menu. |
| 4.6 | Close task (mock) | From row menu / flow. |

---

## Sign-off

- [ ] All sections above trialed on a **laptop** width; tables scroll horizontally where needed.  
- [ ] No new **business** API calls; `GET /health` only.  
- [ ] Swagger still at `/docs` and OpenAPI at `/openapi.json` when API is running.

**Next recommended phase:** Phase 2 — authentication, OTP, roles, and permissions foundation (not in this
repo step).
