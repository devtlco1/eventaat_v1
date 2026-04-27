# OTP delivery provider (Phase 2C)

This document describes the **Eventaat** API layer that sends (or simulates) OTP messages after an
`OtpChallenge` is created. **No** raw OTP is stored in PostgreSQL, logs, or API responses. The
challenge row stores **only** a hash (`codeHash`). The optional `devOtp` in `POST /auth/otp/request` is
controlled by **`AUTH_DEV_EXPOSE_OTP=true`** and must never be enabled in production.

**Code layout:** `apps/api/src/auth/otp/` — interface, `OtpProviderConfig`, mock, WhatsApp Cloud API,
SMS placeholder, and `OtpDispatcherService`.

**Product reference:** [`eventaat_product_execution_blueprint_v1.md`](./eventaat_product_execution_blueprint_v1.md)  
**Environment examples:** [`../apps/api/.env.example`](../apps/api/.env.example)

---

## Provider selection

| `OTP_DELIVERY_PROVIDER` | Behavior |
|------------------------|----------|
| `mock` (default) | No outbound network. `providerStatus` is typically `skipped`. |
| `whatsapp` | Uses WhatsApp Cloud API (Graph) with a **template** message when not in dry run and credentials are set. |
| `sms` | Placeholder only: **no** real SMS vendor. Supports mock/dry-run style responses. |

`OTP_DELIVERY_DRY_RUN=true` (default in `.env.example`) **blocks all external HTTP** for the WhatsApp
path: the result is `skipped` with a small safe note in `metadata` — use this in CI and for local
experiments without Meta credentials.

---

## WhatsApp Cloud API

- **Config:** `WHATSAPP_CLOUD_API_BASE_URL` (e.g. `https://graph.facebook.com`), `WHATSAPP_API_VERSION` (e.g. `v21.0` — do not hardcode in multiple places; one env value), `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN` (never logged or returned in APIs), `WHATSAPP_OTP_TEMPLATE_NAME`, `WHATSAPP_OTP_TEMPLATE_LANGUAGE`, `WHATSAPP_REQUEST_TIMEOUT_MS`.
- **Request:** `POST {base}/{version}/{phoneNumberId}/messages` with a `template` body: one `body` text parameter = OTP digit string (in memory only; not persisted).
- **Outcomes:** `sent` (with `wamid` in `providerMessageId` when returned), `skipped` (dry run), or `failed` (missing config, Graph error, network/timeout). Failures are reflected on `OtpChallenge` and the API can return **502 Bad Gateway** with a safe, Arabic-friendly `messageAr` and code `OTP_DELIVERY_FAILED` — no secrets in the body.
- **Preparation:** create and get approval for an authentication/utility **template** in Meta Business (see [`whatsapp-templates.md`](./whatsapp-templates.md)), then set the env names/languages to match. Start with `OTP_DELIVERY_DRY_RUN=true` and `OTP_DELIVERY_PROVIDER=whatsapp` to confirm no network calls and a non-misleading `providerStatus` before turning dry run off.

---

## SMS placeholder

- **Config:** `SMS_PROVIDER=mock`, `SMS_DRY_RUN=true` in Phase 2C. Real **Twilio / local carrier** (or
  similar) integration is a **future** step; the interface matches other providers for easy extension.

---

## Security rules

- Never store the raw OTP, raw refresh token, or WhatsApp access token in the database or in `metadata` JSON
  (responses are **sanitized**; tokens are not logged on success or failure).
- `AUTH_DEV_EXPOSE_OTP` only for development/test. Treat production-like environments as
  `AUTH_DEV_EXPOSE_OTP=false`.
- E2E and unit tests do **not** require real Meta credentials; use `mock` or `whatsapp` + `OTP_DELIVERY_DRY_RUN=true`.

---

## Manual checks

- **Mock (default):** set `OTP_DELIVERY_PROVIDER=mock` (or omit), `AUTH_DEV_EXPOSE_OTP=true` for local
  `devOtp`, then use [`local-auth-verification.md`](./local-auth-verification.md) curl flow.
- **DB:** optional `SELECT id, providerStatus, "providerMessageId", metadata FROM otp_challenges ORDER BY "createdAt" DESC LIMIT 1;` to confirm `skipped` for mock and that `metadata` does not contain the OTP.
- **WhatsApp dry run:** `OTP_DELIVERY_PROVIDER=whatsapp` + `OTP_DELIVERY_DRY_RUN=true` — no Graph calls, `providerStatus` should be `skipped`.

```bash
# Example (no real network)
export OTP_DELIVERY_PROVIDER=whatsapp
export OTP_DELIVERY_DRY_RUN=true
export JWT_ACCESS_SECRET=...
export DATABASE_URL=...
# pnpm start:dev in apps/api, then POST /auth/otp/request
```

---

## See also

- [`api-reference.md`](./api-reference.md) — `POST /auth/otp/request` errors and delivery notes  
- [`auth-rbac-foundation.md`](./auth-rbac-foundation.md) — `OtpChallenge` fields
