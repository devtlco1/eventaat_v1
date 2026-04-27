'use client';

import { ar } from '@/lib/arStrings';
import { BranchCardList } from '@/components/restaurant/BranchCardList';
import styles from '@/components/restaurant/restaurant.module.css';

export default function RestaurantBranchesPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>{ar.branches.title}</h1>
      <p className={styles.sub}>{ar.shell.modelNote}</p>
      <BranchCardList />
    </div>
  );
}
