'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAME } from '@eventaat/shared';
import styles from './shell.module.css';

const nav: { href: string; label: string; group: 'hub' | 'restaurant' | 'admin' | 'cc' }[] = [
  { href: '/dashboard', label: 'لوحة البداية', group: 'hub' },
  { href: '/restaurant', label: 'حساب المطعم', group: 'restaurant' },
  { href: '/restaurant/reservations', label: 'الحجوزات', group: 'restaurant' },
  { href: '/restaurant/tables', label: 'الطاولات', group: 'restaurant' },
  { href: '/restaurant/branches', label: 'الفروع', group: 'restaurant' },
  { href: '/restaurant/settings', label: 'الإعدادات', group: 'restaurant' },
  { href: '/admin', label: 'ملخص الإدارة', group: 'admin' },
  { href: '/admin/restaurants', label: 'مطاعم', group: 'admin' },
  { href: '/admin/reservations', label: 'حجوزات', group: 'admin' },
  { href: '/admin/complaints', label: 'شكاوى', group: 'admin' },
  { href: '/admin/subscriptions', label: 'اشتراكات', group: 'admin' },
  { href: '/call-center', label: 'مكتب الاتصال', group: 'cc' },
  { href: '/call-center/tasks', label: 'مهام', group: 'cc' },
  { href: '/call-center/reservations', label: 'متابعة حجوزات', group: 'cc' },
  { href: '/call-center/complaints', label: 'متابعة شكاوى', group: 'cc' },
];

function groupLabel(g: (typeof nav)[0]['group']) {
  if (g === 'hub') return 'عام';
  if (g === 'restaurant') return 'واجهة المطعم';
  if (g === 'admin') return 'إدارة ' + APP_NAME;
  return 'الكول سنتر';
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isRestaurant = path.startsWith('/restaurant');

  const groups: (typeof nav)[0]['group'][] = ['hub', 'restaurant', 'admin', 'cc'];

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar} aria-label="التنقل الرئيسي">
        <div className={styles.brand}>
          <span className={styles.brandMark} />
          {APP_NAME}
        </div>
        <nav>
          {groups.map((g) => (
            <div key={g} className={styles.group}>
              <div className={styles.groupTitle}>{groupLabel(g)}</div>
              <ul className={styles.list}>
                {nav
                  .filter((item) => item.group === g)
                  .map((item) => {
                    const active = path === item.href;
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
      </aside>
      <div className={styles.mainCol}>
        <header className={styles.topbar}>
          <h1 className={styles.topbarTitle}>
            {isRestaurant ? 'لوحة المطعم (نموذج Phase 1C)' : 'نموذج واجهة (Phase 1A)'}
          </h1>
          <p className={styles.topbarSub}>
            {isRestaurant
              ? 'واجهة عربية للمطعم — بيانات من العينة، تعديلات محلية فقط'
              : 'بيانات وهمية فقط — بدون باك-إند'}
          </p>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
