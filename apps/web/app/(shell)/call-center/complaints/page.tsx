import { mockComplaints, COMPLAINT_STATUS_LABELS_AR, mockReservations } from '@eventaat/shared';
import { PlaceholderCard } from '@/components/PlaceholderCard';
import listStyles from '@/components/PlaceholderCard.module.css';

export default function CallCenterComplaintsPage() {
  return (
    <div>
      <PlaceholderCard title="شكاوى (معلومات ارتباط)">
        <ul className={listStyles.listPlain}>
          {mockComplaints.map((c) => {
            const res = c.reservationId
              ? mockReservations.find((r) => r.id === c.reservationId)
              : null;
            return (
              <li key={c.id}>
                {c.subject} — {COMPLAINT_STATUS_LABELS_AR[c.status]}{' '}
                {res ? `(حجز: ${res.id})` : ''}
              </li>
            );
          })}
        </ul>
      </PlaceholderCard>
    </div>
  );
}
