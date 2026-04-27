'use client';

import { ar } from '@/lib/arStrings';
import { BranchCardList } from '@/components/restaurant/BranchCardList';
import { PageHeader } from '@/components/ui/PageHeader';
import styles from '@/components/restaurant/restaurant.module.css';

export default function RestaurantBranchesPage() {
  return (
    <div className={styles.page}>
      <PageHeader title={ar.branches.title} subtitle={ar.shell.modelNote} />
      <BranchCardList />
    </div>
  );
}
