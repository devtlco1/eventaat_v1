# API reference

Base URL: configured per environment; local default is `http://localhost:3000` (see
[`../apps/api/.env.example`](../apps/api/.env.example)). With the default port, you can also use
`http://127.0.0.1:3000`.

**Phase 2B.1** adds the **`auth_foundation` Prisma migration** (local/CI database apply), **local
PostgreSQL verification**, and e2e tests that **run the auth suite** when `DATABASE_URL` is set.
**No** new API endpoints were added. See [`local-auth-verification.md`](./local-auth-verification.md) for
curl-style checks.

**Phase 2C** adds a **pluggable OTP delivery** layer: **mock** (default, safe for dev/CI), optional **WhatsApp
Cloud API** (config + dry-run), and an **SMS placeholder** (no real vendor). **No** new public routes.
**Swagger** and this file are updated. Details: [`otp-delivery-provider.md`](./otp-delivery-provider.md).

**Phase 2D** integrates the **existing auth endpoints** into the **mobile** and **web** clients. **No new API
endpoints were added.** See [`frontend-auth-integration.md`](./frontend-auth-integration.md).

**Phase 2E** adds **RBAC guards** and **protected route shell** behavior on the **web** (and `RbacGuard` + decorators
in the **API** for **future** business routes). **Phase 2E adds RBAC guards and protected route shell behavior
only. No new API endpoints were added.** See [`auth-rbac-foundation.md`](./auth-rbac-foundation.md) and
[`rbac-route-access.md`](./rbac-route-access.md). **No** restaurant, reservation, or payment routes; **no**
refresh-token route.

**Phase 2E.1** adds **web dashboard usability** fixes only: **fixed** sidebar + scroll behavior, **client-side**
**table** pagination, **row action menu** layering (portal to `body`), and **local auth** UX + docs. **Phase 2E.1
adds web dashboard usability fixes only: fixed sidebar behavior, client-side table pagination, row action menu
layering fixes, and local auth UX/docs. No new API endpoints were added.**

**Phase 2B** implements **auth HTTP** routes: OTP request/verify, session + JWT access token, logout, and
**GET /me**. **No** restaurant, reservation, or payment APIs. **Swagger/OpenAPI** is updated in the same step.
Remaining surface: health + auth. OpenAPI: **`/docs`** and **`/openapi.json`**.

**Phase 2A** added an **auth / RBAC / OTP-related database (Prisma) foundation** (and optional migration).
Phase **2B** is the first step that exposes **auth** on HTTP.

**Phase 1E** added **mock end-to-end scenario testing and UI polish only.** **No** business API
endpoints were added. The only **functional** API endpoint remains **`GET /health`**. **Swagger/OpenAPI**
remains available at **`/docs`** and **`/openapi.json`**.

**UI Recovery + Dashboard Polish** (earlier web-only step) also **adds no business API endpoints.**
The only **functional** API endpoint remains **`GET /health`**. **Swagger/OpenAPI** remains available at
**`/docs`** and **`/openapi.json`** on the API service.

**Phase 1A:** No new API routes were added; the backend remains **mock-first** in the client
packages. Only **`GET /health`** is implemented. **Phase 1B** adds **no** new API endpoints; only
**`GET /health`** still exists.

**API Docs Foundation** adds **Swagger/OpenAPI documentation only** (interactive UI and machine-readable
spec). **No business endpoints were added.** The only **functional** API route remains **`GET /health`**.

**Phase 1C** adds **restaurant web dashboard mock UI only** in `apps/web`. **No** business API endpoints
were added. The only **functional** API endpoint remains **`GET /health`**. **Swagger/OpenAPI** remains
available at **`/docs`** and **`/openapi.json`**.

## OpenAPI & Swagger (NestJS)

| URL | Description |
|-----|-------------|
| `GET /docs` | **Swagger UI** (interactive API documentation) |
| `GET /openapi.json` | **OpenAPI 3** document (JSON) |

- **Title:** eventaat API  
- **Description:** Restaurant reservation platform API for eventaat.  
- **Version:** 0.1.0  

Implementation: `@nestjs/swagger` in `apps/api` — `DocumentBuilder` + `SwaggerModule`, shared helper
`apps/api/src/openapi.setup.ts` (used from `main.ts` and e2e so tests match production).

### Rule for all future API work (required)

Do **not** consider any backend change complete if API documentation is out of date.

**Whenever any API endpoint is added, changed, or removed, the same implementation step must update:**

1. **Swagger / OpenAPI** — controller decorators and DTOs so **`/docs`** and **`/openapi.json`** stay
   accurate.
2. **This file** — [`docs/api-reference.md`](./api-reference.md) with the same endpoint changes.

## `POST /auth/otp/request`

