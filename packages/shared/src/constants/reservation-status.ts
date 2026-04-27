/** Reservation lifecycle (blueprint Part 6 — section 27). */
export const ReservationStatus = {
  draft: 'draft',
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  alternative_proposed: 'alternative_proposed',
  customer_confirmed_alternative: 'customer_confirmed_alternative',
  pending_change_approval: 'pending_change_approval',
  customer_on_the_way: 'customer_on_the_way',
  arrived: 'arrived',
  waiting: 'waiting',
  seated: 'seated',
  completed: 'completed',
  cancelled_by_customer: 'cancelled_by_customer',
  cancelled_by_restaurant: 'cancelled_by_restaurant',
  cancelled_by_admin: 'cancelled_by_admin',
  no_show: 'no_show',
  expired: 'expired',
} as const;

export type ReservationStatus = (typeof ReservationStatus)[keyof typeof ReservationStatus];

export const RESERVATION_STATUS_LABELS_AR: Record<ReservationStatus, string> = {
  [ReservationStatus.draft]: 'مسودة',
  [ReservationStatus.pending]: 'بانتظار المطعم',
  [ReservationStatus.approved]: 'مؤكد',
  [ReservationStatus.rejected]: 'مرفوض',
  [ReservationStatus.alternative_proposed]: 'بديل مقترح',
  [ReservationStatus.customer_confirmed_alternative]: 'قبول البديل',
  [ReservationStatus.pending_change_approval]: 'تعديل بانتظار الموافقة',
  [ReservationStatus.customer_on_the_way]: 'في الطريق',
  [ReservationStatus.arrived]: 'وصل',
  [ReservationStatus.waiting]: 'بانتظار الطاولة',
  [ReservationStatus.seated]: 'جالس',
  [ReservationStatus.completed]: 'مكتمل',
  [ReservationStatus.cancelled_by_customer]: 'ملغى من الزبون',
  [ReservationStatus.cancelled_by_restaurant]: 'ملغى من المطعم',
  [ReservationStatus.cancelled_by_admin]: 'ملغى من الإدارة',
  [ReservationStatus.no_show]: 'لم يحضر',
  [ReservationStatus.expired]: 'منتهي',
};
