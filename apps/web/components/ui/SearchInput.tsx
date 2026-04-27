'use client';

import ds from './ds.module.css';

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  ariaLabel: string;
};

export function SearchInput({ value, onChange, placeholder, ariaLabel }: Props) {
  return (
    <div className={ds.searchWrap}>
      <input
        className={`${ds.input} ${ds.searchInput}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
    </div>
  );
}
