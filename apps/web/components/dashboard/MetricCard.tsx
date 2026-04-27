import type { ReactNode } from 'react';
import dash from './dash.module.css';

type Props = {
  label: string;
  value: ReactNode;
  hint?: string;
};

export function MetricCard({ label, value, hint }: Props) {
  return (
    <div className={dash.metric}>
      <p className={dash.metricValue}>{value}</p>
      <p className={dash.metricLabel}>{label}</p>
      {hint && <p className={dash.metricHint}>{hint}</p>}
    </div>
  );
}

export function MetricGrid({ children }: { children: ReactNode }) {
  return <div className={dash.grid}>{children}</div>;
}
