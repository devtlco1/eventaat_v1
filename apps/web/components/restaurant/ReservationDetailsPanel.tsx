'use client';

import type { Reservation } from '@eventaat/shared';
import { RESERVATION_OCCASION_LABELS_AR, RESERVATION_STATUS_LABELS_AR, SEATING_TYPE_LABELS_AR } from '@eventaat/shared';
import { ar } from '@/lib/arStrings';
import { timeLabel, isTodayReservation } from '@/lib/reservationMetrics';
import { useRestaurantDashboard } from '@/context/RestaurantDashboardContext';
import { ReservationStatusBadge } from './ReservationStatusBadge';
import styles from './restaurant.module.css';
import { timelineStep } from '@/lib/timelineForReservation';

const LABELS = [
  'طلب الحجز',
  'موافقة المطعم',
  'الوصول',
  'الجلوس',
  'الإكمال',
] as const;

export function ReservationDetailsPanel({
  r,
  onClose,
  branches,
}: {
  r: Reservation;
  onClose: () => void;
  branches: { id: string; name: string }[];
}) {
  const { usersById, getMergedTables } = useRestaurantDashboard();
  const cust = usersById.get(r.customerId);
  const b = branches.find((x) => x.id === r.branchId);
  const tables = getMergedTables();
  const table = r.tableId ? tables.find((t) => t.id === r.tableId) : null;
  const tIdx = timelineStep(r);
  return (
    <div className={styles.drawerOverlay} onClick={onClose} role="presentation">
      <div
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
        aria-labelledby="det-title"
      >
        <div className={styles.drawerHead}>
          <h2 className={styles.pageTitle} id="det-title">
            {ar.panel.title}
          </h2>
          <button type="button" className={styles.btn} onClick={onClose}>
            {ar.common.close}
          </button>
        </div>
        <p>
          <ReservationStatusBadge status={r.status} />{' '}
          <span className={styles.pill}>{r.refCode}</span>
        </p>
        <p style={{ margin: '0.4rem 0' }}>
          <strong>{ar.reservation.customer}:</strong> {cust?.displayName ?? r.customerId}
        </p>
        {cust?.phone && (
          <p className={styles.muted}>
            {ar.panel.customerPhone}: {cust.phone}
          </p>
        )}
        <p>
          {b?.name ?? r.branchId} — {ar.reservation.time}: {timeLabel(r.scheduledAt)}
        </p>
        <p>
          {ar.reservation.party}: {r.partySize}
        </p>
        {r.seatingType && <p>الجلوس: {SEATING_TYPE_LABELS_AR[r.seatingType]}</p>}
        {r.occasion && <p>المناسبة: {RESERVATION_OCCASION_LABELS_AR[r.occasion]}</p>}
        {r.customerNotes && <p>ملاحظة الزبون: {r.customerNotes}</p>}
        {r.note && <p className={styles.muted}>ملاحظة النظام: {r.note}</p>}
        <p>
          {ar.panel.table}: {table ? table.label : '—'}
        </p>
        <h4 className={styles.cardTitle}>{ar.panel.timeline}</h4>
        {tIdx < 0 ? (
          <p className={styles.muted}>للحالات الملغاة أو المرفوضة أو «لم يحضر» لا يُعرض المسار الكامل كمخطط زمني مكتمل.</p>
        ) : (
          <ol className={styles.timeLine} style={{ listStyle: 'none' }}>
            {LABELS.map((label, i) => {
              const current = tIdx === i;
              const done = tIdx > i;
              return (
                <li key={label} className={current ? styles.current : done ? styles.done : undefined}>
                  {label}
                  {current ? ' — (الوضع الحالي)' : ''}
                </li>
              );
            })}
          </ol>
        )}
        <h4 className={styles.cardTitle}>{ar.panel.internalNotes}</h4>
        <p className={styles.muted}>
          (عينة) الاستقبال: متابعة الحجز {r.refCode} دون ارتباط بخادم. اليوم:{' '}
          {isTodayReservation(r) ? 'نعم' : 'ضمن التواريخ الظاهرة'}
        </p>
        <h4 className={styles.cardTitle}>{ar.panel.actionHistory}</h4>
        <p className={styles.muted}>
          إنشاء: {timeLabel(r.createdAt)} — آخر حالة: {RESERVATION_STATUS_LABELS_AR[r.status]}
        </p>
      </div>
    </div>
  );
}
