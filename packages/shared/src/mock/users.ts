import { User } from '../types/entities';
import { UserRole } from '../constants/roles';

export const mockUsers: User[] = [
  { id: 'u_c1', displayName: 'ليلى نزار', phone: '+9647XXXXXXXX0', role: UserRole.customer, createdAt: '2026-01-10' },
  { id: 'u_c2', displayName: 'كريم عبدالله', phone: '+9647XXXXXXXX1', role: UserRole.customer, createdAt: '2026-02-01' },
  { id: 'u_owner1', displayName: 'سامر فاضل', phone: '+9647XXXXXXXX2', role: UserRole.restaurant_owner, createdAt: '2025-11-01' },
  { id: 'u_br1', displayName: 'نورا حاتم', phone: '+9647XXXXXXXX3', role: UserRole.branch_manager, createdAt: '2025-12-15' },
  { id: 'u_host1', displayName: 'رامي يوسف', phone: '+9647XXXXXXXX4', role: UserRole.restaurant_host, createdAt: '2026-03-01' },
  { id: 'u_cc1', displayName: 'دينا كاظم', phone: '+9647XXXXXXXX5', role: UserRole.call_center_agent, createdAt: '2025-10-20' },
  { id: 'u_ccs1', displayName: 'عمر سهيل', phone: '+9647XXXXXXXX6', role: UserRole.call_center_supervisor, createdAt: '2025-10-20' },
  { id: 'u_ops1', displayName: 'مروة صالح', phone: '+9647XXXXXXXX7', role: UserRole.operations_admin, createdAt: '2025-09-01' },
  { id: 'u_cnt1', displayName: 'هند ماجد', phone: '+9647XXXXXXXX8', role: UserRole.content_manager, createdAt: '2026-01-05' },
  { id: 'u_fin1', displayName: 'باسم لؤي', phone: '+9647XXXXXXXX9', role: UserRole.finance_manager, createdAt: '2025-12-01' },
  { id: 'u_adm1', displayName: 'مشرف النظام', phone: '+9647XXXXXXX10', role: UserRole.super_admin, createdAt: '2025-01-01' },
];

export const getUserById = (id: string) => mockUsers.find((u) => u.id === id);
