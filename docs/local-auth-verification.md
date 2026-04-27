# Local manual verification — auth API (Phase 2B / 2B.1)

Use this flow to exercise the **existing** auth endpoints against a **local PostgreSQL** with the
`auth_foundation` migration applied. **No** new routes are added in Phase 2B.1; this is verification only.

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

**Automated e2e** (requires DB + env):

```bash
cd apps/api
DATABASE_URL="postgresql://eventaat:eventaat@localhost:5432/eventaat?schema=public" \
JWT_ACCESS_SECRET="local-dev-secret-change-me" \
AUTH_DEV_EXPOSE_OTP="true" \
npx jest --config ./test/jest-e2e.json
```

See also [`api-reference.md`](./api-reference.md) and [`auth-rbac-foundation.md`](./auth-rbac-foundation.md).
