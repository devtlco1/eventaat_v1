import type { ReactNode } from 'react';
import dash from './dash.module.css';

type Props = {
  children: ReactNode;
  wrapClassName?: string;
};

export function DataTableFrame({ children, wrapClassName }: Props) {
  return <div className={`${dash.tableWrap} ${wrapClassName ?? ''}`}>{children}</div>;
}

export function dataTableCl() {
  return dash.dataTable;
}

export { dash };
