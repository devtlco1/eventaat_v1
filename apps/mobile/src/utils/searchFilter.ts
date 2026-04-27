import type { Restaurant } from '@eventaat/shared';
import { RestaurantStatus } from '@eventaat/shared';

export type SearchFilters = {
  area?: string;
  availableToday?: boolean;
  family?: boolean;
  outdoor?: boolean;
  /** free text in cuisine/tags */
  query?: string;
};

export function filterRestaurants(
  all: Restaurant[],
  search: string,
  f: SearchFilters,
): Restaurant[] {
  const q = (search + (f.query ?? '')).trim().toLowerCase();
  const areaFilter = f.area;
  return all.filter((r) => {
    if (areaFilter && r.area !== areaFilter) return false;
    if (f.availableToday) {
      if (r.status === RestaurantStatus.bookings_disabled) return false;
    }
    if (f.family && !r.familyFriendly) return false;
    if (f.outdoor && !r.outdoorSeating) return false;
    if (!q) return true;
    const blob = (
      r.name +
      r.area +
      r.description +
      r.cuisineTypeAr +
      r.quickTagsAr.join(' ')
    ).toLowerCase();
    return blob.includes(q);
  });
}
