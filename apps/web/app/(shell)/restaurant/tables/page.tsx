import { mockTables, TABLE_STATUS_LABELS_AR } from '@eventaat/shared';
import { PlaceholderCard } from '@/components/PlaceholderCard';
import listStyles from '@/components/PlaceholderCard.module.css';

export default function RestaurantTablesPage() {
  return (
    <div>
      <PlaceholderCard title="الطاولات">
        <p className={listStyles.muted}>
          تغطية الحالات: متاحة، محجوزة، مشغولة، خارج الخدمة، بانتظار/تنظيف، محجوبة.
        </p>
        <ul className={listStyles.listPlain}>
          {mockTables.map((t) => (
            <li key={t.id}>
              {t.label} — {t.capacity} أشخاص — {TABLE_STATUS_LABELS_AR[t.status]}
            </li>
          ))}
        </ul>
      </PlaceholderCard>
    </div>
  );
}
