import { Complaint } from '../types/entities';
import { ComplaintStatus } from '../constants/complaint-status';

export const mockComplaints: Complaint[] = [
  {
    id: 'cmp_new',
    status: ComplaintStatus.in_review,
    reservationId: 'res_canc_r',
    openedByUserId: 'u_c2',
    subject: 'المطعم ألغى الحجز دون تبرير واضح',
    createdAt: '2026-04-20T10:00:00.000Z',
  },
  {
    id: 'cmp_wc',
    status: ComplaintStatus.new,
    reservationId: 'res_approved',
    openedByUserId: 'u_c1',
    subject: 'وصلت ولا يتطابق رقم الحجز',
    createdAt: '2026-04-28T12:00:00.000Z',
  },
];
