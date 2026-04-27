import type { ReactNode } from 'react';
import Link from 'next/link';
import dash from './dash.module.css';

type Props = {
  title: string;
  sub?: string;
  onClick?: () => void;
  href?: string;
};

export function QuickActionCard({ title, sub, onClick, href }: Props) {
  const inner: ReactNode = (
    <>
      <span className={dash.quickT}>{title}</span>
      {sub && <p className={dash.quickP}>{sub}</p>}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={dash.quick} prefetch={false}>
        {inner}
      </Link>
    );
  }
  return (
    <button className={dash.quick} onClick={onClick} type="button">
      {inner}
    </button>
  );
}
