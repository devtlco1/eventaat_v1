'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { ActionButton } from './ActionButton';
import ds from './ds.module.css';

type Props = {
  open: boolean;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
  tone?: 'danger' | 'primary';
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'رجوع',
  onConfirm,
  onClose,
  tone = 'primary',
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onK = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onK);
    return () => window.removeEventListener('keydown', onK);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className={ds.dialogBackdrop} role="alertdialog" aria-modal="true" aria-label={title}>
      <div className={ds.dialog} dir="rtl">
        <h2 className={ds.dialogH}>{title}</h2>
        <div className={ds.muted}>{message}</div>
        <div className={ds.dialogActions}>
          <ActionButton type="button" variant="secondary" onClick={onClose}>
            {cancelText}
          </ActionButton>
          <ActionButton
            type="button"
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
