/** Subscription lifecycle (blueprint Phase 7 — “حالات الاشتراك”). */
export const SubscriptionStatus = {
  trial_active: 'trial_active',
  active: 'active',
  payment_due: 'payment_due',
  overdue: 'overdue',
  suspended: 'suspended',
  cancelled: 'cancelled',
} as const;

export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const SUBSCRIPTION_STATUS_LABELS_AR: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.trial_active]: 'فترة تجريبية',
  [SubscriptionStatus.active]: 'نشط',
  [SubscriptionStatus.payment_due]: 'استحقاق دفع',
  [SubscriptionStatus.overdue]: 'متأخر',
  [SubscriptionStatus.suspended]: 'معلّق',
  [SubscriptionStatus.cancelled]: 'ملغى',
};
