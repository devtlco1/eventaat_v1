/** Seating / session type for booking form (UI contract; align with restaurant session types in blueprint). */
export const SeatingType = {
  indoor: 'indoor',
  outdoor: 'outdoor',
  family: 'family',
  vip: 'vip',
} as const;

export type SeatingType = (typeof SeatingType)[keyof typeof SeatingType];

export const SEATING_TYPE_LABELS_AR: Record<SeatingType, string> = {
  [SeatingType.indoor]: 'داخلي',
  [SeatingType.outdoor]: 'خارجي',
  [SeatingType.family]: 'عائلي',
  [SeatingType.vip]: 'VIP',
};
