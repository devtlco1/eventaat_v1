# WhatsApp template names (blueprint)

[WhatsApp Business](https://developers.facebook.com/docs/whatsapp) **template names and categories**
as specified in
[`eventaat_product_execution_blueprint_v1.md`](./eventaat_product_execution_blueprint_v1.md) (Part 12).
**No Meta/WhatsApp integration is implemented in Step 0.** Approved templates are required for
out-of-session (utility/authentication) messages per blueprint.

## High-level template types (meta-category)

- **Authentication** — OTP and login confirmation.
- **Utility** — booking, reminders, confirmations, updates.
- **Marketing** — offers/promo (requires clear user opt-in, per blueprint).

## Names explicitly given in the blueprint

| Name | Section | Category in blueprint | Purpose |
|------|---------|------------------------|---------|
| `eventaat_otp_login` | §68 | Authentication | Phone OTP for login. |
| `reservation_request_created` | §69 | Utility | Booking request created (content includes restaurant, date, time, party size, reference). |

## Message blocks in the blueprint (§70–§80) without a separate `Template Name` line

The blueprint titles these as distinct templates (قالب) and includes body text, but only §68 and §69
name the `Template Name` field explicitly in code. The following are listed by their section titles
for product alignment; when registering with WhatsApp, assign approved template **names** that match
your Meta account — the blueprint’s Arabic/English text lives in those sections.

| Section | Template topic (from blueprint) |
|--------|---------------------------------|
| §70 | Booking accepted (confirmation) |
| §71 | Booking rejected |
| §72 | Alternative time proposed |
| §73 | Pre-visit reminder |
| §74 | Customer on the way (notify restaurant) |
| §75 | Cancelled by customer |
| §76 | Cancelled by restaurant |
| §77 | No Show warning (informational) |
| §78 | Post-visit review request |
| §79 | New request notification to the restaurant |
| §80 | Call center follow-up |

**API integration (Phase 2C, backend only):** the API can send a **template** OTP with configurable
`WHATSAPP_OTP_TEMPLATE_NAME` and `WHATSAPP_OTP_TEMPLATE_LANGUAGE` (see
[`../apps/api/.env.example`](../apps/api/.env.example) and [`otp-delivery-provider.md`](./otp-delivery-provider.md)). Use
`OTP_DELIVERY_DRY_RUN=true` until ready to call the Graph API; **no** end-user app integration is in 2C.

*Webhooks and full operational messaging (bookings, reminders) remain in later product phases; see
`implementation-plan.md`.*
