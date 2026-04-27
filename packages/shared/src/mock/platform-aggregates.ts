import { RestaurantStatus } from '../constants/restaurant-status.js';
import { ReservationStatus } from '../constants/reservation-status.js';
import { ComplaintStatus } from '../constants/complaint-status.js';
import { SubscriptionStatus } from '../constants/subscription-status.js';
import { MOCK_DEMO_TODAY } from '../constants/demo-dates.js';
import type { Restaurant, Subscription, Reservation } from '../types/entities.js';
import { mockReservations } from './reservations.js';
import { mockRestaurants } from './restaurants.js';
import { mockComplaints } from './complaints.js';
import { mockSubscriptions } from './subscriptions.js';
import { mockCallCenterTasks } from './callCenterTasks.js';
import { mockBranches } from './branches.js';
import { getSubscriptionByRestaurantId } from './subscriptions.js';
import { getUserById } from './users.js';
import { getReservationById } from './reservations.js';

function getDateKey(iso: string) {
  return iso.slice(0, 10);
}

function stableScore(id: string): number {
  let s = 0;
  for (let i = 0; i < id.length; i += 1) s += id.charCodeAt(i);
  return Math.round((3.5 + (s % 16) / 10) * 10) / 10;
}

export function countReservationsOnDate(dateKey: string) {
  return mockReservations.filter((r) => getDateKey(r.scheduledAt) === dateKey).length;
}

export const platformDashboardKpis = () => ({
  restaurantCount: mockRestaurants.length,
  todayReservations: countReservationsOnDate(MOCK_DEMO_TODAY),
  openComplaints: mockComplaints.filter(
    (c) =>
      c.status !== ComplaintStatus.closed &&
      c.status !== ComplaintStatus.resolved,
  ).length,
  subscriptionsNeedingFollowUp: mockSubscriptions.filter(
    (s) =>
      s.status === SubscriptionStatus.payment_due ||
      s.status === SubscriptionStatus.overdue,
  ).length,
  callCenterTaskCount: mockCallCenterTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress')
    .length,
});

export const adminDashboardKpis = () => ({
  totalRestaurants: mockRestaurants.length,
  pendingReview: mockRestaurants.filter(
    (r) => r.status === RestaurantStatus.under_review || r.status === RestaurantStatus.needs_changes,
  ).length,
  todayReservations: countReservationsOnDate(MOCK_DEMO_TODAY),
  openComplaints: mockComplaints.filter(
    (c) => c.status !== ComplaintStatus.closed,
  ).length,
  lateSubscriptions: mockSubscriptions.filter(
    (s) => s.status === SubscriptionStatus.overdue || s.status === SubscriptionStatus.payment_due,
  ).length,
  disabledBookingsRestaurants: mockRestaurants.filter(
    (r) => r.status === RestaurantStatus.bookings_disabled,
  ).length,
});

export interface AdminRestaurantRow {
  id: string;
  name: string;
  area: string;
  status: Restaurant['status'];
  branchCount: number;
  reservationsToday: number;
  subscriptionStatus: Subscription['status'] | null;
  qualityScore: number;
}

export function getAdminRestaurantRows(): AdminRestaurantRow[] {
  return mockRestaurants.map((r) => {
    const subs = getSubscriptionByRestaurantId(r.id);
    const br = mockBranches.filter((b) => b.restaurantId === r.id).length;
    const resToday = mockReservations.filter(
      (x) => x.restaurantId === r.id && getDateKey(x.scheduledAt) === MOCK_DEMO_TODAY,
    ).length;
    return {
      id: r.id,
      name: r.name,
      area: r.area,
      status: r.status,
      branchCount: br,
      reservationsToday: resToday,
      subscriptionStatus: subs?.status ?? null,
      qualityScore: stableScore(r.id),
    };
  });
}

const DEMO_LATE_CUTOFF = '2026-04-27T16:00:00.000Z';

function isLateInSample(r: Reservation) {
  if (r.status !== ReservationStatus.approved && r.status !== ReservationStatus.customer_on_the_way) {
    return false;
  }
  return new Date(r.scheduledAt).getTime() < new Date(DEMO_LATE_CUTOFF).getTime();
}

