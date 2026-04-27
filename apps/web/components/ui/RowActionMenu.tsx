'use client';

import { useRef, useEffect } from 'react';
import ds from './ds.module.css';

export type RowMenuItem = { id: string; label: string; onSelect: () => void };

type Props = {
  label?: string;
  items: RowMenuItem[];
  align?: 'start' | 'end';
};

/**
 * Compact secondary actions: primary should stay a separate "عرض" / ActionButton in the row.
 */
export function RowActionMenu({ label = 'المزيد', items, align = 'end' }: Props) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onDoc = (e: MouseEvent) => {
      if (!d.open) return;
      if (d.contains(e.target as Node)) return;
      d.open = false;
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  if (items.length === 0) return null;
  return (
    <details ref={ref} className={ds.rowMenu} dir="rtl">
      <summary
        className={ds.rowMenuTrigger}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && ref.current) ref.current.open = false;
        }}
      >
        {label}
      </summary>
      <div
        className={align === 'end' ? ds.rowMenuListEnd : ds.rowMenuListStart}
        role="menu"
        aria-label="إجراءات إضافية"
        onClick={(e) => e.stopPropagation()}
      >
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            className={ds.rowMenuItem}
            role="menuitem"
            onClick={() => {
              it.onSelect();
              if (ref.current) ref.current.open = false;
            }}
          >
            {it.label}
          </button>
        ))}
      </div>
    </details>
  );
}
