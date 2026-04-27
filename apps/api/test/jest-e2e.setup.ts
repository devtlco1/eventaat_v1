/**
 * Ensures the API module can bootstrap (JWT) when DATABASE_URL is unset (e2e only uses Prisma for /health).
 */
if (!process.env.JWT_ACCESS_SECRET) {
  process.env.JWT_ACCESS_SECRET = 'e2e-jwt-test-secret-must-be-32chars-min-xxx';
}
