# Auth (API) — implementation

**Phase 2B** provides **HTTP** authentication:

| Path | Method | Notes |
|------|--------|--------|
| `/auth/otp/request` | POST | Creates user if needed, hashed OTP, optional `devOtp` if `AUTH_DEV_EXPOSE_OTP=true` |
| `/auth/otp/verify` | POST | Issues JWT + opaque refresh; stores refresh **hash** only |
| `/auth/me` | GET | Bearer access token; validates session in DB |
| `/auth/logout` | POST | Revokes current session (Bearer) |

- **No** real WhatsApp/SMS sending (see Phase 2C).
- **No** product RBAC **guards** on other routes (Phase 2E).
- Helpers: `auth.phone`, `auth.security` (scrypt + timing-safe compare), `auth.audit`, `OtpDispatcherService` (no-op for now).
- DTOs under `dto/`; `JwtSessionGuard` for protected routes.
