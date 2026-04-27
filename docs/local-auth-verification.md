# Local manual verification — auth API and clients (Phase 2B / 2B.1 / 2C / 2D)

Use this flow to exercise the **existing** auth endpoints against a **local PostgreSQL** with the
`auth_foundation` migration applied. **No** new API routes are added. **Phase 2D** adds **mobile and web** clients
that call these endpoints (see [`frontend-auth-integration.md`](./frontend-auth-integration.md)) while
**reservations and restaurants in the UIs** stay **mock** until later phases.

**Prerequisites**

1. **Docker** (optional but recommended): from the repo root, `docker compose up -d postgres redis`
2. **`DATABASE_URL`** (example):

   `postgresql://eventaat:eventaat@localhost:5432/eventaat?schema=public`

3. **Apply schema** (first time or after pulling migrations):

   ```bash
   cd apps/api
   npx prisma migrate deploy
   # or for dev: npx prisma migrate dev
   ```

4. **Copy** `apps/api/.env.example` → `apps/api/.env` and set at least:
   - `DATABASE_URL` (as above)
   - `JWT_ACCESS_SECRET` (long random value in production)
   - `AUTH_DEV_EXPOSE_OTP=true` **only** on your machine to read `devOtp` in the request response (never in production)
   - **OTP (Phase 2C, optional):** for the usual dev flow, leave **`OTP_DELIVERY_PROVIDER=mock`** and
     **`OTP_DELIVERY_DRY_RUN=true`** (defaults in `.env.example`); the challenge row should show
     `providerStatus` = `skipped` and no real WhatsApp call.

**Ports (local default)**

- **API:** `3000` (e.g. `http://127.0.0.1:3000`)
- **Web (Next):** `3001` (set `NEXT_PUBLIC_API_BASE_URL` to the API, often `http://127.0.0.1:3000`)
- **Mobile (Expo):** the API is **not** reachable as `localhost` on a **physical** phone; use your computer’s
  **LAN address**, e.g. `EXPO_PUBLIC_API_BASE_URL=http://192.168.1.10:3000`

**Start the API**

```bash
cd apps/api
pnpm run start:dev
# default: http://127.0.0.1:3000
```

**1. Request OTP** (`devOtp` only if `AUTH_DEV_EXPOSE_OTP=true`)

```bash
curl -sS -X POST "http://127.0.0.1:3000/auth/otp/request" \
  -H "Content-Type: application/json" \
  -d '{"phone":"+9647901234567","purpose":"login","channel":"manual"}'
```

Save `challengeId` and, in dev, `devOtp` (6 digits).

**2. Verify OTP** (get `accessToken` and `sessionId`)

```bash
curl -sS -X POST "http://127.0.0.1:3000/auth/otp/verify" \
  -H "Content-Type: application/json" \
  -d '{"challengeId":"PASTE_CHALLENGE_ID","code":"PASTE_DEV_OTP"}'
```

**3. Current user**

```bash
curl -sS "http://127.0.0.1:3000/auth/me" \
  -H "Authorization: Bearer PASTE_ACCESS_TOKEN"
```

**4. Logout** (revokes the session in the token)

```bash
curl -sS -X POST "http://127.0.0.1:3000/auth/logout" \
  -H "Authorization: Bearer PASTE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

After logout, the same `accessToken` should fail **`GET /auth/me`** (401) because the session is revoked.

**Also check**

- `GET http://127.0.0.1:3000/health`
- `GET http://127.0.0.1:3000/docs` (Swagger UI)
- `GET http://127.0.0.1:3000/openapi.json`

**Optional: WhatsApp provider with dry run (no real network)**

Start the API with, for example:

```bash
export OTP_DELIVERY_PROVIDER=whatsapp
export OTP_DELIVERY_DRY_RUN=true
# WHATSAPP_* not required for this path — the provider skips HTTP
```

`POST /auth/otp/request` should still return **200**; in the database, `providerStatus` is **`skipped`**
(never a fake `sent`). Turn **`OTP_DELIVERY_DRY_RUN=false`** and set valid `WHATSAPP_*` only when you have
an approved template and a non-production test number.

**Confirming `OtpChallenge` in PostgreSQL (optional):**

```sql
SELECT "id", "providerStatus", "providerMessageId", "metadata"::text
FROM "otp_challenges" ORDER BY "createdAt" DESC LIMIT 1;
```

For mock/dry run, `metadata` should **not** contain the clear-text OTP; use `devOtp` in the **HTTP
response** only with `AUTH_DEV_EXPOSE_OTP=true`.

**Automated e2e** (requires DB + env):

```bash
cd apps/api
DATABASE_URL="postgresql://eventaat:eventaat@localhost:5432/eventaat?schema=public" \
JWT_ACCESS_SECRET="local-dev-secret-change-me" \
AUTH_DEV_EXPOSE_OTP="true" \
OTP_DELIVERY_PROVIDER="mock" \
OTP_DELIVERY_DRY_RUN="true" \
npx jest --config ./test/jest-e2e.json
```

See also [`api-reference.md`](./api-reference.md), [`auth-rbac-foundation.md`](./auth-rbac-foundation.md), and
[`otp-delivery-provider.md`](./otp-delivery-provider.md).
