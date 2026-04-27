import { mockReservations, RESERVATION_STATUS_LABELS_AR } from '@eventaat/shared';
import { PlaceholderCard } from '@/components/PlaceholderCard';
import listStyles from '@/components/PlaceholderCard.module.css';

export default function AdminReservationsPage() {
  return (
    <div>
      <PlaceholderCard title="تدقيق الحجوزات (عينة)">
        <ul className={listStyles.listPlain}>
          {mockReservations.slice(0, 8).map((r) => (
            <li key={r.id}>
              {r.id} — {RESERVATION_STATUS_LABELS_AR[r.status]}
            </li>
          ))}
        </ul>
      </PlaceholderCard>
    </div>
  );
}