function isNoShowCandidateInSample(r: Reservation) {
  if (r.status === ReservationStatus.customer_on_the_way) {
    return getDateKey(r.scheduledAt) === MOCK_DEMO_TODAY;
  }
  if (r.status === ReservationStatus.approved) {
    return isLateInSample(r);
  }
  return false;
}

function reservationPartyLabel(s: Reservation['status']): 'late_risk' | 'no_show_risk' | 'stable' {
  if (s === ReservationStatus.no_show) return 'no_show_risk';
  if (s === ReservationStatus.pending) return 'late_risk';
  if (s === ReservationStatus.approved) return 'late_risk';
  if (s === ReservationStatus.expired) return 'late_risk';
  return 'stable';
}

export const adminReservationKpis = () => ({
  pendingRestaurant: mockReservations.filter((r) => r.status === ReservationStatus.pending).length,
  confirmed: mockReservations.filter((r) => r.status === ReservationStatus.approved).length,
  late: mockReservations.filter(
    (r) => isLateInSample(r) || r.status === ReservationStatus.expired,
  ).length,
  noShowCandidate: mockReservations.filter((r) => isNoShowCandidateInSample(r)).length,
  cancelled: mockReservations.filter(
    (r) =>
      r.status === ReservationStatus.cancelled_by_customer ||
      r.status === ReservationStatus.cancelled_by_restaurant ||
      r.status === ReservationStatus.cancelled_by_admin,
  ).length,
  completed: mockReservations.filter((r) => r.status === ReservationStatus.completed).length,
});

export function getAdminReservationTableRows() {
  return mockReservations.map((r) => {
    const cust = getUserById(r.customerId);
    const rest = mockRestaurants.find((x) => x.id === r.restaurantId);
    const br = mockBranches.find((b) => b.id === r.branchId);
    return {
      ...r,
      customerName: cust?.displayName ?? '—',
      restaurantName: rest?.name ?? r.restaurantId,
      branchName: br?.name ?? r.branchId,
      followup: reservationPartyLabel(r.status),
      needsAdminFollowup: Boolean(r.needsAdminFollowupMock),
    };
  });
}

export const adminComplaintKpis = () => ({
  newComplaints: mockComplaints.filter((c) => c.status === ComplaintStatus.new).length,
  inReview: mockComplaints.filter((c) => c.status === ComplaintStatus.in_review).length,
  waitingCustomer: mockComplaints.filter(
    (c) => c.status === ComplaintStatus.waiting_customer,
  ).length,
  waitingRestaurant: mockComplaints.filter(
    (c) => c.status === ComplaintStatus.waiting_restaurant,
  ).length,
  escalated: mockComplaints.filter((c) => c.status === ComplaintStatus.escalated).length,
  closed: mockComplaints.filter(
    (c) => c.status === ComplaintStatus.closed || c.status === ComplaintStatus.resolved,
  ).length,
});

export function getAdminComplaintTableRows() {
  return mockComplaints.map((c) => {
    const u = getUserById(c.openedByUserId);
    const resv = c.reservationId ? getReservationById(c.reservationId) : undefined;
    const restId = c.restaurantId ?? resv?.restaurantId;
    const rest = restId ? mockRestaurants.find((x) => x.id === restId) : undefined;
    return {
      ...c,
      customerName: u?.displayName ?? '—',
      restaurantName: rest?.name ?? restId ?? '—',
      lastUpdated: c.updatedAt ?? c.createdAt,
    };
  });
}

export const adminSubscriptionKpis = () => ({
  trial: mockSubscriptions.filter((s) => s.status === SubscriptionStatus.trial_active).length,
  active: mockSubscriptions.filter((s) => s.status === SubscriptionStatus.active).length,
  paymentDue: mockSubscriptions.filter((s) => s.status === SubscriptionStatus.payment_due).length,
  overdue: mockSubscriptions.filter((s) => s.status === SubscriptionStatus.overdue).length,
  suspended: mockSubscriptions.filter((s) => s.status === SubscriptionStatus.suspended).length,
  cancelled: mockSubscriptions.filter((s) => s.status === SubscriptionStatus.cancelled).length,
});

