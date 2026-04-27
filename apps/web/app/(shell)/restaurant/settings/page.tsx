'use client';

import { ar } from '@/lib/arStrings';
import { OperationalSettingsForm } from '@/components/restaurant/OperationalSettingsForm';
import styles from '@/components/restaurant/restaurant.module.css';

export default function RestaurantSettingsPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>{ar.settings.title}</h1>
      <p className={styles.sub}>{ar.shell.modelNote}</p>
      <OperationalSettingsForm />
    </div>
  );
}
