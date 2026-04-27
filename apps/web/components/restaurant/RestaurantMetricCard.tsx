import styles from './restaurant.module.css';

export function RestaurantMetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={styles.metric}>
      <div className={styles.metricValue}>{value}</div>
      <div className={styles.metricLabel}>{label}</div>
    </div>
  );
}
