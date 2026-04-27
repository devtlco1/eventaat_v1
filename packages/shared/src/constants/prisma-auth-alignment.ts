/**
 * Phase 2A: `UserRole` string values in shared code are intended to match the
 * `UserRole` Prisma enum in `apps/api/prisma/schema.prisma` (no renames in Phase 2A).
 * Use this list for future validation (e.g. Zod) when API reads/writes Prisma.
 */
import { UserRole, type UserRole as UserRoleType } from './roles';

const ORDER = [
  UserRole.customer,
  UserRole.restaurant_owner,
  UserRole.branch_manager,
  UserRole.restaurant_host,
  UserRole.call_center_agent,
  UserRole.call_center_supervisor,
  UserRole.operations_admin,
  UserRole.content_manager,
  UserRole.finance_manager,
  UserRole.super_admin,
] as const;

/** All `UserRole` values in stable order (matches Prisma enum). */
export const PRISMA_ALIGNED_USER_ROLES: readonly UserRoleType[] = ORDER;

export function isUserRoleString(value: string): value is UserRoleType {
  return (ORDER as readonly string[]).includes(value);
}
