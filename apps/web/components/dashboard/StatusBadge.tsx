import type { ReactNode } from 'react';
import dash from './dash.module.css';

type Kind = 'neutral' | 'ok' | 'warning' | 'bad';

const map: Record<Kind, string> = {
  neutral: dash.badge,
  ok: dash.badgeA,
  warning: dash.badgeW,
  bad: dash.badgeD,
};

type Props = {
  children: ReactNode;
  kind?: Kind;
};

export function StatusBadge({ children, kind = 'neutral' }: Props) {
  return <span className={map[kind]}>{children}</span>;
}

export function MutedPill({ children }: { children: ReactNode }) {
  return <span className={dash.badgeG}>{children}</span>;
}
