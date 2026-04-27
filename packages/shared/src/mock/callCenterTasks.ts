import { CallCenterTask } from '../types/entities';

export const mockCallCenterTasks: CallCenterTask[] = [
  {
    id: 'cct1',
    title: 'متابعة حجز res_pending',
    reservationId: 'res_pending',
    assigneeUserId: 'u_cc1',
    status: 'pending',
    createdAt: '2026-04-27T10:00:00.000Z',
  },
  {
    id: 'cct2',
    title: 'تأكيد بيانات res_altprop',
    reservationId: 'res_altprop',
    assigneeUserId: 'u_cc1',
    status: 'in_progress',
    createdAt: '2026-04-26T15:00:00.000Z',
  },
  {
    id: 'cct3',
    title: 'متابعة بريد — لا حجز',
    reservationId: null,
    assigneeUserId: 'u_ccs1',
    status: 'done',
    createdAt: '2026-04-20T10:00:00.000Z',
  },
];
