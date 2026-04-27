/**
 * Iraq mobile normalization (Baghdad / national format). Produces E.164-style display and digit-only key for unique lookup.
 */
const IQ_PREFIX = '964';

export type NormalizedPhone = {
  /** e.g. +9647XXXXXXXXX */
  e164: string;
  /** Digits only, no + — unique key (e.g. 9647XXXXXXXXX) */
  phoneNormalized: string;
};

/**
 * Normalizes user input to a consistent Iraqi international form.
 * Accepts common local patterns (07…), +964…, 964…, and 7XXXXXXXXX (10 digits).
 */
export function normalizeIraqPhone(input: string): NormalizedPhone {
  if (input == null || typeof input !== 'string') {
    return { e164: '', phoneNormalized: '' };
  }
  let s = input.trim().replace(/[\s\-().]/g, '');
  if (s.startsWith('+')) {
    s = s.slice(1);
  }
  let digits = s.replace(/\D/g, '');
  if (digits.length === 0) {
    return { e164: '', phoneNormalized: '' };
  }
  if (digits.startsWith(IQ_PREFIX)) {
    // already 964…
  } else if (digits.startsWith('0') && digits.length >= 10) {
    // 07XXXXXXXXX
    digits = IQ_PREFIX + digits.slice(1);
  } else if (digits.length === 10 && digits.startsWith('7')) {
    // 7XXXXXXXXX without country
    digits = IQ_PREFIX + digits;
  } else if (digits.length === 9 && digits.startsWith('7')) {
    digits = IQ_PREFIX + digits;
  }
  const e164 = `+${digits}`;
  return { e164, phoneNormalized: digits };
}

export function isValidIraqNormalized(phoneNormalized: string): boolean {
  // Iraq mobiles: 9647 + 8 digits = 12 digits, or 964 + 9–10 after country (common pattern 12 digits)
  if (!/^\d+$/.test(phoneNormalized)) return false;
  if (!phoneNormalized.startsWith('9647')) return false;
  if (phoneNormalized.length < 12 || phoneNormalized.length > 13) return false;
  return true;
}
