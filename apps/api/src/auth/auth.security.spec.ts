import {
  generateNumericOtp,
  hashOtp,
  hashRefreshToken,
  verifyOtp,
  verifyRefreshToken,
} from './auth.security';

const pepper = 'test-pepper-not-for-production-use-32b';

describe('auth.security', () => {
  it('generates numeric OTP of given length', () => {
    const o = generateNumericOtp(6);
    expect(o).toMatch(/^\d{6}$/);
  });

  it('verifies matching OTP against hash', () => {
    const h = hashOtp('123456', pepper);
    expect(verifyOtp('123456', h, pepper)).toBe(true);
    expect(verifyOtp('000000', h, pepper)).toBe(false);
  });

  it('verifies refresh token against hash', () => {
    const t = 'opaque-refresh-token-value';
    const h = hashRefreshToken(t, pepper);
    expect(verifyRefreshToken(t, h, pepper)).toBe(true);
    expect(verifyRefreshToken('other', h, pepper)).toBe(false);
  });
});
