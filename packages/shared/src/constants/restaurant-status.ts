/**
 * Restaurant listing / lifecycle in mock (aligned with review, visibility, and ops from blueprint
 * Phases 3, 7, 10; Phase 1A uses a single field for mock simplicity).
 */
export const RestaurantStatus = {
  under_review: 'under_review',
  approved: 'approved',
  rejected: 'rejected',
  needs_changes: 'needs_changes',
  suspended: 'suspended',
  visible: 'visible',
  hidden: 'hidden',
  bookings_disabled: 'bookings_disabled',
} as const;

export type RestaurantStatus = (typeof RestaurantStatus)[keyof typeof RestaurantStatus];

export const RESTAURANT_STATUS_LABELS_AR: Record<RestaurantStatus, string> = {
  [RestaurantStatus.under_review]: 'قيد المراجعة',
  [RestaurantStatus.approved]: 'معتمد',
  [RestaurantStatus.rejected]: 'مرفوض',
  [RestaurantStatus.needs_changes]: 'يحتاج تعديل',
  [RestaurantStatus.suspended]: 'معلق',
  [RestaurantStatus.visible]: 'ظاهر للزبائن',
  [RestaurantStatus.hidden]: 'مخفي',
  [RestaurantStatus.bookings_disabled]: 'الحجوزات معطلة',
};
