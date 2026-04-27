import { mockReservations, mockRestaurants, mockTables, RESTAURANT_STATUS_LABELS_AR } from '@eventaat/shared';
import { PlaceholderCard } from '@/components/PlaceholderCard';
import listStyles from '@/components/PlaceholderCard.module.css';

export default function RestaurantHomePage() {
  const r = mockRestaurants.find((x) => x.id === 'r_visible')!;
  return (
    <div>
      <PlaceholderCard title="لوحة المطعم (placeholder)">
        <p>عرض مثال: {r.name}</p>
        <p className={listStyles.muted}>
          الحالة: {RESTAURANT_STATUS_LABELS_AR[r.status]} — منطقة {r.area}، {r.city}.
        </p>
        <ul className={listStyles.stats} style={{ marginTop: '0.75rem' }}>
          <li className={listStyles.pill}>
            حجوزات (فرع): {mockReservations.filter((x) => x.restaurantId === r.id).length}
          </li>
          <li className={listStyles.pill}>طاولات: {mockTables.length}</li>
        </ul>
      </PlaceholderCard>
    </div>
  );
}
