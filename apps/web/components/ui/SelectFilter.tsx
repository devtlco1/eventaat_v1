'use client';

import type { ReactNode } from 'react';
import ds from './ds.module.css';

type Opt = { value: string; label: string };

type Props = {
  value: string;
  onChange: (v: string) => void;
  options: Opt[];
  label: ReactNode;
  id: string;
};

export function SelectFilter({ value, onChange, options, label, id }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: '7.5rem' }}>
      <label className={ds.filterLabel} htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className={ds.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={typeof label === 'string' ? label : 'تصفية'}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
