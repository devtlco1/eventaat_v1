import { mockComplaints, mockRestaurants, mockSubscriptions } from '@eventaat/shared';
import { PlaceholderCard } from '@/components/PlaceholderCard';
import listStyles from '@/components/PlaceholderCard.module.css';

export default function AdminHomePage() {
  return (
    <div>
      <PlaceholderCard title="إدارة eventaat — ملخص">
        <ul className={listStyles.stats}>
          <li className={listStyles.pill}>مطاعم: {mockRestaurants.length}</li>
          <li className={listStyles.pill}>شكاوى: {mockComplaints.length}</li>
          <li className={listStyles.pill}>اشتراكات: {mockSubscriptions.length}</li>
        </ul>
      </PlaceholderCard>
    </div>
  );
}