**Tag:** `auth`  
**Auth:** not required.  
**Summary:** Start an OTP challenge. Normalizes the phone, upserts a `User` (default `primaryRole: customer` when
created), and creates an `OtpChallenge` with a **hashed** code only. **Raw OTP and raw refresh tokens are never
stored** in the database or in `metadata` JSON. After the row is created, the server runs an **OTP delivery
provider** (`OTP_DELIVERY_PROVIDER=mock|whatsapp|sms`, default `mock`) and updates `providerMessageId`,
`providerStatus` (`queued` | `sent` | `skipped` | `failed`), and a **sanitized** `metadata` object (no OTP, no
tokens). **`OTP_DELIVERY_DRY_RUN=true` prevents any outbound network** to WhatsApp. If **WhatsApp** is selected
and a real send fails (misconfiguration, network, Graph error), the challenge is marked `failed` and the API
returns **502** with code `OTP_DELIVERY_FAILED` and a safe, Arabic-friendly message — **not** a misleading
success. The request field `channel` is stored for product semantics; the **active transport** is chosen from
`OTP_DELIVERY_PROVIDER` (see [`otp-delivery-provider.md`](./otp-delivery-provider.md)).

**Request JSON**

| Field | Type | Required | Notes |
|--------|------|----------|--------|
| `phone` | string | yes | Iraq-friendly formats; normalized server-side. |
| `purpose` | string | yes | `login`, `register`, `phone_verification`, `staff_invite` |
| `channel` | string | yes | `whatsapp`, `sms`, `manual` (no real provider) |
| `fullName` | string | no | |
| `city` | string | no | |

**Response 200**

| Field | Type | Description |
|--------|------|-------------|
| `challengeId` | string | Use with `/auth/otp/verify`. |
| `expiresAt` | string (ISO) | |
| `channel` | string | |
| `purpose` | string | |
| `devOtp` | string | **Only** if `AUTH_DEV_EXPOSE_OTP=true` in the environment (development/test). **Never** enable in production. |

**Errors:** `400` invalid input, `403` if user is `disabled` / `suspended`, `502` if the **WhatsApp** transport
fails (when that provider is selected), `503` if the database is unreachable.

---

## `POST /auth/otp/verify`

**Tag:** `auth`  
**Auth:** not required.  
**Summary:** Verifies the OTP, marks the challenge, activates the user (when appropriate), issues **access**
(JWT) and **refresh** (opaque) tokens, creates a `UserSession` with **refresh token hash** only, and appends
audit events (`auth.otp_verified`, `auth.login_success`).

**Request JSON**

| Field | Type | Required | Notes |
|--------|------|----------|--------|
| `challengeId` | string | yes | |
| `code` | string | yes | 4–8 digits |
| `phone` | string | no | If sent, must match the challenge. |

**Response 200**

| Field | Type | Description |
|--------|------|-------------|
| `user` | object | Public fields + `roleAssignments` (no business data). |
| `accessToken` | string | JWT (Bearer) for `Authorization` header. |
| `refreshToken` | string | Opaque; **only a hash** is stored server-side. |
| `sessionId` | string | |
| `expiresAt` | string (ISO) | Access token expiry time. |

**Errors:** `400` (invalid/used challenge, wrong code, expired), `403` (blocked user), `429` (too many failed
attempts for the challenge), `503` (database).

---

## `GET /auth/me`

**Tag:** `auth`  
**Auth:** `Authorization: Bearer <accessToken>`.  
**Summary:** Returns the current user and scoped role assignments (from DB).

**Response 200:** public user + `roleAssignments` array.  
**Errors:** `401` if token/session invalid or revoked.

---

## `POST /auth/logout`

**Tag:** `auth`  
**Auth:** `Authorization: Bearer <accessToken>`.  
**Body (optional):** `{ "sessionId"?: string }` — if present, must match the session embedded in the token.  
**Summary:** Revokes the session (`revokedAt` set), audit `auth.logout`.  
**Response 200:** `{ "success": true }`. **Errors:** `401`, `404` (session not found for user).

---

## `GET /health`

**Tag:** `health`  
**Summary (Swagger):** API health check

Returns service liveness and app identifier.

**Response 200 (JSON)**

| Field       | Type   | Description                 |
|-------------|--------|-----------------------------|
| `status`    | string | e.g. `"ok"`                 |
| `app`       | string | application name `eventaat` |
| `timestamp` | string | ISO 8601 time              |

**Example**

```http
GET /health HTTP/1.1
Host: localhost:3000
```

```json
{
  "status": "ok",
  "app": "eventaat",
  "timestamp": "2026-04-27T12:00:00.000Z"
}
```

---

**Environment (Phases 2B–2C, see [`../apps/api/.env.example`](../apps/api/.env.example)):** `JWT_ACCESS_SECRET`,
`JWT_ACCESS_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_DAYS`, `OTP_EXPIRES_MINUTES`, `OTP_MAX_ATTEMPTS`,
`AUTH_DEV_EXPOSE_OTP` (development/test only; **never** `true` in production), plus
`OTP_DELIVERY_PROVIDER`, `OTP_DELIVERY_DRY_RUN`, and the WhatsApp/SMS variables documented in
[`otp-delivery-provider.md`](./otp-delivery-provider.md) (no real credentials in examples).

---

Future blueprint phases will add more business resources (e.g. reservations, restaurant operations, WhatsApp
delivery, payments). Each must follow the **Swagger + `api-reference.md`** rule when routes change.
