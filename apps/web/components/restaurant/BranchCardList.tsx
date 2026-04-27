'use client';

import Link from 'next/link';
import { useRestaurantDashboard } from '@/context/RestaurantDashboardContext';
import { ar } from '@/lib/arStrings';
import { getDateKey, RESTAURANT_DEMO_TODAY } from '@/lib/restaurantConfig';
import { UserRole } from '@eventaat/shared';
import { RowActionMenu } from '@/components/ui/RowActionMenu';
import styles from './restaurant.module.css';

const statusLabel = ar.branchStatus;

export function BranchCardList() {
  const { branches, getMergedReservations, getMergedTables, branchUi, setBranchStatus, role, pushToast } =
    useRestaurantDashboard();
  const res = getMergedReservations();
  const tabs = getMergedTables();
  const can = role !== UserRole.restaurant_host;

  const resToday = res.filter((r) => getDateKey(r.scheduledAt) === RESTAURANT_DEMO_TODAY);
  const openCount = branches.filter((b) => (branchUi[b.id] ?? { status: 'open' as const }).status === 'open')
    .length;
  const totalResToday = resToday.length;
  const totalTables = tabs.length;

  return (
    <>
      <div className={styles.branchSummaryStrip} role="region" aria-label="ملخص الفروع">
        <div className={styles.branchKpi}>
          <div className={styles.branchKpiValue}>{branches.length}</div>
          <div className={styles.branchKpiLabel}>{ar.branches.summaryBranchCount}</div>
        </div>
        <div className={styles.branchKpi}>
          <div className={styles.branchKpiValue}>{openCount}</div>
          <div className={styles.branchKpiLabel}>{ar.branches.summaryOpenBranches}</div>
        </div>
        <div className={styles.branchKpi}>
          <div className={styles.branchKpiValue}>{totalResToday}</div>
          <div className={styles.branchKpiLabel}>{ar.branches.summaryTodayRes}</div>
        </div>
        <div className={styles.branchKpi}>
          <div className={styles.branchKpiValue}>{totalTables}</div>
          <div className={styles.branchKpiLabel}>{ar.branches.summaryTableCount}</div>
        </div>
      </div>

      <div className={styles.sGrid}>
        {branches.map((b) => {
          const ui = branchUi[b.id] ?? { status: 'open' as const };
          const resBranchToday = resToday.filter((r) => r.branchId === b.id);
          const tcount = tabs.filter((t) => t.branchId === b.id).length;
          return (
            <div key={b.id} className={styles.bCard}>
              <h3 style={{ margin: '0 0 0.2rem' }}>{b.name}</h3>
              <p className={styles.muted} style={{ margin: '0 0 0.2rem' }}>
                {b.area} — {b.address}
              </p>
              <div className={styles.branchMetaRow}>
                <span>
                  {ar.reservation.status}:{' '}
                  <strong>
                    {ui.status === 'open' && statusLabel.open}
                    {ui.status === 'closed' && statusLabel.closed}
                    {ui.status === 'temp_closed' && statusLabel.temp_closed}
                    {ui.status === 'bookings_off' && statusLabel.bookings_off}
                  </strong>
                </span>
                <span>
                  {ar.branches.resCount}: {resBranchToday.length}
                </span>
                <span>
                  {ar.branches.tableCount}: {tcount}
                </span>
              </div>
              <p className={styles.muted} style={{ fontSize: '0.78rem', margin: '0 0 0.5rem' }}>
                {ar.branches.hoursLabel}: {b.defaultHoursAr ?? '—'}
              </p>
              <p className={styles.muted} style={{ fontSize: '0.75rem', margin: '0 0 0.4rem' }}>
                {ar.branches.phone}: {ar.branches.phoneLater}
              </p>
              <div className={styles.btnRow} style={{ marginTop: 6 }}>
                <Link className={`${styles.btn} ${styles.btnPrimary}`} href="/restaurant/reservations">
                  {ar.branches.viewRes}
                </Link>
                <Link className={styles.btn} href="/restaurant/tables">
                  {ar.branches.viewTables}
                </Link>
                {can && (
                  <RowActionMenu
                    label={ar.branches.rowActions}
                    items={[
                      {
                        id: 'tc',
                        label: ar.branches.tempClose,
                        onSelect: () => {
                          setBranchStatus(b.id, 'temp_closed');
                          pushToast(ar.common.confirmProto);
                        },
                      },
                      {
                        id: 'en',
                        label: ar.branches.enableBook,
                        onSelect: () => {
                          setBranchStatus(b.id, 'open');
                          pushToast(ar.common.confirmProto);
                        },
                      },
                    ]}
                  />
                )}
              </div>
              {!can && <p className={styles.muted} style={{ marginTop: 6 }}>تعديل حالة الفرع: لمدير/مالك (عيّنة)</p>}
            </div>
          );
        })}
      </div>
    </>
  );
}
