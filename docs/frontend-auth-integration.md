# Frontend auth integration (Phases 2D–2E.1)

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
- **Reservations and restaurants** remain **mock** data in `@eventaat/shared` — only **auth** is real in 2D/2E.
- **Non-customer roles (2E):** if `primaryRole` is an **operator** role, Home shows a note that the account is for
  the **web** dashboard, not the mobile app.

---

## Web (Next.js), dashboard shell

- **Env:** `NEXT_PUBLIC_API_BASE_URL` (default in code: `http://127.0.0.1:3000` for local dev; web app runs on
  **port 3001**; API on **3000**).
- **Storage (prototype):** `localStorage` for the three token strings — **TODO (production):** move to
  `httpOnly` cookies or a hardened session pattern.
- **Login:** `/login` (Arabic) — request OTP, then verify; on success, tokens are stored and the user is
  redirected (e.g. to `/dashboard`).
- **`NEXT_PUBLIC_AUTH_REQUIRED`:** default `false` — shell dashboards work without login for **prototype
  review**; a session chip and **تسجيل خروج** still appear when logged in; footer shows “وضع العرض التجريبي” (or
  production-styled “وضع التشغيل” when not in prototype). Set to `true` to **redirect unauthenticated** users
  to `/login` and to **block wrong-role** users from area paths with an **Arabic** unauthorized state (see
  [`rbac-route-access.md`](./rbac-route-access.md)).

---

## CORS (local)

The API enables **configurable** CORS (`CORS_ORIGINS` comma list, or `CORS_ALLOW_DEV_ALL=true` for
development). Defaults include `http://localhost:3001` and `http://127.0.0.1:3001` for the web app. **React
Native** calls are not subject to browser CORS.

---

## Local verification

Use [`local-auth-verification.md`](./local-auth-verification.md) for the API (includes **one-liner** `start:dev` with
`DATABASE_URL`, `JWT_ACCESS_SECRET`, `AUTH_DEV_EXPOSE_OTP`, `OTP_DELIVERY_PROVIDER=mock`, and **web** `pnpm run dev` on
**3001** with `NEXT_PUBLIC_API_BASE_URL`).

- API: `AUTH_DEV_EXPOSE_OTP=true` (**local only**; never in production), `OTP_DELIVERY_PROVIDER=mock` for **safe** dev
- **Ports:** API **3000** (default) · **Next.js** usually **3001** — if `/login` says it cannot connect, start the API first
  and align `NEXT_PUBLIC_API_BASE_URL` (e.g. `http://127.0.0.1:3000`).
- Web: `NEXT_PUBLIC_API_BASE_URL`, optional `NEXT_PUBLIC_AUTH_REQUIRED`
- Mobile: set `EXPO_PUBLIC_API_BASE_URL` to the machine IP when testing on device

---

## No new API endpoints; business data still mock

- No **refresh-token** route; no **restaurant / reservation / payment** APIs in this phase.
- Mock flows for discovery, booking UI, and dashboards **unchanged**; only **authentication and session
  persistence** are real where configured.

## Phase 2E (RBAC shell)

Implemented: shared `canAccessDashboardPath`, `AuthGate` + **غير مصرح بالوصول** for wrong paths when auth is
required, sidebar filtering, Arabic role pill in the shell. Details: [`rbac-route-access.md`](./rbac-route-access.md).

## Phase 2E.1 (Dashboard usability + login copy)

- **Shell:** fixed **sidebar**; only the **main** area scrolls (see `DashboardShell` + `shell.module.css`).
- **Login:** if the request fails (network or wrong `NEXT_PUBLIC_API_BASE_URL`), the user sees a concise **Arabic**
  message to ensure the **API** is on port **3000** and the env is set. **No** change to **auth** HTTP contract.
- **Tables:** `TablePagination` and `usePaginatedRows` under `apps/web` — all **client-side**; see long lists in admin,
  call center, and restaurant views.

**Developer notes (not shown in the login UI in production as primary guidance):** production builds should not rely on
hardcoded port text for operations; the message targets **local** eventaat + Next defaults.

## Recommended next phase

**3A** — **Restaurant / branch / table** database schema foundation (blueprint), **not** part of 2E.
