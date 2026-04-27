import type { ReactNode } from 'react';
import dash from './dash.module.css';

type Level = 'watch' | 'warn' | 'neutral';

export function AlertCard({
  title,
  children,
  level = 'neutral',
}: {
  title: string;
  children: ReactNode;
  level?: Level;
}) {
  const cls = level === 'watch' ? dash.alertWatch : level === 'warn' ? dash.alertWarn : '';
  return (
    <div
      className={`${dash.alert} ${cls}`.trim()}
      role="status"
    >
      <div>
        <div className={dash.alertTitle}>{title}</div>
        <p className={dash.alertBody}>{children}</p>
      </div>
    </div>
  );
}
