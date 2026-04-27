'use client';

import { ar } from '@/lib/arStrings';
import { RestaurantReservationTable } from '@/components/restaurant/RestaurantReservationTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageToolbar } from '@/components/ui/PageToolbar';
import styles from '@/components/restaurant/restaurant.module.css';

export default function RestaurantReservationsPage() {
  return (
    <div className={styles.page}>
      <PageHeader title={ar.reservation.listTitle} subtitle={ar.shell.modelNote} />
      <PageToolbar>
        <span className="muted" style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8' }}>نموذج: استخدم التصفية داخل الجدول</span>
      </PageToolbar>
      <RestaurantReservationTable />
    </div>
  );
}
