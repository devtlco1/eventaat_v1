/**
 * Auth domain — reference constants (see `README.md` and `docs/api-reference.md`).
 */
export const AUTH_MODULE_README = 'See apps/api/src/auth/README.md.';

/** Default max OTP verify attempts (also default on `OtpChallenge.maxAttempts` in Prisma). */
export const DEFAULT_OTP_MAX_ATTEMPTS = 5;

/** Environment keys (see `apps/api/.env.example`) */
export const AUTH_ENV = {
  JWT_ACCESS_SECRET: 'JWT_ACCESS_SECRET',
  JWT_ACCESS_EXPIRES_IN: 'JWT_ACCESS_EXPIRES_IN',
  REFRESH_TOKEN_EXPIRES_DAYS: 'REFRESH_TOKEN_EXPIRES_DAYS',
  OTP_EXPIRES_MINUTES: 'OTP_EXPIRES_MINUTES',
  OTP_MAX_ATTEMPTS: 'OTP_MAX_ATTEMPTS',
  AUTH_DEV_EXPOSE_OTP: 'AUTH_DEV_EXPOSE_OTP',
} as const;
