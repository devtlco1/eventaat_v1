/**
 * Route metadata for shell top bar (code/paths in English; display strings Arabic).
 */
const titles: { prefix: string; title: string; sub?: string }[] = [
  { prefix: '/dashboard', title: 'لوحة المنصة', sub: 'ملخص تشغيلي' },
  { prefix: '/restaurant/settings', title: 'إعدادات المطعم' },
  { prefix: '/restaurant/reservations', title: 'إدارة الحجوزات' },
  { prefix: '/restaurant/tables', title: 'الطاولات' },
  { prefix: '/restaurant/branches', title: 'الفروع' },
  { prefix: '/restaurant', title: 'تشغيل المطعم' },
  { prefix: '/admin/restaurants', title: 'إدارة المطاعم' },
  { prefix: '/admin/reservations', title: 'رصد الحجوزات' },
  { prefix: '/admin/complaints', title: 'الشكاوى' },
  { prefix: '/admin/subscriptions', title: 'الاشتراكات' },
  { prefix: '/admin', title: 'ملخص الإدارة' },
  { prefix: '/call-center/tasks', title: 'مهام المتابعة' },
  { prefix: '/call-center/reservations', title: 'متابعة الحجوزات' },
  { prefix: '/call-center/complaints', title: 'متابعة الشكاوى' },
  { prefix: '/call-center', title: 'مكتب الاتصال' },
];

function pathMatches(pathname: string, prefix: string) {
  if (pathname === prefix) return true;
  if (prefix.length <= 1) return false;
  if (pathname.startsWith(`${prefix}/`)) return true;
  return false;
}

export function getShellMetaForPath(pathname: string) {
  const sorted = [...titles].sort((a, b) => b.prefix.length - a.prefix.length);
  const found = sorted.find((t) => pathMatches(pathname, t.prefix));
  if (found) {
    return { title: found.title, sub: found.sub };
  }
  return { title: 'لوحة التحكم' };
}
