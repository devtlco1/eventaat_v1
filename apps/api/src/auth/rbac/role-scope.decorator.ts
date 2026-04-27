import { SetMetadata } from '@nestjs/common';
import { RoleScopeType } from '../../../generated/client';
import { ROLE_SCOPE_TYPES_KEY } from './rbac.types';

/**
 * When set, role checks on **assignments** also require one of these `scopeType` values (in addition
 * to `@Roles`). `super_admin` is unaffected.
 */
export const RoleScopeTypes = (...types: RoleScopeType[]) => SetMetadata(ROLE_SCOPE_TYPES_KEY, types);
