/** User roles (blueprint + operations split for admin; Phase 1A contract only). */
export const UserRole = {
  customer: 'customer',
  restaurant_owner: 'restaurant_owner',
  branch_manager: 'branch_manager',
  restaurant_host: 'restaurant_host',
  call_center_agent: 'call_center_agent',
  call_center_supervisor: 'call_center_supervisor',
  operations_admin: 'operations_admin',
  content_manager: 'content_manager',
  finance_manager: 'finance_manager',
  super_admin: 'super_admin',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const USER_ROLE_LABELS_AR: Record<UserRole, string> = {
  [UserRole.customer]: 'زبون',
  [UserRole.restaurant_owner]: 'صاحب مطعم',
  [UserRole.branch_manager]: 'مدير فرع',
  [UserRole.restaurant_host]: 'استقبال / مضيف',
  [UserRole.call_center_agent]: 'وكيل كول سنتر',
  [UserRole.call_center_supervisor]: 'مشرف كول سنتر',
  [UserRole.operations_admin]: 'مسؤول عمليات',
  [UserRole.content_manager]: 'مسؤول محتوى',
  [UserRole.finance_manager]: 'مسؤول مالي',
  [UserRole.super_admin]: 'مشرف عام',
};
