import type { ComplaintCategory, ComplaintParty, ComplaintPriority } from '../types/entities';

export const COMPLAINT_PRIORITY_LABELS_AR: Record<ComplaintPriority, string> = {
  low: 'منخفضة',
  normal: 'عادية',
  high: 'مرتفعة',
  urgent: 'عاجلة',
};

export const COMPLAINT_CATEGORY_LABELS_AR: Record<ComplaintCategory, string> = {
  reservation: 'حجز',
  service: 'خدمة',
  billing: 'دفع/اشتراك',
  other: 'أخرى',
};

export const COMPLAINT_PARTY_LABELS_AR: Record<ComplaintParty, string> = {
  customer: 'الزبون',
  restaurant: 'المطعم',
  platform: 'المنصة',
};
