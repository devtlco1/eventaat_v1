import type { User, UserRole, UserRoleAssignment } from '../../../generated/client';
import type { Request } from 'express';

export const ROLES_KEY = 'eventaat:rbac:roles' as const;
export const ROLE_SCOPE_TYPES_KEY = 'eventaat:rbac:role_scope_types' as const;

/**
 * User row with assignments — attached to the request by `RbacGuard` after a successful `JwtSessionGuard`.
 */
export type AuthedRequestUser = User & { roleAssignments: UserRoleAssignment[] };

export type JwtAuthedRequest = Request & { userId: string; sessionId: string; user?: AuthedRequestUser };

export { UserRole, type UserRoleAssignment };
