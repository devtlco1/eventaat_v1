import type { Reservation } from '@eventaat/shared';
import { ReservationStatus } from '@eventaat/shared';
import { isReservationOnDate, RESTAURANT_DEMO_TODAY } from '@/lib/restaurantConfig';

/** Prototype: “now” is after most same-day dinner slots, so earlier approved/OTW same-day are “late” */
const DEMO_LATE_CUTOFF = '2026-04-27T16:00:00.000Z';

export function isLateReservation(r: Reservation): boolean {
  if (r.status !== ReservationStatus.approved && r.status !== ReservationStatus.customer_on_the_way) {
    return false;
  }
  return new Date(r.scheduledAt).getTime() < new Date(DEMO_LATE_CUTOFF).getTime();
}

export function isNoShowCandidate(r: Reservation) {
  if (r.status === ReservationStatus.customer_on_the_way) {
    return isReservationOnDate(r.scheduledAt, RESTAURANT_DEMO_TODAY);
  }
  if (r.status === ReservationStatus.approved) {
    return isLateReservation(r);
  }
  return false;
}

export function isTodayReservation(r: Reservation, today = RESTAURANT_DEMO_TODAY) {
  return isReservationOnDate(r.scheduledAt, today);
}

export function timeLabel(iso: string) {
  try {
    return new Date(iso).toLocaleString('ar-IQ', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}
