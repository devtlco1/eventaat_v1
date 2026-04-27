'use client';

import { ar } from '@/lib/arStrings';
import { TableStatusGrid } from '@/components/restaurant/TableStatusGrid';
import { PageHeader } from '@/components/ui/PageHeader';
import styles from '@/components/restaurant/restaurant.module.css';

export default function RestaurantTablesPage() {
  return (
    <div className={styles.page}>
      <PageHeader title={ar.tables.title} subtitle={ar.shell.modelNote} />
      <TableStatusGrid />
    </div>
  );
}
