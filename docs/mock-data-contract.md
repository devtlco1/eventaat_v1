# Mock data contract (Phases 1A–1C for consumers)

Phase **1A** established a **mock-first** data layer in [`packages/shared`](../packages/shared) so
mobile and web UIs can share the same **shapes** and **sample records** while **no** persistence,
**no** new API business routes, and **no** Prisma domain models exist. **Phase 1B** extends the same
package with a few more **presentation** fields and label maps (e.g. `SeatingType`, `ReservationOccasion`)
for the **customer mobile** prototype. **Phase 1C** does **not** duplicate mock rows: the **restaurant
web** dashboard in `apps/web` reads the same `mockReservations` / `mockTables` / `mockBranches` as
`@eventaat/shared` and keeps **overrides in React state** only. Still no backend.

## Location

- **Constants** (enums, Arabic labels): `packages/shared/src/constants/`
- **TypeScript types**: `packages/shared/src/types/entities.ts`
- **Mock records**: `packages/shared/src/mock/*.ts`, barrel `packages/shared/src/mock/index.ts`
- **Public exports**: `packages/shared/src/index.ts` re-exports `constants`, `types`, and `mock`

**Rule:** UI code imports from `@eventaat/shared` only. Do not duplicate mock arrays in component files.

## Entities in mock

| Area | Type(s) | File(s) | Notes |
|------|---------|---------|--------|
| User | `User` | `mock/users.ts` | Includes all **role** variants used in the UI contract (see `UserRole` in `constants/roles.ts`). |
| Restaurant | `Restaurant` | `mock/restaurants.ts` | **Restaurant** lifecycle uses `RestaurantStatus` (واجهة تشغيل + رؤية + تعليق حجوزات في عينة بيانات واحدة). **Phase 1B:** extra optional fields (e.g. `ratingMock`, `cuisineTypeAr`, `openingHoursAr`, tags, `reviewSnippets`, `getDiscoverableRestaurants` helper) for customer UI only. |
| Branch | `Branch` | `mock/branches.ts` | بغداد: المنصور، الكرادة، الجادرية، الكاظمية، زيونة. |
| Table | `RestaurantTable` | `mock/tables.ts` | `TableStatus` يغطي الميزانية التشغيلية للمخطط. |
| Reservation | `Reservation` | `mock/reservations.ts` | **حالة واحدة لكل `ReservationStatus`** الرئيسي في المخطط (للبروفة والاختبار). **Phase 1B:** `refCode` on samples; optional `seatingType`, `occasion`, `customerNotes` for mobile forms; **new** local-only rows are created in the app state (not the shared file). |
| Complaint | `Complaint` | `mock/complaints.ts` | يرتبط بـ `ComplaintStatus` (مخطط — دورة شكوى). |
| Subscription | `Subscription` | `mock/subscriptions.ts` | يرتبط بـ `SubscriptionStatus` (مخطط — مرحلة الاشتراكات). |
| WhatsApp | `WhatsAppTemplate` | `mock/whatsappTemplates.ts` | جدول أسماء **قالبي** Meta حيث نُسّم في المخطط (§68–69) + أسماء داخلية ثابتة لباقي المقاطع. |
| Call center | `CallCenterTask` | `mock/callCenterTasks.ts` | متابعة تشغيلية (Phase 6). |

## Status and role keys

Machine-readable **snake_case** / **lowercase** keys in TypeScript mirror the blueprint (see
[`reservation-lifecycle.md`](./reservation-lifecycle.md) and
[`roles-permissions.md`](./roles-permissions.md)):

- **User roles** — `UserRole` (يشمل `content_manager` و `finance_manager` كتقسيم إداري اختياري بجانب
  `operations_admin` من المخطط؛ الربط البرمجي بصلاحيات الشاشة يأتي مع تسجيل الدخول لاحقاً).
- **Reservation** — 17 حالة (§27 المخطط).
- **Restaurant** — حالات الظهور/الإيقاف/الاعتماد (موضوع واحد `RestaurantStatus` للبروتوتايب).
- **Table** — حسب الجدول أعلاه.
- **Complaint** — 8 حالات (§83).
- **Subscription** — 6 حالات (المرحلة 7).

## Map to the blueprint

- [Product blueprint](./eventaat_product_execution_blueprint_v1.md) remains the only product source of truth.
- Mock rows are **illustrative**; counts and ids are not production data.
- [WhatsApp template names](./whatsapp-templates.md) — `eventaat_otp_login` و `reservation_request_created`
  مسمّيان في المخطط حرفياً.

## What this is *not*

- **Not** a database schema, migration, or API design for Phase 1A.
- **Not** a replacement for future Prisma models (those will align with the same field names when implemented).
- **Not** a contract for the NestJS `GET /health` endpoint (unchanged; see
  [`api-reference.md`](./api-reference.md)).
