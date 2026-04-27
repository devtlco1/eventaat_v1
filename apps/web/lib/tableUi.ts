import type { RestaurantTable } from '@eventaat/shared';

export type SeatingStyleFilter = 'all' | 'indoor' | 'outdoor' | 'family';

export function getTableSeatingStyle(t: RestaurantTable): 'indoor' | 'outdoor' | 'family' {
  const n = t.label;
  if (n.includes('تيراس') || n.includes('تراس')) return 'outdoor';
  if (n.includes('عائل') || n.includes('6')) return 'family';
  return 'indoor';
}

const SEATING_LABEL: Record<Exclude<SeatingStyleFilter, 'all'>, string> = {
  indoor: 'داخلي',
  outdoor: 'خارجي',
  family: 'عائلي',
};

export function seatingLabel(t: RestaurantTable) {
  return SEATING_LABEL[getTableSeatingStyle(t)];
}
