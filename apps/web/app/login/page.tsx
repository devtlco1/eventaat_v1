'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { createAuthApi, AuthApiError } from '@eventaat/shared';
import { getWebApiBaseUrl } from '@/lib/webAuthStorage';
import { useWebAuth } from '@/components/auth/AuthContext';
import styles from './login.module.css';

const NETWORK_MSG =
  'تعذر الاتصال بخادم eventaat. تأكد أن خدمة API تعمل على المنفذ 3000 وأن NEXT_PUBLIC_API_BASE_URL مضبوط.';

function mapErr(e: unknown, step: 'req' | 'ver'): string {
  if (e instanceof AuthApiError) {
    if (e.code === 'AUTH_ERR_NETWORK') return NETWORK_MSG;
    if (e.code === 'AUTH_ERR_BAD_REQUEST' && step === 'req') return 'رقم الهاتف غير صحيح';
    if (e.code === 'AUTH_ERR_BAD_REQUEST' && step === 'ver') return 'الرمز غير صحيح أو منتهي';
    if (e.code === 'AUTH_ERR_DELIVERY' || (e.code === 'AUTH_ERR_SERVER' && (e.httpStatus === 502 || e.httpStatus === 503)))
      return 'تعذر إرسال الرمز';
  }
  return NETWORK_MSG;
}

export default function LoginPage() {
  const base = getWebApiBaseUrl();
  const api = useMemo(() => createAuthApi(base), [base]);
  const { signInFromVerify, user, ready } = useWebAuth();
  const router = useRouter();
  const [nextPath, setNextPath] = useState('/dashboard');
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const n = new URLSearchParams(window.location.search).get('next');
    if (n && n.startsWith('/')) setNextPath(n);
  }, []);

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [code, setCode] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (ready && user) {
      router.replace(nextPath);
    }
  }, [ready, user, router, nextPath]);

  const onRequestOtp = () => {
    setErr('');
    setLoading(true);
    void (async () => {
      try {
        const r = await api.requestOtp({ phone: phone.trim(), purpose: 'login', channel: 'whatsapp' });
        setChallengeId(r.challengeId);
        setDevOtp(r.devOtp ?? null);
        setStep('otp');
      } catch (e) {
        setErr(mapErr(e, 'req'));
      } finally {
        setLoading(false);
      }
    })();
  };

  const onVerify = () => {
    setErr('');
    setLoading(true);
    void (async () => {
      try {
        const r = await api.verifyOtp({
          challengeId,
          code: code.trim(),
          phone: phone.trim(),
        });
        signInFromVerify(r);
        router.replace(nextPath);
      } catch (e) {
        setErr(mapErr(e, 'ver'));
      } finally {
        setLoading(false);
      }
    })();
  };

  if (!ready) {
    return (
      <div className={styles.wrap}>
        <p className={styles.sub} style={{ textAlign: 'center' }}>جارٍ التحميل…</p>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>تسجيل الدخول</h1>
        <p className={styles.sub}>
          {step === 'phone'
            ? 'أدخل رقم الهاتف لإرسال رمز عبر واتساب (حسب إعدادات الخادم).'
            : 'تم إرسال رمز التحقق عبر واتساب.'}
        </p>
        {step === 'phone' ? (
          <>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="phone">
                رقم الهاتف
              </label>
              <input
                id="phone"
                className={styles.input}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                autoComplete="tel"
                dir="rtl"
                placeholder="07XX XXX XXXX"
              />
            </div>
            {err ? <p className={styles.error}>{err}</p> : null}
            <button type="button" className={styles.btn} disabled={loading} onClick={onRequestOtp}>
              {loading ? 'جارٍ الإرسال…' : 'إرسال رمز واتساب'}
            </button>
          </>
        ) : (
          <>
            <p className={styles.ok}>{phone}</p>
            {devOtp ? (
              <div className={styles.dev}>
                <span>للتطوير المحلي فقط — ليس للإنتاج</span>
                <br />
                <strong>رمز التطوير: {devOtp}</strong>
              </div>
            ) : null}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="code">
                رمز التحقق
              </label>
              <input
                id="code"
                className={styles.input}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                dir="ltr"
                autoComplete="one-time-code"
                placeholder="000000"
              />
            </div>
            {err ? <p className={styles.error}>{err}</p> : null}
            <button type="button" className={styles.btn} disabled={loading} onClick={onVerify}>
              {loading ? 'جارٍ التحقق…' : 'متابعة'}
            </button>
            <button type="button" className={styles.back} onClick={() => { setStep('phone'); setErr(''); }}>
              تعديل الرقم
            </button>
          </>
        )}
      </div>
    </div>
  );
}
