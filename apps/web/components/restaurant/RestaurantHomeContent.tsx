'use client';

import Link from 'next/link';
import { ReservationStatus } from '@eventaat/shared';
import { ar } from '@/lib/arStrings';
import { isNoShowCandidate, isTodayReservation, isLateReservation, timeLabel } from '@/lib/reservationMetrics';
import { useRestaurantDashboard } from '@/context/RestaurantDashboardContext';
import { RestaurantMetricCard } from './RestaurantMetricCard';
import { ReservationStatusBadge } from './ReservationStatusBadge';
import styles from './restaurant.module.css';
import { RESERVATION_STATUS_LABELS_AR } from '@eventaat/shared';
import { UserRole } from '@eventaat/shared';

export function RestaurantHomeContent() {
  const { getMergedReservations, getMergedTables, role, restaurant } = useRestaurantDashboard();
  const res = getMergedReservations();
  const tab = getMergedTables();

  const today = res.filter((r) => isTodayReservation(r));
  const newReq = today.filter((r) => r.status === ReservationStatus.pending);
  const pending = res.filter((r) => r.status === ReservationStatus.pending);
  const arrivedC = res.filter(
    (r) => r.status === ReservationStatus.arrived || r.status === ReservationStatus.waiting,
  );
  const seatedC = res.filter((r) => r.status === ReservationStatus.seated);
  const risk = res.filter((r) => isNoShowCandidate(r));
  const late = res.filter((r) => isLateReservation(r) && (r.status === ReservationStatus.approved || r.status === ReservationStatus.customer_on_the_way));
  const avail = tab.filter((t) => t.status === 'available').length;
  const oos = tab.filter((t) => t.status === 'out_of_service').length;

  const byStatus = (() => {
    const m: Record<string, typeof res> = {};
    for (const r of today) {
      m[r.status] = m[r.status] ? [...m[r.status], r] : [r];
    }
    return m;
  })();

  const canQuick = role !== UserRole.restaurant_host;

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>{ar.dashboard.title}</h1>
      <p className={styles.sub}>
        {restaurant.name} — {restaurant.area} — {ar.shell.modelNote}
      </p>
      <div className={styles.pageTitle} style={{ fontSize: '1.05rem', marginTop: 8 }}>
        {ar.dashboard.todaySection}
      </div>
      <div className={styles.gridMetrics}>
        <RestaurantMetricCard label={ar.metrics.todayReservations} value={today.length} />
        <RestaurantMetricCard label={ar.metrics.newRequests} value={newReq.length} />
        <RestaurantMetricCard label={ar.metrics.pendingReply} value={pending.length} />
        <RestaurantMetricCard label={ar.metrics.arrivedGuests} value={arrivedC.length} />
        <RestaurantMetricCard label={ar.metrics.seated} value={seatedC.length} />
        <RestaurantMetricCard label={ar.metrics.noShowRisk} value={risk.length} />
        <RestaurantMetricCard label={ar.metrics.tablesAvailable} value={avail} />
        <RestaurantMetricCard label={ar.metrics.tablesOutOfService} value={oos} />
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>{ar.dashboard.byStatus}</h2>
        {Object.keys(byStatus).length === 0 ? (
          <p className={styles.muted}>لا حجوزات مرتبطة بتاريخ العينة لعرضها هنا. جرّب فتح «الحجوزات» لكل السجل.</p>
        ) : (
          <div className={styles.groups}>
            {Object.entries(byStatus).map(([k, list]) => (
              <div key={k}>
                <div className={styles.groupName}>
                  {RESERVATION_STATUS_LABELS_AR[k as keyof typeof RESERVATION_STATUS_LABELS_AR]} — {list.length}
                </div>
                {list.map((r) => (
                  <div key={r.id} className={styles.resRow}>
                    <span>
                      {r.refCode} — {r.scheduledAt && timeLabel(r.scheduledAt)}
                    </span>
                    <ReservationStatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>{ar.dashboard.pendingActions}</h2>
        {pending.length === 0 ? (
          <p className={styles.empty}>لا يوجد طلبات بانتظار الرد.</p>
        ) : (
          pending.map((r) => (
            <div key={r.id} className={styles.resRow}>
              <span>
                {r.refCode} — {timeLabel(r.scheduledAt)}
              </span>
              <Link href="/restaurant/reservations" className={styles.btn}>
                متابعة
              </Link>
            </div>
          ))
        )}
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>{ar.dashboard.needsAttention}</h2>
        {late.length === 0 ? (
          <p className={styles.empty}>لا حالات متأخرة بمعايير العيّنة.</p>
        ) : (
          late.map((r) => (
            <div key={r.id} className={styles.resRow}>
              <span>
                {ar.late.badge} {r.refCode} — {timeLabel(r.scheduledAt)}
              </span>
              <Link href="/restaurant/reservations" className={styles.btn}>
                إجراء
              </Link>
            </div>
          ))
        )}
      </div>

      {canQuick && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>{ar.dashboard.quickActions}</h2>
          <div className={styles.quick}>
            <Link className={`${styles.btn} ${styles.btnPrimary}`} href="/restaurant/reservations">
              {ar.dashboard.toReservations}
            </Link>
            <Link className={styles.btn} href="/restaurant/tables">
              {ar.dashboard.toTables}
            </Link>
            <Link className={styles.btn} href="/restaurant/branches">
              {ar.dashboard.toBranches}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
