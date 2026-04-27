import { randomBytes, randomInt, scryptSync, timingSafeEqual } from 'crypto';

const SCRYPT_KEYLEN = 32;
const SCRYPT_SALT_LEN = 16;
const REFRESH_BYTES = 48;
const VERSION_PREFIX = 's1:';

/**
 * 6-digit numeric OTP for SMS/WhatsApp UX.
 */
export function generateNumericOtp(length = 6): string {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(randomInt(min, max + 1));
}

/**
 * Scrypt-based hash with server pepper. Store result in `OtpChallenge.codeHash` (never the raw code).
 */
export function hashOtp(plain: string, pepper: string): string {
  const salt = randomBytes(SCRYPT_SALT_LEN);
  const key = scryptSync(plain + pepper, salt, SCRYPT_KEYLEN);
  return `${VERSION_PREFIX}${salt.toString('hex')}:${key.toString('hex')}`;
}

export function verifyOtp(plain: string, stored: string, pepper: string): boolean {
  if (!stored.startsWith(VERSION_PREFIX)) {
    return false;
  }
  const rest = stored.slice(VERSION_PREFIX.length);
  const colon = rest.indexOf(':');
  if (colon < 0) {
    return false;
  }
  const saltHex = rest.slice(0, colon);
  const hashHex = rest.slice(colon + 1);
  if (!/^[0-9a-f]+$/i.test(saltHex) || !/^[0-9a-f]+$/i.test(hashHex)) {
    return false;
  }
  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  const key = scryptSync(plain + pepper, salt, SCRYPT_KEYLEN);
  if (key.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(key, expected);
}

/**
 * Opaque refresh token; only the hash is persisted on `UserSession.refreshTokenHash`.
 */
export function generateRefreshToken(): string {
  return randomBytes(REFRESH_BYTES).toString('base64url');
}

export function hashRefreshToken(refreshPlain: string, pepper: string): string {
  const salt = randomBytes(SCRYPT_SALT_LEN);
  const key = scryptSync(refreshPlain + pepper, salt, SCRYPT_KEYLEN);
  return `r1:${salt.toString('hex')}:${key.toString('hex')}`;
}

export function verifyRefreshToken(plain: string, stored: string, pepper: string): boolean {
  if (!stored.startsWith('r1:')) {
    return false;
  }
  const rest = stored.slice(3);
  const colon = rest.indexOf(':');
  if (colon < 0) {
    return false;
  }
  const salt = Buffer.from(rest.slice(0, colon), 'hex');
  const expected = Buffer.from(rest.slice(colon + 1), 'hex');
  const key = scryptSync(plain + pepper, salt, SCRYPT_KEYLEN);
  if (key.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(key, expected);
}
