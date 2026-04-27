import type { ReactNode } from 'react';
import ds from './ds.module.css';

export function EmptyState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className={ds.empty} role="status">
      <p className={ds.muted} style={{ margin: 0 }}>
        {title}
      </p>
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </div>
  );
}
