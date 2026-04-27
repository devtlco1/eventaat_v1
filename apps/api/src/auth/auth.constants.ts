/**
 * Auth domain — constants for documentation and future use (Phase 2A: no auth routes yet).
 * Prisma stores canonical enums; this file only mirrors names for quick reference in Nest code.
 */
export const AUTH_MODULE_README = 'See apps/api/src/auth/README.md for Phase 2 plan.';

/** Default max OTP verify attempts (also default on `OtpChallenge.maxAttempts` in Prisma). */
export const DEFAULT_OTP_MAX_ATTEMPTS = 5;
