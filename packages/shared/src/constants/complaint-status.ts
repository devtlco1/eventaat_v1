/** Complaint lifecycle (blueprint Part 13 — section 83). */
export const ComplaintStatus = {
  new: 'new',
  in_review: 'in_review',
  waiting_customer: 'waiting_customer',
  waiting_restaurant: 'waiting_restaurant',
  escalated: 'escalated',
  resolved: 'resolved',
  closed: 'closed',
  reopened: 'reopened',
} as const;

export type ComplaintStatus = (typeof ComplaintStatus)[keyof typeof ComplaintStatus];

export const COMPLAINT_STATUS_LABELS_AR: Record<ComplaintStatus, string> = {
  [ComplaintStatus.new]: 'جديدة',
  [ComplaintStatus.in_review]: 'قيد المراجعة',
  [ComplaintStatus.waiting_customer]: 'بانتظار الزبون',
  [ComplaintStatus.waiting_restaurant]: 'بانتظار المطعم',
  [ComplaintStatus.escalated]: 'مُصعّدة',
  [ComplaintStatus.resolved]: 'حُلت',
  [ComplaintStatus.closed]: 'مغلقة',
  [ComplaintStatus.reopened]: 'أعيد فتحها',
};
