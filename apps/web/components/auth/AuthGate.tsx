'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { isAuthRequired } from '@/lib/webAuthStorage';
import { useWebAuth } from './AuthContext';
import styles from './auth-gate.module.css';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, ready } = useWebAuth();
  const path = usePathname();
  const router = useRouter();
  const required = isAuthRequired();

  useEffect(() => {
    if (!required || !ready) return;
    if (user) return;
    if (path === '/login') return;
    router.replace(`/login?next=${encodeURIComponent(path || '/dashboard')}`);
  }, [required, ready, user, path, router]);

  if (!required) {
    return <>{children}</>;
  }

  if (!ready) {
    return (
      <div className={styles.loading} role="status" aria-live="polite">
        جارٍ التحقق من الجلسة…
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
