import type { Reservation } from '@eventaat/shared';
import { ReservationStatus } from '@eventaat/shared';

const GUEST_ID = 'u_guest';

export const GUEST_CUSTOMER_ID = GUEST_ID;

export function mergeCustomerReservations(
  customerId: string,
  mockList: Reservation[],
  local: Reservation[],
): Reservation[] {
  const fromMock = mockList.filter((r) => r.customerId === customerId);
  const fromLocal = local.filter((r) => r.customerId === customerId);
  const ids = new Set(fromLocal.map((r) => r.id));
  return [...fromLocal, ...fromMock.filter((r) => !ids.has(r.id))];
}

export function findReservationById(
  id: string,
  mockList: Reservation[],
  local: Reservation[],
): Reservation | undefined {
  return local.find((r) => r.id === id) ?? mockList.find((r) => r.id === id);
}

export function groupReservationsForMyList(res: Reservation[]) {
  const waiting: Reservation[] = [];
  const upcoming: Reservation[] = [];
  const past: Reservation[] = [];
  const cancelled: Reservation[] = [];

  for (const r of res) {
    const s = r.status;
    if (
      s === ReservationStatus.pending ||
      s === ReservationStatus.draft ||
      s === ReservationStatus.alternative_proposed ||
      s === ReservationStatus.pending_change_approval
    ) {
      waiting.push(r);
    } else if (
      s === ReservationStatus.approved ||
      s === ReservationStatus.customer_on_the_way ||
      s === ReservationStatus.arrived ||
      s === ReservationStatus.waiting ||
      s === ReservationStatus.seated ||
      s === ReservationStatus.customer_confirmed_alternative
    ) {
      upcoming.push(r);
    } else if (s === ReservationStatus.completed || s === ReservationStatus.no_show) {
      past.push(r);
    } else {
      cancelled.push(r);
    }
  }
  return { waiting, upcoming, past, cancelled };
}

export function makeLocalReservationId() {
  return `local_${Date.now()}`;
}

export function makeRefCode() {
  return `EVT-${String(Math.floor(100000 + Math.random() * 900000))}`;
}
