import type { User, UserRoleAssignment } from '../../generated/client';

/**
 * User + assignments — same shape as `auth/rbac/rbac.types` `AuthedRequestUser` (kept inline to avoid cycles).
 */
type AuthedRequestUser = User & { roleAssignments: UserRoleAssignment[] };

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      sessionId?: string;
      user?: AuthedRequestUser;
    }
  }
}

export {};
