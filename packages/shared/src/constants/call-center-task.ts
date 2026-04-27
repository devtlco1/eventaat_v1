import type { CallCenterTaskPriority, CallCenterTaskType } from '../types/entities';

export const CALL_CENTER_TASK_PRIORITY_LABELS_AR: Record<CallCenterTaskPriority, string> = {
  low: 'منخفضة',
  normal: 'عادية',
  high: 'مرتفعة',
  urgent: 'عاجلة',
};

export const CALL_CENTER_TASK_TYPE_LABELS_AR: Record<CallCenterTaskType, string> = {
  reservation: 'حجز',
  complaint: 'شكوى',
  subscription: 'اشتراك',
  outreach: 'تواصل',
  other: 'عام',
};
