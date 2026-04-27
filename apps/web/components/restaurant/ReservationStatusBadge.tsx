'use client';

import type { ReservationStatus } from '@eventaat/shared';
import { RESERVATION_STATUS_LABELS_AR, ReservationStatus as R } from '@eventaat/shared';
import styles from './restaurant.module.css';

const warn: Partial<Record<ReservationStatus, boolean>> = {
  [R.pending]: true,
  [R.alternative_proposed]: true,
  [R.pending_change_approval]: true,
  [R.expired]: true,
};
const err: Partial<Record<ReservationStatus, boolean>> = {
  [R.rejected]: true,
  [R.cancelled_by_customer]: true,
  [R.cancelled_by_restaurant]: true,
  [R.cancelled_by_admin]: true,
  [R.no_show]: true,
};

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  const label = RESERVATION_STATUS_LABELS_AR[status];
  const cls = err[status] ? styles.badgeErr : warn[status] ? styles.badgeWarn : styles.badgeOk;
  return <span className={`${styles.badge} ${cls}`}>{label}</span>;
}
