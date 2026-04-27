import { mockRestaurants, mockSubscriptions, SUBSCRIPTION_STATUS_LABELS_AR } from '@eventaat/shared';
import { PlaceholderCard } from '@/components/PlaceholderCard';
import listStyles from '@/components/PlaceholderCard.module.css';

export default function AdminSubscriptionsPage() {
  return (
    <div>
      <PlaceholderCard title="اشتراكات (نموذج أسبوعي)">
        <ul className={listStyles.listPlain}>
          {mockSubscriptions.map((s) => {
            const r = mockRestaurants.find((x) => x.id === s.restaurantId);
            return (
              <li key={s.id}>
                {r?.name ?? s.restaurantId} — {SUBSCRIPTION_STATUS_LABELS_AR[s.status]} — {s.monthlyAmountIqd} د.ع
                /شهر
              </li>
            );
          })}
        </ul>
      </PlaceholderCard>
    </div>
  );
}
