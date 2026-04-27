import { mockComplaints, COMPLAINT_STATUS_LABELS_AR } from '@eventaat/shared';
import { PlaceholderCard } from '@/components/PlaceholderCard';
import listStyles from '@/components/PlaceholderCard.module.css';

export default function AdminComplaintsPage() {
  return (
    <div>
      <PlaceholderCard title="شكاوى">
        <ul className={listStyles.listPlain}>
          {mockComplaints.map((c) => (
            <li key={c.id}>
              {c.subject} — {COMPLAINT_STATUS_LABELS_AR[c.status]}
            </li>
          ))}
        </ul>
      </PlaceholderCard>
    </div>
  );
}
