'use client';

import { ar } from '@/lib/arStrings';
import { OperationalSettingsForm } from '@/components/restaurant/OperationalSettingsForm';
import { PageHeader } from '@/components/ui/PageHeader';
import styles from '@/components/restaurant/restaurant.module.css';

export default function RestaurantSettingsPage() {
  return (
    <div className={styles.page}>
      <PageHeader title={ar.settings.title} subtitle={ar.shell.modelNote} />
      <OperationalSettingsForm />
    </div>
  );
}
