'use client';

import { useState } from 'react';
import { ar } from '@/lib/arStrings';
import styles from './restaurant.module.css';

export function ProposeTimeDialog({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (timeIso: string, note: string) => void;
}) {
  const [time, setTime] = useState('2026-04-30T20:00');
  const [note, setNote] = useState('');
  return (
    <div className={styles.dialogOverlay} role="dialog" aria-modal>
      <div className={styles.dialog}>
        <h3>{ar.altTime.title}</h3>
        <div className={styles.dialogField}>
          <label htmlFor="alt-t">{ar.altTime.newTime}</label>
          <input
            id="alt-t"
            type="datetime-local"
            className={styles.sInput}
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        <div className={styles.dialogField}>
          <label htmlFor="alt-n">{ar.altTime.note}</label>
          <textarea
            id="alt-n"
            className={styles.sText}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
          />
        </div>
        <div className={styles.dialogActions}>
          <button type="button" className={styles.btn} onClick={onClose}>
            {ar.common.cancel}
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => onConfirm(new Date(time).toISOString(), note)}
          >
            {ar.altTime.submit}
          </button>
        </div>
      </div>
    </div>
  );
}
