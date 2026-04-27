'use client';

import type { TableStatus } from '@eventaat/shared';
import { TableStatus as T, TABLE_STATUS_LABELS_AR } from '@eventaat/shared';
import styles from './restaurant.module.css';

const map: Partial<Record<TableStatus, string>> = {
  [T.available]: styles.badgeOk,
  [T.occupied]: styles.badgeInfo,
  [T.reserved]: styles.badgeWarn,
  [T.out_of_service]: styles.badgeErr,
  [T.blocked]: styles.badgeErr,
  [T.waiting_cleaning]: styles.badgeWarn,
  [T.cleaning]: styles.badgeWarn,
};

export function TableStatusBadge({ status }: { status: TableStatus }) {
  const c = map[status] ?? styles.badgeNeutral;
  return <span className={`${styles.badge} ${c}`}>{TABLE_STATUS_LABELS_AR[status]}</span>;
}
