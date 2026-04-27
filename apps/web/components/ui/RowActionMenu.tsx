'use client';

import { useId, useLayoutEffect, useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import ds from './ds.module.css';

export type RowMenuItem = { id: string; label: string; onSelect: () => void };

type Props = {
  label?: string;
  items: RowMenuItem[];
  align?: 'start' | 'end';
};

/**
 * Compact row actions. Menu is portaled to `document.body` for correct z-index and overflow.
 */
export function RowActionMenu({ label = 'المزيد', items, align = 'end' }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, minW: 168 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnId = useId();

  const updatePos = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const minW = Math.max(168, rect.width);
    const gap = 4;
    const estH = Math.min(320, items.length * 40 + 16);
    const below = rect.bottom + gap;
    const above = rect.top - gap;
    const useAbove = below + estH > window.innerHeight - 8 && above - estH > 8;
    const top = useAbove ? Math.max(8, rect.top - estH - gap) : below;
    const rawLeft = align === 'end' ? rect.right - minW : rect.left;
    const left = Math.max(8, Math.min(rawLeft, window.innerWidth - minW - 8));
    setPos({ top, left, minW });
  }, [align, items.length]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePos();
  }, [open, updatePos]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => updatePos();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open, updatePos]);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => setOpen(false);
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [open]);

  const closeListeners = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      const onDoc = (e: Event) => {
        const t = e.target;
        if (!(t instanceof Node)) return;
        if (triggerRef.current?.contains(t)) return;
        if (menuRef.current?.contains(t)) return;
        setOpen(false);
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
      };
      document.addEventListener('mousedown', onDoc, true);
      document.addEventListener('keydown', onKey, true);
      closeListeners.current = () => {
        document.removeEventListener('mousedown', onDoc, true);
        document.removeEventListener('keydown', onKey, true);
        closeListeners.current = null;
      };
    }, 0);
    return () => {
      window.clearTimeout(t);
      closeListeners.current?.();
    };
  }, [open]);

  if (items.length === 0) return null;

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          id={btnId + '-menu'}
          className={ds.rowMenuPop}
          style={{
            top: pos.top,
            left: pos.left,
            minWidth: pos.minW,
            zIndex: 10_050,
            position: 'fixed',
          }}
          role="menu"
          dir="rtl"
          aria-label="إجراءات إضافية"
        >
          {items.map((it) => (
            <button
              key={it.id}
              type="button"
              className={ds.rowMenuItem}
              role="menuitem"
              onClick={() => {
                it.onSelect();
                setOpen(false);
              }}
            >
              {it.label}
            </button>
          ))}
        </div>,
        document.body,
      )
    : null;

  return (
    <div className={ds.rowMenu} dir="rtl">
      <button
        type="button"
        ref={triggerRef}
        id={btnId}
        className={ds.rowMenuTrigger}
        onClick={() => {
          setOpen((o) => {
            if (!o) {
              return true;
            }
            return false;
          });
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? btnId + '-menu' : undefined}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
      >
        {label}
      </button>
      {menu}
    </div>
  );
}
