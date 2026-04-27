import { mockBranches, mockRestaurants } from '@eventaat/shared';
import { PlaceholderCard } from '@/components/PlaceholderCard';
import listStyles from '@/components/PlaceholderCard.module.css';

export default function RestaurantBranchesPage() {
  return (
    <div>
      <PlaceholderCard title="فروع (عينة)">
        <ul className={listStyles.listPlain}>
          {mockBranches.slice(0, 4).map((b) => {
            const r = mockRestaurants.find((x) => x.id === b.restaurantId);
            return (
              <li key={b.id}>
                {b.name} — {b.area} ({r?.name})
              </li>
            );
          })}
        </ul>
      </PlaceholderCard>
    </div>
  );
}
