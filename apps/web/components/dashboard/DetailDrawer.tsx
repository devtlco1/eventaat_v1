'use client';

import { useEffect, type ReactNode } from 'react';
import dash from './dash.module.css';

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function DetailDrawer({ open, title, onClose, children, footer }: Props) {
  useEffect(() => {
    if (!open) return;
    const b = document.body;
    b.style.overflow = 'hidden';
    return () => {
      b.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className={dash.drawerScrim} role="presentation" onClick={onClose} dir="rtl">
      <aside
        className={dash.drawer}
        onClick={(e) => e.stopPropagation()}
        aria-label={title}
        role="dialog"
        dir="rtl"
        aria-modal="true"
      >
        <div className={dash.drawerTop}>
          <h2 className={dash.drawerTitle} id="drawer-title">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={dash.closeBtn}
            aria-label="إغلاق"
            title="إغلاق"
          >
            ×
          </button>
        </div>
        <div className={dash.drawerBody} aria-labelledby="drawer-title">
          {children}
        </div>
        {footer && (
          <div style={{ borderTop: '1px solid #e2e8f0', padding: '0.5rem 1rem' }}>{footer}</div>
        )}
      </aside>
    </div>
  );
}

export function DlItem({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className={dash.dlRow}>
      <span className={dash.dt}>{k}</span>
      <span className={dash.dd}>{v}</span>
    </div>
  );
}
