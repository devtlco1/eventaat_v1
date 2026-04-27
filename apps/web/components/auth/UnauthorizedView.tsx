'use client';

import Link from 'next/link';
import { USER_ROLE_LABELS_AR, type UserPublic } from '@eventaat/shared';
import { useWebAuth } from './AuthContext';
import styles from './unauthorized.module.css';

type Props = {
  user: UserPublic;
  reason: 'customer' | 'forbidden' | 'path' | undefined;
};

export function UnauthorizedView({ user, reason }: Props) {
  const { signOut } = useWebAuth();
  const roleLabel = USER_ROLE_LABELS_AR[user.primaryRole] ?? user.primaryRole;
  return (
    <div className={styles.wrap} dir="rtl">
      <div className={styles.card}>
        <h1 className={styles.title}>غير مصرح بالوصول</h1>
        <p className={styles.text}>
          لا يملك هذا الحساب صلاحية الدخول إلى هذا القسم.
        </p>
        <p className={styles.meta}>
          <span className={styles.muted}>الدور في النظام:</span> {roleLabel}
        </p>
        {reason === 'customer' ? (
          <p className={styles.hint}>واجهة المطعم مخصصة لحسابات التشغيل وليس لحساب الزبون الافتراضي.</p>
        ) : null}
        <div className={styles.actions}>
          <Link href="/dashboard" className={styles.primary} replace>
            العودة للرئيسية
          </Link>
          <button type="button" className={styles.ghost} onClick={() => void signOut()}>
            تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  );
}
