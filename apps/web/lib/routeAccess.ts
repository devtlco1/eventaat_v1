/**
 * Web dashboard path access (Phase 2E). Central import for the Next.js app; rules live in `@eventaat/shared` (`rbac/role-areas.ts`).
 */
import { canAccessDashboardPath } from '@eventaat/shared';
import type { UserPublic } from '@eventaat/shared';

export {
  canAccessDashboardPath,
  canRoleAccessArea,
  getDashboardAreaFromPath,
  DASHBOARD_AREA,
  CUSTOMER_ROLES,
  RESTAURANT_ROLES,
  CALL_CENTER_ROLES,
  PLATFORM_ADMIN_ROLES,
} from '@eventaat/shared';

/**
 * Whether the signed-in user may open this pathname in **strict** dashboard mode
 * (`NEXT_PUBLIC_AUTH_REQUIRED=true`). Same behavior as `canAccessDashboardPath`.
 */
export function canAccessRoute(user: UserPublic, pathname: string) {
  return canAccessDashboardPath(user, pathname);
}
