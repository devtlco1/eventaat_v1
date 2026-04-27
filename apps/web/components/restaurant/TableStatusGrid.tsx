'use client';

import { useMemo, useState } from 'react';
import { TABLE_STATUS_LABELS_AR, TableStatus, type TableStatus as TS, UserRole } from '@eventaat/shared';
import { ar } from '@/lib/arStrings';
import { getTableSeatingStyle, type SeatingStyleFilter, seatingLabel } from '@/lib/tableUi';
import { useRestaurantDashboard } from '@/context/RestaurantDashboardContext';
import { TableStatusBadge } from './TableStatusBadge';
import styles from './restaurant.module.css';

const ALL: TS[] = [
  TableStatus.available,
  TableStatus.reserved,
  TableStatus.occupied,
  TableStatus.waiting_cleaning,
  TableStatus.cleaning,
  TableStatus.blocked,
  TableStatus.out_of_service,
];

export function TableStatusGrid() {
  const { branches, getMergedTables, role, patchTable, pushToast } = useRestaurantDashboard();
  const tables = getMergedTables();
  const [bId, setBId] = useState('');
  const [st, setSt] = useState('');
  const [seat, setSeat] = useState<SeatingStyleFilter>('all');
  const [cap, setCap] = useState('');

  const canOps = role !== UserRole.restaurant_host;

  const summary = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of ALL) m[t] = 0;
    for (const t of tables) {
      m[t.status] = (m[t.status] ?? 0) + 1;
    }
    return m;
  }, [tables]);

  const filtered = useMemo(() => {
    return tables.filter((t) => {
      if (bId && t.branchId !== bId) return false;
      if (st && t.status !== st) return false;
      if (seat !== 'all' && getTableSeatingStyle(t) !== seat) return false;
      if (cap) {
        const n = parseInt(cap, 10);
        if (!Number.isNaN(n) && t.capacity < n) return false;
      }
      return true;
    });
  }, [tables, bId, st, seat, cap]);

  return (
    <div>
      <div className={styles.tableSummary}>
        {ALL.map((k) => (
          <span key={k}>
            {TABLE_STATUS_LABELS_AR[k]}: {summary[k] ?? 0}
          </span>
        ))}
      </div>
      <div className={styles.filters}>
        <div className={styles.filterField}>
          <label htmlFor="t-b">{ar.reservation.filterBranch}</label>
          <select id="t-b" value={bId} onChange={(e) => setBId(e.target.value)}>
            <option value="">{ar.common.all}</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterField}>
          <label htmlFor="t-s">{ar.reservation.filterStatus}</label>
          <select id="t-s" value={st} onChange={(e) => setSt(e.target.value)}>
            <option value="">{ar.common.all}</option>
            {ALL.map((k) => (
              <option key={k} value={k}>
                {TABLE_STATUS_LABELS_AR[k]}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterField}>
          <label htmlFor="t-se">نوع الجلسة (من العيّنة)</label>
          <select id="t-se" value={seat} onChange={(e) => setSeat(e.target.value as SeatingStyleFilter)}>
            <option value="all">{ar.common.all}</option>
            <option value="indoor">داخلي</option>
            <option value="outdoor">خارجي</option>
            <option value="family">عائلي</option>
          </select>
        </div>
        <div className={styles.filterField}>
          <label htmlFor="t-c">{ar.tables.capacity}</label>
          <input id="t-c" type="number" min={1} value={cap} onChange={(e) => setCap(e.target.value)} placeholder="≥" />
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className={styles.empty}>{ar.common.empty}</p>
      ) : (
        <div className={styles.bGrid}>
          {filtered.map((t) => {
            const b = branches.find((x) => x.id === t.branchId);
            return (
              <div key={t.id} className={styles.tCard}>
                <div className={styles.tCardRow}>
                  <strong>{t.label}</strong>
                  <TableStatusBadge status={t.status} />
                </div>
                <div className={styles.tCardRow}>
                  <span className={styles.muted}>{b?.name}</span>
                  <span>سعة: {t.capacity}</span>
                </div>
                <div className={styles.muted} style={{ marginTop: 6 }}>
                  {ar.tables.zone}: {seatingLabel(t)}
                </div>
                {canOps && (
                  <div className={styles.btnRow} style={{ marginTop: 10 }}>
                    <button
                      type="button"
                      className={styles.btn}
                      onClick={() => {
                        patchTable(t.id, { status: TableStatus.blocked });
                        pushToast(ar.common.confirmProto);
                      }}
                    >
                      {ar.tables.block}
                    </button>
                    <button
                      type="button"
                      className={styles.btn}
                      onClick={() => {
                        patchTable(t.id, { status: TableStatus.available });
                        pushToast(ar.common.confirmProto);
                      }}
                    >
                      {ar.tables.unblock}
                    </button>
                    <button
                      type="button"
                      className={styles.btn}
                      onClick={() => {
                        patchTable(t.id, { status: TableStatus.out_of_service });
                        pushToast(ar.common.confirmProto);
                      }}
                    >
                      {ar.tables.outOfService}
                    </button>
                    <button
                      type="button"
                      className={styles.btn}
                      onClick={() => {
                        patchTable(t.id, { status: TableStatus.cleaning });
                        pushToast(ar.common.confirmProto);
                      }}
                    >
                      {ar.tables.clean}
                    </button>
                  </div>
                )}
                {!canOps && (
                  <p className={styles.muted} style={{ marginTop: 8 }}>
                    الإجراءات المؤثّرة تظهر لأدوار أعلى (عينة).
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
