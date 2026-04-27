'use client';

import { useCallback, useMemo, useState } from 'react';
import { ReservationStatus } from '@eventaat/shared';
import { ar } from '@/lib/arStrings';
import { timeLabel, isLateReservation, isNoShowCandidate } from '@/lib/reservationMetrics';
import { rejectReasonLabel } from '@/lib/arStrings';
import { availableActionsForReservation, type ActionKey } from '@/lib/reservationActions';
import { useRestaurantDashboard } from '@/context/RestaurantDashboardContext';
import { ReservationStatusBadge } from './ReservationStatusBadge';
import { ReservationDetailsPanel } from './ReservationDetailsPanel';
import { RejectReservationDialog } from './RejectReservationDialog';
import { ProposeTimeDialog } from './ProposeTimeDialog';
import { RestaurantFilterBar } from './RestaurantFilterBar';
import type { Reservation, Branch } from '@eventaat/shared';
import styles from './restaurant.module.css';

const actionLabel: Record<ActionKey, string> = {
  accept: ar.actions.accept,
  reject: ar.actions.reject,
  propose: ar.actions.proposeOther,
  arrival: ar.actions.recordArrival,
  cancel: ar.actions.cancel,
  seat: ar.actions.recordSeated,
  complete: ar.actions.complete,
  noShow: ar.actions.recordNoShow,
  details: ar.actions.viewDetails,
};

function filterRows(
  rows: Reservation[],
  f: { date: string; status: string; branch: string; party: string; search: string },
  branches: Branch[],
  getName: (cid: string) => string,
) {
  return rows.filter((r) => {
    if (f.status && r.status !== f.status) return false;
    if (f.branch && r.branchId !== f.branch) return false;
    if (f.party) {
      const n = parseInt(f.party, 10);
      if (!Number.isNaN(n) && r.partySize !== n) return false;
    }
    if (f.date) {
      if (r.scheduledAt.slice(0, 10) !== f.date) return false;
    }
    if (f.search.trim()) {
      const q = f.search.trim().toLowerCase();
      const name = getName(r.customerId).toLowerCase();
      if (!r.refCode.toLowerCase().includes(q) && !name.includes(q) && !r.id.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });
}

export function RestaurantReservationTable() {
  const { branches, getMergedReservations, usersById, patchReservation, pushToast } = useRestaurantDashboard();
  const rows = getMergedReservations();
  const getName = useCallback(
    (cid: string) => usersById.get(cid)?.displayName ?? cid,
    [usersById],
  );
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');
  const [branch, setBranch] = useState('');
  const [party, setParty] = useState('');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<Reservation | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [proposeId, setProposeId] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterRows(rows, { date, status, branch, party, search }, branches, getName),
    [rows, date, status, branch, party, search, branches, getName],
  );

  const doAction = (r: Reservation, a: ActionKey) => {
    if (a === 'details') {
      setDetail(r);
      return;
    }
    if (a === 'reject') {
      setRejectId(r.id);
      return;
    }
    if (a === 'propose') {
      setProposeId(r.id);
      return;
    }
    const id = r.id;
    if (a === 'accept') {
      patchReservation(id, { status: ReservationStatus.approved, note: (r.note ?? '') + ' · قبول من اللوحة' });
    }
    if (a === 'arrival') {
      patchReservation(id, { status: ReservationStatus.arrived, note: (r.note ?? '') + ' · وصول' });
    }
    if (a === 'cancel') {
      patchReservation(id, {
        status: ReservationStatus.cancelled_by_restaurant,
        note: (r.note ?? '') + ' · إلغاء من المطعم (عرضي)',
      });
    }
    if (a === 'seat') {
      patchReservation(id, { status: ReservationStatus.seated });
    }
    if (a === 'complete') {
      patchReservation(id, { status: ReservationStatus.completed });
    }
    if (a === 'noShow') {
      patchReservation(id, {
        status: ReservationStatus.no_show,
        note: (r.note ?? '') + ' · تسجيل عدم حضور (واجهة)',
      });
    }
    pushToast(`${ar.common.confirmProto} (${actionLabel[a]})`);
  };

  const onReject = (reasonKey: string) => {
    if (!rejectId) return;
    patchReservation(rejectId, {
      status: ReservationStatus.rejected,
      note: (rows.find((x) => x.id === rejectId)?.note ?? '') + ' · ' + rejectReasonLabel(reasonKey),
    });
    setRejectId(null);
    pushToast(ar.common.confirmProto);
  };

  const onPropose = (iso: string, note: string) => {
    if (!proposeId) return;
    patchReservation(proposeId, {
      status: ReservationStatus.alternative_proposed,
      scheduledAt: iso,
      note: (note || 'اقتراح وقت') + ' — ' + (rows.find((x) => x.id === proposeId)?.note ?? ''),
    });
    setProposeId(null);
    pushToast(ar.common.confirmProto);
  };

  return (
    <>
      <RestaurantFilterBar
        date={date}
        setDate={setDate}
        status={status}
        setStatus={setStatus}
        branch={branch}
        setBranch={setBranch}
        party={party}
        setParty={setParty}
        search={search}
        setSearch={setSearch}
        branches={branches}
      />
      {filtered.length === 0 ? (
        <p className={styles.empty}>{ar.common.empty}</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>{ar.reservation.ref}</th>
                <th>{ar.reservation.customer}</th>
                <th>{ar.reservation.time}</th>
                <th>{ar.reservation.party}</th>
                <th>{ar.reservation.branch}</th>
                <th>{ar.reservation.status}</th>
                <th>{ar.reservation.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filtered
                .slice()
                .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
                .map((r) => {
                  const br = branches.find((x) => x.id === r.branchId);
                  const showLate = isLateReservation(r) || isNoShowCandidate(r);
                  const acts = availableActionsForReservation(r);
                  return (
                    <tr key={r.id}>
                      <td>{r.refCode}</td>
                      <td>
                        {showLate && <span className={styles.latePill}>{ar.late.badge}</span>}
                        {getName(r.customerId)}
                      </td>
                      <td>{timeLabel(r.scheduledAt)}</td>
                      <td>{r.partySize}</td>
                      <td>{br?.name ?? r.branchId}</td>
                      <td>
                        <ReservationStatusBadge status={r.status} />
                      </td>
                      <td>
                        <div className={styles.btnRow}>
                          {acts.map((a) => (
                            <button
                              key={a + r.id}
                              type="button"
                              className={a === 'details' ? `${styles.btn} ${styles.btnGhost}` : styles.btn}
                              onClick={() => doAction(r, a)}
                            >
                              {actionLabel[a]}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
      {detail && (
        <ReservationDetailsPanel
          r={detail}
          onClose={() => setDetail(null)}
          branches={branches.map((b) => ({ id: b.id, name: b.name }))}
        />
      )}
      {rejectId && (
        <RejectReservationDialog onClose={() => setRejectId(null)} onConfirm={onReject} />
      )}
      {proposeId && (
        <ProposeTimeDialog onClose={() => setProposeId(null)} onConfirm={onPropose} />
      )}
    </>
  );
}
