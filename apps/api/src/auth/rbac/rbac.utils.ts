import { UserRole, UserStatus, type UserRoleAssignment, RoleScopeType } from '../../../generated/client';
import type { AuthedRequestUser } from './rbac.types';

export function isAssignmentEligible(a: UserRoleAssignment): boolean {
  return a.isActive === true;
}

/**
 * Access rules:
 * - `super_admin` always allows.
 * - If `required` is empty, any authenticated user passes (authorization layer only loads user).
 * - If `scopeTypes` is non-empty: must have an **active** assignment with `role` in `required` and
 *   `scopeType` in `scopeTypes` (primary alone does not satisfy scope constraints).
 * - If `scopeTypes` is empty/undefined: allow if `primaryRole` in `required`, or any **active** assignment
 *   with `role` in `required`.
 */
export function hasRequiredRoles(
  user: AuthedRequestUser,
  required: UserRole[],
  scopeTypes: RoleScopeType[] | undefined,
): boolean {
  if (user.primaryRole === UserRole.super_admin) {
    return true;
  }
  if (required.length === 0) {
    return true;
  }
  const ass = user.roleAssignments.filter(isAssignmentEligible);
  if (scopeTypes && scopeTypes.length > 0) {
    for (const a of ass) {
      if (required.includes(a.role) && scopeTypes.includes(a.scopeType)) {
        return true;
      }
    }
    return false;
  }
  if (required.includes(user.primaryRole)) {
    return true;
  }
  for (const a of ass) {
    if (required.includes(a.role)) {
      return true;
    }
  }
  return false;
}

/** @internal */
export function userStub(
  o: {
    id?: string;
    primaryRole: UserRole;
    assignments: Partial<Pick<UserRoleAssignment, 'role' | 'scopeType' | 'scopeId' | 'isActive'>>[];
  },
): AuthedRequestUser {
  return {
    id: o.id ?? 'u1',
    phone: '+1',
    phoneNormalized: '1',
    fullName: null,
    city: null,
    status: UserStatus.active,
    isPhoneVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
    disabledAt: null,
    suspendedAt: null,
    primaryRole: o.primaryRole,
    roleAssignments: o.assignments.map(
      (x, i) =>
        ({
          id: `ra${i}`,
          userId: o.id ?? 'u1',
          role: x.role!,
          scopeType: (x.scopeType as UserRoleAssignment['scopeType']) ?? 'platform',
          scopeId: x.scopeId ?? '',
          isActive: x.isActive ?? true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }) as UserRoleAssignment,
    ),
  } as AuthedRequestUser;
}
