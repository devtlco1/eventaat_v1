'use client';

import { ar } from '@/lib/arStrings';
import { TableStatusGrid } from '@/components/restaurant/TableStatusGrid';
import styles from '@/components/restaurant/restaurant.module.css';

export default function RestaurantTablesPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>{ar.tables.title}</h1>
      <p className={styles.sub}>{ar.shell.modelNote}</p>
      <TableStatusGrid />
    </div>
  );
}
