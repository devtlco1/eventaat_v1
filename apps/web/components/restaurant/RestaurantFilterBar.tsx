'use client';

import { ar } from '@/lib/arStrings';
import type { Branch } from '@eventaat/shared';
import { RESERVATION_STATUS_LABELS_AR, type ReservationStatus } from '@eventaat/shared';
import styles from './restaurant.module.css';

const STATUSES = Object.keys(RESERVATION_STATUS_LABELS_AR) as ReservationStatus[];

export function RestaurantFilterBar({
  date,
  setDate,
  status,
  setStatus,
  branch,
  setBranch,
  party,
  setParty,
  search,
  setSearch,
  branches,
}: {
  date: string;
  setDate: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  branch: string;
  setBranch: (v: string) => void;
  party: string;
  setParty: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
  branches: Branch[];
}) {
  return (
    <div className={styles.filters}>
      <div className={styles.filterField}>
        <label htmlFor="f-d">{ar.reservation.filterDate}</label>
        <input id="f-d" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className={styles.filterField}>
        <label htmlFor="f-s">{ar.reservation.filterStatus}</label>
        <select id="f-s" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">{ar.common.all}</option>
          {STATUSES.map((k) => (
            <option key={k} value={k}>
              {RESERVATION_STATUS_LABELS_AR[k]}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.filterField}>
        <label htmlFor="f-b">{ar.reservation.filterBranch}</label>
        <select id="f-b" value={branch} onChange={(e) => setBranch(e.target.value)}>
          <option value="">{ar.common.all}</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.filterField}>
        <label htmlFor="f-p">{ar.reservation.filterParty}</label>
        <input
          id="f-p"
          type="number"
          min={1}
          placeholder="—"
          value={party}
          onChange={(e) => setParty(e.target.value)}
        />
      </div>
      <div className={styles.filterField} style={{ flex: 1, minWidth: 200 }}>
        <label htmlFor="f-q">{ar.reservation.filterSearch}</label>
        <input
          id="f-q"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="مثال: ليلى أو رقم"
        />
      </div>
    </div>
  );
}
