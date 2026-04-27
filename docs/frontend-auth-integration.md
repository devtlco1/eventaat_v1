# Frontend auth integration (Phase 2D)

This document describes how the **eventaat** **mobile (Expo)** and **web (Next.js)** apps call the **existing**
auth API (`POST /auth/otp/request`, `POST /auth/otp/verify`, `GET /auth/me`, `POST /auth/logout`) **without any
new backend routes**.

**Source of truth:** [`eventaat_product_execution_blueprint_v1.md`](./eventaat_product_execution_blueprint_v1.md)  
**API details:** [`api-reference.md`](./api-reference.md)  
**Server-side OTP:** [`otp-delivery-provider.md`](./otp-delivery-provider.md)

---

## Shared client

`packages/shared/src/auth-client/` provides:

- `createAuthApi(baseUrl)` — `requestOtp`, `verifyOtp`, `getMe`, `logout`
- Types aligned with the Nest DTOs (`RequestOtpResult`, `VerifyOtpResult`, `UserPublic`, …)
- `AuthApiError` for safe, typed error handling (no raw OTP; no tokens in error bodies)

**Mobile** and **web** set the base URL via environment (see below).

---

## Mobile (Expo), Arabic-first

- **Env:** `EXPO_PUBLIC_API_BASE_URL` (required for real API). On a **physical iPhone**, the API usually runs on
  your **Mac’s LAN IP** (e.g. `http://192.168.1.10:3000`), not `localhost`.
- **Optional mock-only UI:** omit the base URL, or set `EXPO_PUBLIC_MOCK_AUTH=true` to keep the legacy
  “واجهة وهمية” path (no server).
- **Storage:** `expo-secure-store` for `accessToken`, `refreshToken`, `sessionId`.
- **Flow:** login/register → OTP → verify → `saveTokens` → `Home` with the real user’s name. **devOtp** (رمز
  التطوير) appears only when the **backend** returns it with `AUTH_DEV_EXPOSE_OTP=true` — shown in a clearly
  labeled local-dev area.
- **Session restore** on launch: `getMe` with stored access token; on failure, tokens are cleared and the app
  returns to the welcome flow.
- **Reservations and restaurants** remain **mock** data in `@eventaat/shared` — only **auth** is real in Phase 2D.

---

## Web (Next.js), dashboard shell

- **Env:** `NEXT_PUBLIC_API_BASE_URL` (default in code: `http://127.0.0.1:3000` for local dev; web app runs on
  **port 3001**; API on **3000**).
- **Storage (prototype):** `localStorage` for the three token strings — **TODO (production):** move to
  `httpOnly` cookies or a hardened session pattern.
- **Login:** `/login` (Arabic) — request OTP, then verify; on success, tokens are stored and the user is
  redirected (e.g. to `/dashboard`).
- **`NEXT_PUBLIC_AUTH_REQUIRED`:** default `false` — shell dashboards work without login for **prototype
  review**; a session chip and **تسجيل خروج** still appear when logged in. Set to `true` to **redirect
  unauthenticated** users to `/login` (shell is wrapped in `AuthGate`).

---

## CORS (local)

The API enables **configurable** CORS (`CORS_ORIGINS` comma list, or `CORS_ALLOW_DEV_ALL=true` for
development). Defaults include `http://localhost:3001` and `http://127.0.0.1:3001` for the web app. **React
Native** calls are not subject to browser CORS.

---

## Local verification

Use [`local-auth-verification.md`](./local-auth-verification.md) for the API, plus:

- API: `AUTH_DEV_EXPOSE_OTP=true`, `OTP_DELIVERY_PROVIDER=mock` for **safe** dev
- Web: `NEXT_PUBLIC_API_BASE_URL`, optional `NEXT_PUBLIC_AUTH_REQUIRED`
- Mobile: set `EXPO_PUBLIC_API_BASE_URL` to the machine IP when testing on device

---

## No new API endpoints; business data still mock

- No **refresh-token** route; no **restaurant / reservation / payment** APIs in this phase.
- Mock flows for discovery, booking UI, and dashboards **unchanged**; only **authentication and session
  persistence** are real where configured.

## Recommended next phase

**2E** — **RBAC** route protection and **protected dashboard shells** (per blueprint). Not implemented in 2D.
