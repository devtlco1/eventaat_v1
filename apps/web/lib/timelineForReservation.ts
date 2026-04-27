import type { Reservation } from '@eventaat/shared';
import { ReservationStatus } from '@eventaat/shared';

/** 0–4 along the five dashboard steps; -1 if cancelled / off path */
export function timelineStep(r: Reservation): number {
  const s = r.status;
  if (
    s === ReservationStatus.cancelled_by_customer ||
    s === ReservationStatus.cancelled_by_restaurant ||
    s === ReservationStatus.cancelled_by_admin ||
    s === ReservationStatus.rejected ||
    s === ReservationStatus.expired ||
    s === ReservationStatus.no_show
  ) {
    return -1;
  }
  if (s === ReservationStatus.draft || s === ReservationStatus.pending) return 0;
  if (
    s === ReservationStatus.approved ||
    s === ReservationStatus.alternative_proposed ||
    s === ReservationStatus.customer_confirmed_alternative ||
    s === ReservationStatus.pending_change_approval
  ) {
    return 1;
  }
  if (s === ReservationStatus.customer_on_the_way) return 2;
  if (s === ReservationStatus.arrived || s === ReservationStatus.waiting) return 2;
  if (s === ReservationStatus.seated) return 3;
  if (s === ReservationStatus.completed) return 4;
  return 0;
}
