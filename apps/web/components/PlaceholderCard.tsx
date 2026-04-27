import styles from './PlaceholderCard.module.css';

export function PlaceholderCard({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
