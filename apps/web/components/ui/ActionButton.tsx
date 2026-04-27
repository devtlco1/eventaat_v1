import type { ButtonHTMLAttributes, ReactNode } from 'react';
import ds from './ds.module.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const map: Record<Variant, string> = {
  primary: ds.primary,
  secondary: ds.secondary,
  ghost: ds.ghost,
  danger: ds.danger,
};

type Props = {
  children: ReactNode;
  variant?: Variant;
  sm?: boolean;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function ActionButton({
  children,
  variant = 'secondary',
  sm = false,
  className = '',
  type = 'button',
  ...rest
}: Props) {
  const c = [sm ? ds.btnSm : ds.btn, map[variant], className].filter(Boolean).join(' ');
  return (
    <button className={c} type={type} {...rest}>
      {children}
    </button>
  );
}

export function actionButtonClass(variant: Variant = 'secondary', sm = false) {
  return [sm ? ds.btnSm : ds.btn, map[variant]].filter(Boolean).join(' ');
}
