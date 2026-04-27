import type { ComplaintStatus } from '../constants/complaint-status';
import type { ReservationOccasion } from '../constants/reservation-occasion';
import type { ReservationStatus } from '../constants/reservation-status';
import type { RestaurantStatus } from '../constants/restaurant-status';
import type { SeatingType } from '../constants/seating-type';
import type { SubscriptionStatus } from '../constants/subscription-status';
import type { TableStatus } from '../constants/table-status';
import type { UserRole } from '../constants/roles';

export interface User {
  id: string;
  displayName: string;
  phone: string;
  role: UserRole;
  /** ISO date */
  createdAt: string;
  /** Customer city (blueprint — after account) */
  city?: string;
}

/** Customer-facing restaurant card + details (mock fields for prototype). */
export interface Restaurant {
  id: string;
  name: string;
  area: string;
  city: string;
  status: RestaurantStatus;
  description: string;
  /** 0–5 display */
  ratingMock: number;
  /** e.g. بحرية، عربي */
  cuisineTypeAr: string;
  /** One-line hours for card/detail */
  openingHoursAr: string;
  /** Short text for details screen (blueprint cancellation policy themes) */
  cancellationPolicySummaryAr: string;
  familyFriendly: boolean;
  outdoorSeating: boolean;
  vipArea: boolean;
  /** e.g. عوائل */
  quickTagsAr: string[];
  /** short lines for “reviews preview” */
  reviewSnippets: { author: string; text: string; rating: number }[];
}

export interface Branch {
  id: string;
  restaurantId: string;
  name: string;
  area: string;
  address: string;
}

export interface RestaurantTable {
  id: string;
  branchId: string;
  label: string;
  capacity: number;
  status: TableStatus;
}

export interface Reservation {
  id: string;
  /** Human-friendly code on confirmation, e.g. EVT-100234 */
  refCode: string;
  customerId: string;
  restaurantId: string;
  branchId: string;
  tableId: string | null;
  status: ReservationStatus;
  partySize: number;
  /** ISO datetime */
  scheduledAt: string;
  /** System / restaurant note (e.g. alternative time) */
  note?: string;
  /** Customer notes from booking form */
  customerNotes?: string;
  seatingType?: SeatingType;
  occasion?: ReservationOccasion;
  createdAt: string;
}

export interface Complaint {
  id: string;
  status: ComplaintStatus;
  reservationId: string | null;
  openedByUserId: string;
  subject: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  restaurantId: string;
  status: SubscriptionStatus;
  /** IQD for mock */
  monthlyAmountIqd: number;
  periodEnd: string;
}

/**
 * Meta template row for catalog / product work (Part 12 — names where defined in blueprint).
 * Not tied to a live provider in Phase 1A.
 */
export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'Authentication' | 'Utility' | 'Marketing';
  descriptionAr: string;
}

export type CallCenterTaskStatus = 'pending' | 'in_progress' | 'done';

export interface CallCenterTask {
  id: string;
  title: string;
  reservationId: string | null;
  assigneeUserId: string | null;
  status: CallCenterTaskStatus;
  createdAt: string;
}
