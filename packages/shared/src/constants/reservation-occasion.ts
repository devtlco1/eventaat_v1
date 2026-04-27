export const ReservationOccasion = {
  none: 'none',
  birthday: 'birthday',
  business: 'business',
  family: 'family',
} as const;

export type ReservationOccasion = (typeof ReservationOccasion)[keyof typeof ReservationOccasion];

export const RESERVATION_OCCASION_LABELS_AR: Record<ReservationOccasion, string> = {
  [ReservationOccasion.none]: 'بدون مناسبة',
  [ReservationOccasion.birthday]: 'عيد ميلاد',
  [ReservationOccasion.business]: 'اجتماع عمل',
  [ReservationOccasion.family]: 'مناسبة عائلية',
};
