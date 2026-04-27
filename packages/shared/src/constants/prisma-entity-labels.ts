/**
 * Arabic UI labels for **Prisma** enum values stored in the API database (Phase 3A+).
 * These keys match `apps/api/prisma/schema.prisma` exactly (English snake_case).
 *
 * **Not** the same as mock `RestaurantStatus` / `TableStatus` in this package — mock UIs keep
 * their existing constants until dashboards read from the API (see `docs/mock-data-contract.md`).
 */
export const prismaRestaurantStatusLabelsAr: Record<string, string> = {
  draft: 'مسودة',
  pending_review: 'قيد المراجعة',
  active: 'نشط',
  needs_changes: 'يحتاج تعديل',
  bookings_disabled: 'الحجوزات معطلة',
  suspended: 'معلق',
  archived: 'مؤرشف',
};

export const prismaTableStatusLabelsAr: Record<string, string> = {
  available: 'متاحة',
  reserved: 'محجوزة',
  occupied: 'مشغولة',
  waiting_cleaning: 'بانتظار التنظيف',
  cleaning: 'تنظيف',
  blocked: 'محجوبة',
  out_of_service: 'خارج الخدمة',
  archived: 'مؤرشفة',
};

export const prismaBranchStatusLabelsAr: Record<string, string> = {
  open: 'مفتوح',
  closed: 'مغلق',
  temporarily_closed: 'مغلق مؤقتاً',
  bookings_disabled: 'الحجوزات معطلة',
  archived: 'مؤرشف',
};

export const prismaSeatingAreaTypeLabelsAr: Record<string, string> = {
  indoor: 'داخلي',
  outdoor: 'خارجي',
  family: 'عوائل',
  vip: 'VIP',
  smoking: 'تدخين',
  non_smoking: 'غير تدخين',
  mixed: 'مختلط',
};

export const prismaRestaurantUserRoleLabelsAr: Record<string, string> = {
  owner: 'مالك',
  manager: 'مدير',
  host: 'استقبال',
  viewer: 'مشاهد',
};

export const prismaRestaurantOnboardingStatusLabelsAr: Record<string, string> = {
  not_started: 'غير مبدوء',
  profile_pending: 'بانتظار اكتمال الملف',
  branches_pending: 'بانتظار الفروع',
  tables_pending: 'بانتظار الطاولات',
  under_review: 'قيد المراجعة',
  approved: 'موافق عليه',
  needs_changes: 'يحتاج تعديل',
};
