'use client';

import { ar } from '@/lib/arStrings';
import { RestaurantReservationTable } from '@/components/restaurant/RestaurantReservationTable';
import styles from '@/components/restaurant/restaurant.module.css';

export default function RestaurantReservationsPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>{ar.reservation.listTitle}</h1>
      <p className={styles.sub}>{ar.shell.modelNote}</p>
      <RestaurantReservationTable />
    </div>
  );
}
