'use client';

import { useRestaurantDashboard } from '@/context/RestaurantDashboardContext';
import styles from './restaurant.module.css';

export function RestaurantToasts() {
  const { toasts, dismissToast } = useRestaurantDashboard();
  if (toasts.length === 0) return null;
  return (
    <div className={styles.toastHost} aria-live="polite">
      {toasts.map((t) => (
        <button
          type="button"
          key={t.id}
          className={styles.toast}
          onClick={() => dismissToast(t.id)}
        >
          {t.text}
        </button>
      ))}
    </div>
  );
}
