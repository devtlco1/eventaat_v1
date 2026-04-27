'use client';

import { useState } from 'react';
import { ar } from '@/lib/arStrings';
import styles from './restaurant.module.css';

const REASONS = [
  { id: 'r1', text: ar.reject.r1 },
  { id: 'r2', text: ar.reject.r2 },
  { id: 'r3', text: ar.reject.r3 },
  { id: 'r4', text: ar.reject.r4 },
  { id: 'r5', text: ar.reject.r5 },
  { id: 'r6', text: ar.reject.r6 },
] as const;

export function RejectReservationDialog({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (reasonKey: string) => void;
}) {
  const [sel, setSel] = useState('r1');
  return (
    <div className={styles.dialogOverlay} role="dialog" aria-modal>
      <div className={styles.dialog}>
        <h3>{ar.reject.title}</h3>
        <div className={styles.dialogField}>
          {REASONS.map((r) => (
            <label
              key={r.id}
              style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer' }}
            >
              <input
                type="radio"
                name="rej"
                value={r.id}
                checked={sel === r.id}
                onChange={() => setSel(r.id)}
              />
              {r.text}
            </label>
          ))}
        </div>
        <div className={styles.dialogActions}>
          <button type="button" className={styles.btn} onClick={onClose}>
            {ar.common.cancel}
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => onConfirm(sel)}
          >
            {ar.reject.submit}
          </button>
        </div>
      </div>
    </div>
  );
}