export const callCenterDashboardKpis = () => ({
  tasksToday: mockCallCenterTasks.filter(
    (t) => t.status === 'pending' || t.status === 'in_progress',
  ).length,
  waitingFollowup: mockCallCenterTasks.filter((t) => t.status === 'pending').length,
  lateRestaurantReply: mockReservations.filter(
    (r) => r.status === ReservationStatus.pending,
  ).length,
  openComplaints: mockComplaints.filter(
    (c) => c.status !== ComplaintStatus.closed && c.status !== ComplaintStatus.resolved,
  ).length,
  noReplyRestaurants: 1, // static mock: placeholder count for ops overview
  escalatedTasks: mockCallCenterTasks.filter(
    (t) => t.priority === 'urgent' && t.status !== 'done',
  ).length,
});

export const platformActivityFeed = () => [
  { at: '2026-04-27T08:00:00.000Z', textAr: 'طلب حجز جديد بانتظار الرد (شاطئ دجلة)' },
  { at: '2026-04-27T09:12:00.000Z', textAr: 'شكوى مُسجّلة — بانتظار الربط' },
  { at: '2026-04-27T10:00:00.000Z', textAr: 'مهمة كول سنتر: متابعة وقت بديل' },
  { at: '2026-04-27T11:00:00.000Z', textAr: 'تنبيه اشتراك: مطعم زيونة' },
];

export const platformAttentionReservations = () =>
  mockReservations.filter(
    (r) => r.needsAdminFollowupMock && getDateKey(r.scheduledAt) === MOCK_DEMO_TODAY,
  );

export const platformPendingRestaurants = () =>
  mockRestaurants.filter(
    (r) => r.status === RestaurantStatus.under_review || r.status === RestaurantStatus.needs_changes,
  );

export const platformUrgentComplaints = () =>
  mockComplaints.filter((c) => c.priority === 'urgent' && c.status !== ComplaintStatus.closed);

export const platformLateSubscriptions = () =>
  mockSubscriptions.filter(
    (s) => s.status === SubscriptionStatus.overdue || s.status === SubscriptionStatus.payment_due,
  );

export const callCenterTaskQueue = () => mockCallCenterTasks;

export const callCenterReservationsBySection = () => {
  const pending = mockReservations.filter((r) => r.status === ReservationStatus.pending);
  const near = mockReservations.filter(
    (r) =>
      getDateKey(r.scheduledAt) === MOCK_DEMO_TODAY &&
      (r.status === ReservationStatus.approved || r.status === ReservationStatus.customer_on_the_way),
  );
  const late = mockReservations.filter(
    (r) =>
      r.status === ReservationStatus.expired ||
      r.status === ReservationStatus.rejected,
  );
  const confirm = mockReservations.filter(
    (r) => r.status === ReservationStatus.alternative_proposed,
  );
  return { pendingRestaurant: pending, near, late, confirm };
};

export const callCenterOpenComplaints = () =>
  mockComplaints.filter(
    (c) =>
      c.status === ComplaintStatus.new ||
      c.status === ComplaintStatus.in_review ||
      c.status === ComplaintStatus.escalated,
  );

export const callCenterActivityLog = () => [
  { at: '2026-04-27T09:00:00.000Z', textAr: 'مكالمة: تأكيد وقت بديل' },
  { at: '2026-04-27T10:00:00.000Z', textAr: 'واتساب: تذكير بملف الاشتراك' },
  { at: '2026-04-27T10:20:00.000Z', textAr: 'ملاحظة: مطعم استجاب خلال المهلة' },
];

export const qualityAlerts = () => [
  { id: 'qa1', textAr: 'نسبة ردود متأخرة ارتفعت في بيانات عينة (الكرادة).', level: 'watch' as const },
  { id: 'qa2', textAr: 'شكوى مفتوحة مُكررة لنفس الفرع — لمراجعة السياسة.', level: 'warn' as const },
];
