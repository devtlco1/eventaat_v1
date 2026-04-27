import type { ReactNode } from 'react';
import dash from './dash.module.css';

type Props = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

export function SectionCard({ title, action, children }: Props) {
  return (
    <section className={dash.section}>
      <div className={dash.sectionHead}>
        <h2 className={dash.h2}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
