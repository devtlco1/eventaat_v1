import {
  mockCallCenterTasks,
  mockComplaints,
  mockReservations,
  mockRestaurants,
  mockSubscriptions,
} from '@eventaat/shared';
import { PlaceholderCard } from '@/components/PlaceholderCard';
import listStyles from '@/components/PlaceholderCard.module.css';

export default function DashboardPage() {
  return (
    <div>
      <PlaceholderCard title="ملخص">
        <p className={listStyles.muted}>
          يعرض هذا المسار أرقاماً سريعة من <code>packages/shared</code> (وهمي — Phase 1A).
        </p>
        <ul className={listStyles.stats} style={{ marginTop: '0.75rem' }}>
          <li className={listStyles.pill}>مطاعم: {mockRestaurants.length}</li>
          <li className={listStyles.pill}>حجوزات (عينة): {mockReservations.length}</li>
          <li className={listStyles.pill}>شكاوى: {mockComplaints.length}</li>
          <li className={listStyles.pill}>اشتراكات: {mockSubscriptions.length}</li>
          <li className={listStyles.pill}>مهام كول سنتر: {mockCallCenterTasks.length}</li>
        </ul>
      </PlaceholderCard>
    </div>
  );
}
