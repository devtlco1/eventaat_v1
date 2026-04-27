import type { ReactNode } from 'react';
import ds from './ds.module.css';

export function PageToolbar({ children }: { children: ReactNode }) {
  return <div className={ds.toolbar}>{children}</div>;
}
