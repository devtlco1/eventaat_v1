import type { ReactNode } from 'react';
import ds from './ds.module.css';

type Props = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
  badge?: string;
};

export function PageHeader({ title, subtitle, eyebrow, actions, badge }: Props) {
  return (
    <header className={ds.pageHeader}>
      <div className={ds.titleBlock}>
        {eyebrow && <p className={ds.eyebrow}>{eyebrow}</p>}
        <h1 className={ds.h1}>
          {title}
          {badge && <span className={ds.badge}> {badge}</span>}
        </h1>
        {subtitle && <p className={ds.sub}>{subtitle}</p>}
      </div>
      {actions && <div className={ds.actions}>{actions}</div>}
    </header>
  );
}
