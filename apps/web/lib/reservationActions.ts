import type { Reservation } from '@eventaat/shared';
import { ReservationStatus } from '@eventaat/shared';
import { isLateReservation, isNoShowCandidate } from '@/lib/reservationMetrics';

export type ActionKey =
  | 'accept'
  | 'reject'
  | 'propose'
  | 'arrival'
  | 'cancel'
  | 'seat'
  | 'complete'
  | 'noShow'
  | 'details';

export function availableActionsForReservation(r: Reservation): ActionKey[] {
  const k: ActionKey[] = ['details'];
  switch (r.status) {
    case ReservationStatus.pending:
      return ['accept', 'reject', 'propose', ...k];
    case ReservationStatus.approved:
      if (isLateReservation(r) || isNoShowCandidate(r)) {
        return ['arrival', 'noShow', 'cancel', ...k];
      }
      return ['arrival', 'cancel', ...k];
    case ReservationStatus.customer_on_the_way:
      if (isNoShowCandidate(r)) {
        return ['arrival', 'noShow', ...k];
      }
      return ['arrival', ...k];
    case ReservationStatus.arrived:
    case ReservationStatus.waiting:
      return ['seat', 'cancel', ...k];
    case ReservationStatus.seated:
      return ['complete', ...k];
    case ReservationStatus.completed:
      return ['details'];
    default:
      return ['details'];
  }
}
