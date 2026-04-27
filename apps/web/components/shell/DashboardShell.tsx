'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAME } from '@eventaat/shared';
import { useWebAuth } from '@/components/auth/AuthContext';
import { isAuthRequired } from '@/lib/webAuthStorage';
import { getShellMetaForPath } from '@/lib/shellMeta';
import styles from './shell.module.css';

const nav: { href: string; label: string; group: 'hub' | 'restaurant' | 'admin' | 'cc' }[] = [
  { href: '/dashboard', label: 'لوحة البداية', group: 'hub' },
  { href: '/restaurant', label: 'حساب المطعم', group: 'restaurant' },
  { href: '/restaurant/reservations', label: 'إدارة الحجوزات', group: 'restaurant' },
  { href: '/restaurant/tables', label: 'الطاولات', group: 'restaurant' },
  { href: '/restaurant/branches', label: 'الفروع', group: 'restaurant' },
  { href: '/restaurant/settings', label: 'إعدادات المطعم', group: 'restaurant' },
  { href: '/admin', label: 'ملخص الإدارة', group: 'admin' },
  { href: '/admin/restaurants', label: 'إدارة المطاعم', group: 'admin' },
  { href: '/admin/reservations', label: 'رصد الحجوزات', group: 'admin' },
  { href: '/admin/complaints', label: 'الشكاوى', group: 'admin' },
  { href: '/admin/subscriptions', label: 'الاشتراكات', group: 'admin' },
  { href: '/call-center', label: 'مكتب الاتصال', group: 'cc' },
  { href: '/call-center/tasks', label: 'مهام المتابعة', group: 'cc' },
  { href: '/call-center/reservations', label: 'متابعة الحجوزات', group: 'cc' },
  { href: '/call-center/complaints', label: 'متابعة الشكاوى', group: 'cc' },
];

function groupLabel(g: (typeof nav)[0]['group']) {
  if (g === 'hub') return 'عام';
  if (g === 'restaurant') return 'واجهة المطعم';
  if (g === 'admin') return 'إدارة ' + APP_NAME;
  return 'الكول سنتر';
}

function isActivePath(path: string, href: string) {
  if (href === '/restaurant' && path === '/restaurant') return true;
  if (href !== '/restaurant' && href !== '/dashboard' && href !== '/admin' && href !== '/call-center') {
    return path === href || path.startsWith(`${href}/`);
  }
  return path === href;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const meta = getShellMetaForPath(path);
  const { user, signOut, ready } = useWebAuth();
  const needAuth = isAuthRequired();

  const groups: (typeof nav)[0]['group'][] = ['hub', 'restaurant', 'admin', 'cc'];

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar} aria-label="التنقل الرئيسي">
        <div className={styles.brand}>
          <span className={styles.brandMark} />
          <span className={styles.brandText}>{APP_NAME}</span>
        </div>
        <div className={styles.navScroll}>
          <nav>
            {groups.map((g) => (
              <div key={g} className={styles.group}>
                <div className={styles.groupTitle}>{groupLabel(g)}</div>
                <ul className={styles.list}>
                  {nav
                    .filter((item) => item.group === g)
                    .map((item) => {
                      const active = isActivePath(path, item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={active ? styles.linkActive : styles.link}
                            aria-current={active ? 'page' : undefined}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className={styles.sideFooter}>
          <span className={styles.protoPill}>نموذج تجريبي</span>
        </div>
      </aside>
      <div className={styles.mainCol}>
        <header className={styles.topbar}>
          <div>
            <h1 className={styles.topbarTitle}>{meta.title}</h1>
            {meta.sub && <p className={styles.topbarSub}>{meta.sub}</p>}
            {!meta.sub && (
              <p className={styles.topbarSub}>
                بيانات وهمية — بدون تخزين على الخادم
              </p>
            )}
          </div>
          {ready && (
            <div className={styles.sessionBar} dir="rtl">
              {user ? (
                <>
                  <span className={styles.sessionChip} title={user.phone}>
                    {user.fullName?.trim() || user.phone}
                  </span>
                  <button type="button" className={styles.sessionBtn} onClick={() => void signOut()}>
                    تسجيل خروج
                  </button>
                </>
              ) : (
                <>
                  <span className={styles.sessionHint}>
                    {needAuth ? '' : 'نموذج: غير مُدخل — '}
                    <Link href="/login" className={styles.sessionLink}>
                      تسجيل الدخول
                    </Link>
                  </span>
                </>
              )}
            </div>
          )}
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
