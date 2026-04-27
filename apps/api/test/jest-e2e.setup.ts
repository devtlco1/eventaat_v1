/**
 * Ensures the API module can bootstrap (JWT) when DATABASE_URL is unset (e2e only uses Prisma for /health).
 */
if (!process.env.JWT_ACCESS_SECRET) {
  process.env.JWT_ACCESS_SECRET = 'e2e-jwt-test-secret-must-be-32chars-min-xxx';
}

if (!process.env.OTP_DELIVERY_PROVIDER) {
  process.env.OTP_DELIVERY_PROVIDER = 'mock';
}
if (!process.env.OTP_DELIVERY_DRY_RUN) {
  process.env.OTP_DELIVERY_DRY_RUN = 'true';
}
