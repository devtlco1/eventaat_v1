import { mockRestaurants, RESTAURANT_STATUS_LABELS_AR } from '@eventaat/shared';
import { PlaceholderCard } from '@/components/PlaceholderCard';
import listStyles from '@/components/PlaceholderCard.module.css';

export default function AdminRestaurantsPage() {
  return (
    <div>
      <PlaceholderCard title="مطاعم (حالات متنوعة)">
        <p className={listStyles.muted}>
          يشمل: قيد المراجعة، ظاهر، حجوزات معطّلة، معلّق، يحتاج تعديل…
        </p>
        <ul className={listStyles.listPlain}>
          {mockRestaurants.map((r) => (
            <li key={r.id}>
              {r.name} — {RESTAURANT_STATUS_LABELS_AR[r.status]} — {r.area}
            </li>
          ))}
        </ul>
      </PlaceholderCard>
    </div>
  );
}
