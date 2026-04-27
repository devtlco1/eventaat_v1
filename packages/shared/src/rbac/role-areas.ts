/**
 * Web dashboard path groups (internal English keys). Aligned with shell nav groups in `apps/web`.
 */
import { UserRole } from '../constants/roles';
import type { UserPublic } from '../auth-client/types';

export const DASHBOARD_AREA = {
  hub: 'hub',
  restaurant: 'restaurant',
  admin: 'admin',
  call_center: 'call_center',
} as const;
export type DashboardArea = (typeof DASHBOARD_AREA)[keyof typeof DASHBOARD_AREA];

export const CUSTOMER_ROLES: UserRole[] = [UserRole.customer];
export const RESTAURANT_ROLES: UserRole[] = [
  UserRole.restaurant_owner,
  UserRole.branch_manager,
  UserRole.restaurant_host,
];
export const CALL_CENTER_ROLES: UserRole[] = [
  UserRole.call_center_agent,
  UserRole.call_center_supervisor,
];
export const PLATFORM_ADMIN_ROLES: UserRole[] = [
  UserRole.operations_admin,
  UserRole.content_manager,
  UserRole.finance_manager,
  UserRole.super_admin,
];

/**
 * Resolves a coarse dashboard area from the pathname.
 */
export function getDashboardAreaFromPath(pathname: string): DashboardArea | 'unknown' {
  const p = pathname.split('?')[0] || '';
  if (p === '/dashboard' || p === '') return DASHBOARD_AREA.hub;
  if (p.startsWith('/restaurant')) return DASHBOARD_AREA.restaurant;
  if (p.startsWith('/admin')) return DASHBOARD_AREA.admin;
  if (p.startsWith('/call-center')) return DASHBOARD_AREA.call_center;
  return 'unknown';
}

/**
 * Whether a role can access a dashboard area in **strict** mode (see `canAccessDashboardPath` rules).
 * Granularity note: `finance_manager` is limited to `/admin/subscriptions` in path checks, not here.
 */
export function canRoleAccessArea(role: UserRole, area: DashboardArea | 'unknown'): boolean {
  if (role === UserRole.super_admin) {
    return true;
  }
  if (area === 'unknown') {
    return true;
  }
  if (role === UserRole.customer) {
    return false;
  }
  if (area === DASHBOARD_AREA.restaurant) {
    return RESTAURANT_ROLES.indexOf(role) >= 0;
  }
  if (area === DASHBOARD_AREA.call_center) {
    return CALL_CENTER_ROLES.indexOf(role) >= 0 || role === UserRole.operations_admin;
  }
  if (area === DASHBOARD_AREA.admin) {
    const adminAreaRoles: UserRole[] = [
      UserRole.operations_admin,
      UserRole.content_manager,
      UserRole.finance_manager,
      UserRole.super_admin,
    ];
    return adminAreaRoles.indexOf(role) >= 0;
  }
  if (area === DASHBOARD_AREA.hub) {
    // Hub: platform / overview — not for restaurant-only, call center-only, or finance-only
    if (RESTAURANT_ROLES.indexOf(role) >= 0 || CALL_CENTER_ROLES.indexOf(role) >= 0) {
      return false;
    }
    if (role === UserRole.finance_manager) {
      return false;
    }
    const hubRoles: UserRole[] = [UserRole.operations_admin, UserRole.content_manager, UserRole.super_admin];
    return hubRoles.indexOf(role) >= 0;
  }
  return false;
}

/**
 * Fine-grained path check for the web app shell. When `authRequired` is false, the caller may skip this.
 * **Limitation (Phase 2E):** `content_manager` can access all `/admin/*` paths; stricter per-resource rules are future work.
 */
export function canAccessDashboardPath(
  user: UserPublic,
  pathname: string,
):
  | { allowed: true }
  | { allowed: false; reason: 'customer' | 'forbidden' | 'path' } {
  const role = user.primaryRole;
  if (role === UserRole.super_admin) {
    return { allowed: true };
  }
  if (role === UserRole.customer) {
    return { allowed: false, reason: 'customer' };
  }

  // Finance: subscriptions area only
  if (role === UserRole.finance_manager) {
    if (pathname.startsWith('/admin/subscriptions')) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'path' };
  }

  const p = pathname.split('?')[0] || '';
  if (p.startsWith('/restaurant')) {
    return canRoleAccessArea(role, DASHBOARD_AREA.restaurant) ? { allowed: true } : { allowed: false, reason: 'forbidden' };
  }
  if (p.startsWith('/call-center')) {
    if (canRoleAccessArea(role, DASHBOARD_AREA.call_center)) {
      return { allowed: true };
    }
    if (role === UserRole.operations_admin) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'forbidden' };
  }
  if (p.startsWith('/admin') || p === '/admin') {
    if (role === UserRole.call_center_agent || role === UserRole.call_center_supervisor) {
      return { allowed: false, reason: 'forbidden' };
    }
    if (RESTAURANT_ROLES.indexOf(role) >= 0) {
      return { allowed: false, reason: 'forbidden' };
    }
    const fullAdmin: UserRole[] = [
      UserRole.operations_admin,
      UserRole.content_manager,
      UserRole.super_admin,
    ];
    if (fullAdmin.indexOf(role) >= 0) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'forbidden' };
  }
  if (p === '/dashboard' || p === '' || p === '/') {
    return canRoleAccessArea(role, DASHBOARD_AREA.hub)
      ? { allowed: true }
      : { allowed: false, reason: 'forbidden' };
  }
  // unknown sub-path: allow
  return { allowed: true };
}
