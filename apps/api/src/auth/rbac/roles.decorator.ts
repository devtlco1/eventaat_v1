import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../../generated/client';
import { ROLES_KEY } from './rbac.types';

/**
 * Require one of these roles: primaryRole match or an active `UserRoleAssignment` with a matching `role`
 * (see `hasRequiredRoles`). Use after `JwtSessionGuard`.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
