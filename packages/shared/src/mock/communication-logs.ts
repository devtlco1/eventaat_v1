export interface MockTimelineEntry {
  at: string;
  textAr: string;
}

const complaintLogs: Record<string, MockTimelineEntry[]> = {
  cmp_1: [
    { at: '2026-04-28T11:05:00.000Z', textAr: 'تسجيل وارد — تفاصيل عند الاستقبال' },
    { at: '2026-04-28T12:00:00.000Z', textAr: 'إسناد للوكيل لمراجعة الربط بفرع المطعم' },
  ],
  cmp_2: [
    { at: '2026-04-20T10:00:00.000Z', textAr: 'فتح الشكوى' },
    { at: '2026-04-24T10:00:00.000Z', textAr: 'طلب توضيح من المطعم' },
    { at: '2026-04-26T09:30:00.000Z', textAr: 'وصول رد مبدئي — قيد المراجعة' },
  ],
  cmp_5: [
    { at: '2026-04-25T10:00:00.000Z', textAr: 'تنبيه أول' },
    { at: '2026-04-27T09:00:00.000Z', textAr: 'تصعيد للمشرف — مذكرة داخلية' },
  ],
  cmp_8: [
    { at: '2026-04-27T07:00:00.000Z', textAr: 'إعادة فتح — طلب تدخل سريع' },
    { at: '2026-04-27T10:20:00.000Z', textAr: 'متابعة هاتفية جارية' },
  ],
  cmp_9: [
    { at: '2026-04-27T11:00:00.000Z', textAr: 'تسجيل — فرع بانتظار الرد' },
    { at: '2026-04-27T15:00:00.000Z', textAr: 'تذكير واتساب (نموذج) للمطعم' },
  ],
  cmp_10: [
    { at: '2026-04-26T09:00:00.000Z', textAr: 'بريد وارد' },
    { at: '2026-04-27T08:00:00.000Z', textAr: 'إسناد لوكيل مالي (عرضي)' },
  ],
};

const taskLogs: Record<string, MockTimelineEntry[]> = {
  cct1: [
    { at: '2026-04-27T10:00:00.000Z', textAr: 'فتح المهمة في الطابور' },
    { at: '2026-04-27T10:30:00.000Z', textAr: 'تذكير — انتظار رد المطعم' },
  ],
  cct2: [
    { at: '2026-04-26T15:00:00.000Z', textAr: 'مكالمة قصيرة مع الزبون' },
  ],
  cct4: [
    { at: '2026-04-28T11:20:00.000Z', textAr: 'ربط بملف شكوى' },
  ],
  cct9: [
    { at: '2026-04-27T12:00:00.000Z', textAr: 'فتح — أولوية فرع جديد' },
  ],
  cct10: [
    { at: '2026-04-27T13:00:00.000Z', textAr: 'مكالمة قصيرة مع المطعم' },
    { at: '2026-04-27T14:00:00.000Z', textAr: 'ملاحظة: بانتظار المسؤول' },
  ],
};

const reservationLogs: Record<string, MockTimelineEntry[]> = {
  res_pending: [
    { at: '2026-04-27T09:00:00.000Z', textAr: 'إنشاء الطلب' },
    { at: '2026-04-27T10:00:00.000Z', textAr: 'تذكير — بانتظار الرد' },
  ],
  res_b2_pend: [
    { at: '2026-04-27T10:00:00.000Z', textAr: 'طلب — فرع الجادرية' },
  ],
  res_azz_p: [
    { at: '2026-04-27T11:00:00.000Z', textAr: 'تسجيل — مطعم جديد' },
  ],
  res_har_ok: [
    { at: '2026-04-27T19:00:00.000Z', textAr: 'تسجيل جلوس (نموذجي)' },
  ],
  res_approved: [
    { at: '2026-04-26T12:00:00.000Z', textAr: 'تأكيد من المطعم' },
  ],
};

export function getComplaintCommunicationLog(complaintId: string): MockTimelineEntry[] {
  return complaintLogs[complaintId] ?? [
    { at: new Date().toISOString(), textAr: 'سجل مبدئي — بيانات العينة' },
  ];
}

export function getTaskCommunicationLog(taskId: string): MockTimelineEntry[] {
  return taskLogs[taskId] ?? [
    { at: new Date().toISOString(), textAr: 'سجل مبدئي — بيانات العينة' },
  ];
}

export function getReservationCommunicationLog(reservationId: string): MockTimelineEntry[] {
  return reservationLogs[reservationId] ?? [
    { at: new Date().toISOString(), textAr: 'سجل مبدئي — بيانات العينة' },
  ];
}
