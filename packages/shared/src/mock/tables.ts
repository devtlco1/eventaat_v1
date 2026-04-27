import { RestaurantTable } from '../types/entities.js';
import { TableStatus } from '../constants/table-status.js';

export const mockTables: RestaurantTable[] = [
  { id: 't1', branchId: 'b_sh1', label: 'طاولة نافذة 1', capacity: 4, status: TableStatus.available },
  { id: 't2', branchId: 'b_sh1', label: 'طاولة ركن 2', capacity: 6, status: TableStatus.reserved },
  { id: 't3', branchId: 'b_sh1', label: 'صالة داخلية 3', capacity: 4, status: TableStatus.occupied },
  { id: 't4', branchId: 'b_sh1', label: 'تيراس 4', capacity: 8, status: TableStatus.out_of_service },
  { id: 't5', branchId: 'b_sh1', label: '5 — انتظار تنظيف', capacity: 2, status: TableStatus.waiting_cleaning },
  { id: 't6', branchId: 'b_sh1', label: '6 — جاري التنظيف', capacity: 2, status: TableStatus.cleaning },
  { id: 't7', branchId: 'b_sh1', label: '7 — محجوبة', capacity: 4, status: TableStatus.blocked },
  { id: 't8', branchId: 'b_sh2', label: 'داخل ١', capacity: 4, status: TableStatus.available },
  { id: 't9', branchId: 'b_sh2', label: 'داخل ٢', capacity: 6, status: TableStatus.reserved },
  { id: 't10', branchId: 'b_sh2', label: 'تيراس ٣', capacity: 4, status: TableStatus.occupied },
  { id: 't11', branchId: 'b_sh2', label: '٤', capacity: 2, status: TableStatus.out_of_service },
  { id: 't12', branchId: 'b_sh3', label: 'صالة ١', capacity: 8, status: TableStatus.available },
  { id: 't13', branchId: 'b_sh3', label: 'صالة ٢', capacity: 4, status: TableStatus.reserved },
  { id: 't14', branchId: 'b_sh3', label: '٣', capacity: 2, status: TableStatus.waiting_cleaning },
  { id: 't15', branchId: 'b_azz1', label: 'طاولة ١', capacity: 4, status: TableStatus.available },
  { id: 't16', branchId: 'b_azz1', label: 'طاولة ٢', capacity: 6, status: TableStatus.available },
  { id: 't17', branchId: 'b_har1', label: 'رواق ١', capacity: 4, status: TableStatus.available },
  { id: 't18', branchId: 'b_har1', label: 'رواق ٢', capacity: 4, status: TableStatus.reserved },
];
