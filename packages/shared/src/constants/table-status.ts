/** Table states for floor plan / operations (blueprint table lifecycle themes). */
export const TableStatus = {
  available: 'available',
  reserved: 'reserved',
  occupied: 'occupied',
  waiting_cleaning: 'waiting_cleaning',
  cleaning: 'cleaning',
  blocked: 'blocked',
  out_of_service: 'out_of_service',
} as const;

export type TableStatus = (typeof TableStatus)[keyof typeof TableStatus];

export const TABLE_STATUS_LABELS_AR: Record<TableStatus, string> = {
  [TableStatus.available]: 'متاحة',
  [TableStatus.reserved]: 'محجوزة',
  [TableStatus.occupied]: 'مشغولة',
  [TableStatus.waiting_cleaning]: 'بانتظار التنظيف',
  [TableStatus.cleaning]: 'تنظيف',
  [TableStatus.blocked]: 'محجوبة',
  [TableStatus.out_of_service]: 'خارج الخدمة',
};
