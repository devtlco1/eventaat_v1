'use client';

import Link from 'next/link';
import { useRestaurantDashboard } from '@/context/RestaurantDashboardContext';
import { ar } from '@/lib/arStrings';
import { getDateKey, RESTAURANT_DEMO_TODAY } from '@/lib/restaurantConfig';
import { UserRole } from '@eventaat/shared';
import styles from './restaurant.module.css';

const statusLabel = ar.branchStatus;

export function BranchCardList() {
  const { branches, getMergedReservations, getMergedTables, branchUi, setBranchStatus, role, pushToast } =
    useRestaurantDashboard();
  const res = getMergedReservations();
  const tabs = getMergedTables();
  const can = role !== UserRole.restaurant_host;

  return (
    <div className={styles.sGrid}>
      {branches.map((b) => {
        const ui = branchUi[b.id] ?? { status: 'open' as const };
        const resToday = res.filter((r) => r.branchId === b.id && getDateKey(r.scheduledAt) === RESTAURANT_DEMO_TODAY);
        const tcount = tabs.filter((t) => t.branchId === b.id).length;
        return (
          <div key={b.id} className={styles.bCard}>
            <h3 style={{ margin: '0 0 0.3rem' }}>{b.name}</h3>
            <p className={styles.muted} style={{ margin: '0 0 0.2rem' }}>
              {b.area} — {b.address}
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              الحالة:{' '}
              <strong>
                {ui.status === 'open' && statusLabel.open}
                {ui.status === 'closed' && statusLabel.closed}
                {ui.status === 'temp_closed' && statusLabel.temp_closed}
                {ui.status === 'bookings_off' && statusLabel.bookings_off}
              </strong>
            </p>
            <p>
              {ar.branches.resCount}: {resToday.length}
            </p>
            <p>
              {ar.branches.tableCount}: {tcount}
            </p>
            <p className={styles.muted} style={{ fontSize: '0.75rem' }}>
              {ar.branches.phone}: {ar.branches.phoneLater}
            </p>
            <div className={styles.btnRow} style={{ marginTop: 10 }}>
              <Link className={styles.btn} href="/restaurant/reservations">
                {ar.branches.viewRes}
              </Link>
              <Link className={styles.btn} href="/restaurant/tables">
                {ar.branches.viewTables}
              </Link>
              {can && (
                <>
                  <button
                    type="button"
                    className={styles.btn}
                    onClick={() => {
                      setBranchStatus(b.id, 'temp_closed');
                      pushToast(ar.common.confirmProto);
                    }}
                  >
                    {ar.branches.tempClose}
                  </button>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={() => {
                      setBranchStatus(b.id, 'open');
                      pushToast(ar.common.confirmProto);
                    }}
                  >
                    {ar.branches.enableBook}
                  </button>
                </>
              )}
            </div>
            {!can && <p className={styles.muted} style={{ marginTop: 6 }}>إغلاق/تفعيل: لمدير/مالك (عيّنة)</p>}
          </div>
        );
      })}
    </div>
  );
}
