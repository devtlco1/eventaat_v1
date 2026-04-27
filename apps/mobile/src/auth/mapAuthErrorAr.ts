import { AuthApiError, AUTH_ERR_NETWORK, AUTH_ERR_UNAUTHORIZED } from '@eventaat/shared';

const NET = 'تعذر الاتصال بالخادم';
const PHONE = 'رقم الهاتف غير صحيح';
const SEND = 'تعذر إرسال الرمز';
const OTP_BAD = 'الرمز غير صحيح أو منتهي';
const SESSION = 'انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى';
const RATE = 'محاولات كثيرة. يرجى الانتظار قليلاً ثم المحاولة';
const FORBIDDEN = 'لا يمكن المتابعة مع هذا الحساب';

/**
 * User-facing Arabic copy only. Use `step` to disambiguate 400 on request vs verify.
 */
export function mapAuthErrorToAr(
  e: unknown,
  step: 'request_otp' | 'verify_otp' | 'other' = 'other',
): string {
  if (e instanceof AuthApiError) {
    if (e.code === AUTH_ERR_NETWORK) {
      return NET;
    }
    if (e.code === 'AUTH_ERR_UNAUTHORIZED' || e.code === AUTH_ERR_UNAUTHORIZED) {
      if (step === 'verify_otp' || step === 'other') {
        return step === 'verify_otp' ? OTP_BAD : SESSION;
      }
      return SESSION;
    }
    if (e.code === 'AUTH_ERR_FORBIDDEN') {
      if (e.serverCode === 'ACCOUNT_DISABLED' || e.serverCode === 'ACCOUNT_SUSPENDED') {
        return FORBIDDEN;
      }
      return FORBIDDEN;
    }
    if (e.code === 'AUTH_ERR_BAD_REQUEST' && e.httpStatus === 400) {
      if (step === 'request_otp') {
        if (e.serverCode === 'INVALID_PHONE') {
          return PHONE;
        }
        return PHONE;
      }
      if (step === 'verify_otp') {
        return OTP_BAD;
      }
    }
    if (e.code === 'AUTH_ERR_DELIVERY' || (e.code === 'AUTH_ERR_SERVER' && (e.httpStatus === 502 || e.httpStatus === 503))) {
      return SEND;
    }
    if (e.code === 'AUTH_ERR_RATE' || (e.code === 'AUTH_ERR_HTTP' && e.httpStatus === 429)) {
      return RATE;
    }
  }
  return NET;
}

export function getSessionExpiredAr(): string {
  return SESSION;
}
