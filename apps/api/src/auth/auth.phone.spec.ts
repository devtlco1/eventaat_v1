import { isValidIraqNormalized, normalizeIraqPhone } from './auth.phone';

describe('auth.phone', () => {
  it('normalizes 07 local to 964 + digits', () => {
    const a = normalizeIraqPhone(' 0790 123 4567 ');
    expect(a.e164).toMatch(/^\+9647/);
    expect(a.phoneNormalized.startsWith('9647')).toBe(true);
  });

  it('accepts +964 prefix', () => {
    const a = normalizeIraqPhone('+9647901234567');
    expect(a.phoneNormalized).toBe('9647901234567');
  });

  it('validates common mobile length for 9647', () => {
    const a = normalizeIraqPhone('07901234567');
    expect(isValidIraqNormalized(a.phoneNormalized)).toBe(true);
  });
});
