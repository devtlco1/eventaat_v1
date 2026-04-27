import { mockReservations, RESERVATION_STATUS_LABELS_AR, mockUsers } from '@eventaat/shared';
import { PlaceholderCard } from '@/components/PlaceholderCard';
import listStyles from '@/components/PlaceholderCard.module.css';

export default function CallCenterReservationsPage() {
  return (
    <div>
      <PlaceholderCard title="متابعة حجوزات (لائحة)">
        <p className={listStyles.muted}>
          يربط الكول سنتر بالمخطط: Pending طويل، مكالمة متابعة… (Phase 1A بيانات ثابتة).
        </p>
        <ul className={listStyles.listPlain}>
          {mockReservations.slice(0, 6).map((r) => {
            const u = mockUsers.find((x) => x.id === r.customerId);
            return (
              <li key={r.id}>
                {r.id} — {RESERVATION_STATUS_LABELS_AR[r.status]} — {u?.displayName}
              </li>
            );
          })}
        </ul>
      </PlaceholderCard>
    </div>
  );
}
