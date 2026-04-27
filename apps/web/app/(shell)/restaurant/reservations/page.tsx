import { mockReservations, RESERVATION_STATUS_LABELS_AR, mockUsers } from '@eventaat/shared';
import { PlaceholderCard } from '@/components/PlaceholderCard';
import listStyles from '@/components/PlaceholderCard.module.css';

export default function RestaurantReservationsPage() {
  const top = mockReservations.slice(0, 5);
  return (
    <div>
      <PlaceholderCard title="حجوزات (قائمة مختصرة)">
        <p className={listStyles.muted}>نفس السجلات في @eventaat/shared — Phase 1C/1D للجداول التفصيلية.</p>
        <ul className={listStyles.listPlain}>
          {top.map((res) => {
            const c = mockUsers.find((u) => u.id === res.customerId);
            return (
              <li key={res.id}>
                {res.id} — {RESERVATION_STATUS_LABELS_AR[res.status]} — {c?.displayName ?? res.customerId}
              </li>
            );
          })}
        </ul>
      </PlaceholderCard>
    </div>
  );
}
