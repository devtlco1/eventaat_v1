import { RestaurantTable } from '../types/entities';
import { TableStatus } from '../constants/table-status';

export const mockTables: RestaurantTable[] = [
  { id: 't1', branchId: 'b_sh1', label: 'طاولة نافذة 1', capacity: 4, status: TableStatus.available },
  { id: 't2', branchId: 'b_sh1', label: 'طاولة ركن 2', capacity: 6, status: TableStatus.reserved },
  { id: 't3', branchId: 'b_sh1', label: 'صالة داخلية 3', capacity: 4, status: TableStatus.occupied },
  { id: 't4', branchId: 'b_sh1', label: 'تيراس 4', capacity: 8, status: TableStatus.out_of_service },
  { id: 't5', branchId: 'b_sh1', label: '5 — انتظار تنظيف', capacity: 2, status: TableStatus.waiting_cleaning },
  { id: 't6', branchId: 'b_sh1', label: '6 — جاري التنظيف', capacity: 2, status: TableStatus.cleaning },
  { id: 't7', branchId: 'b_sh1', label: '7 — محجوبة', capacity: 4, status: TableStatus.blocked },
];
