import type { ReactNode } from 'react';
import ds from './ds.module.css';

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className={ds.toolbar}>{children}</div>;
}

export function filterLabelCl() {
  return ds.filterLabel;
}
