import { ReservationStatus } from '@eventaat/shared';

export const TIMELINE = [
  { key: 'request', label: 'طلب الحجز' },
  { key: 'approve', label: 'موافقة المطعم' },
  { key: 'arrive', label: 'الوصول' },
  { key: 'seat', label: 'الجلوس' },
  { key: 'done', label: 'الإكمال' },
] as const;

export function isCancelledLike(status: ReservationStatus) {
  return (
    status === ReservationStatus.cancelled_by_customer ||
    status === ReservationStatus.cancelled_by_restaurant ||
    status === ReservationStatus.cancelled_by_admin ||
    status === ReservationStatus.rejected ||
    status === ReservationStatus.expired
  );
}

/** 0..4 = progress along happy path; -1 = cancelled / not on main path */
export function activeTimelineIndex(status: ReservationStatus): number {
  if (status === ReservationStatus.rejected) return 0;
  if (isCancelledLike(status)) return -1;
  switch (status) {
    case ReservationStatus.draft:
    case ReservationStatus.pending:
    case ReservationStatus.alternative_proposed:
    case ReservationStatus.pending_change_approval:
      return 0;
    case ReservationStatus.approved:
    case ReservationStatus.customer_confirmed_alternative:
    case ReservationStatus.customer_on_the_way:
      return 1;
    case ReservationStatus.arrived:
    case ReservationStatus.waiting:
      return 2;
    case ReservationStatus.seated:
      return 3;
    case ReservationStatus.completed:
    case ReservationStatus.no_show:
      return 4;
    default:
      return -1;
  }
}
