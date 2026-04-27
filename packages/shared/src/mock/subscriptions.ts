import { Subscription } from '../types/entities';
import { SubscriptionStatus } from '../constants/subscription-status';

export const mockSubscriptions: Subscription[] = [
  {
    id: 'sub_trial',
    restaurantId: 'r_visible',
    status: SubscriptionStatus.trial_active,
    monthlyAmountIqd: 100_000,
    periodEnd: '2026-05-15',
  },
  {
    id: 'sub_late',
    restaurantId: 'r_disabled',
    status: SubscriptionStatus.overdue,
    monthlyAmountIqd: 100_000,
    periodEnd: '2026-04-01',
  },
  {
    id: 'sub_ok',
    restaurantId: 'r_approved',
    status: SubscriptionStatus.active,
    monthlyAmountIqd: 100_000,
    periodEnd: '2026-12-01',
  },
  {
    id: 'sub_due',
    restaurantId: 'r_needs',
    status: SubscriptionStatus.payment_due,
    monthlyAmountIqd: 100_000,
    periodEnd: '2026-04-30',
  },
  {
    id: 'sub_sus',
    restaurantId: 'r_sus',
    status: SubscriptionStatus.suspended,
    monthlyAmountIqd: 100_000,
    periodEnd: '2026-03-01',
  },
  {
    id: 'sub_cx',
    restaurantId: 'r_hidden',
    status: SubscriptionStatus.cancelled,
    monthlyAmountIqd: 100_000,
    periodEnd: '2026-01-01',
  },
];

export const getSubscriptionByRestaurantId = (restaurantId: string) =>
  mockSubscriptions.find((s) => s.restaurantId === restaurantId);
