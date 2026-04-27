import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleScopeType, UserRole, UserStatus } from '../../../generated/client';
import { RbacGuard } from './rbac.guard';
import { ROLES_KEY, ROLE_SCOPE_TYPES_KEY } from './rbac.types';
import { hasRequiredRoles } from './rbac.utils';
import { userStub } from './rbac.utils';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthedRequestUser } from './rbac.types';

function makeCtx(req: { userId?: string; sessionId?: string; user?: AuthedRequestUser }): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => req }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('hasRequiredRoles (utils)', () => {
  it('allows super_admin for any required set', () => {
    const u = userStub({ primaryRole: UserRole.super_admin, assignments: [] });
    expect(hasRequiredRoles(u, [UserRole.finance_manager], undefined)).toBe(true);
  });

  it('allows matching primaryRole', () => {
    const u = userStub({ primaryRole: UserRole.operations_admin, assignments: [] });
    expect(hasRequiredRoles(u, [UserRole.operations_admin], undefined)).toBe(true);
  });

  it('allows active assignment', () => {
    const u = userStub({
      primaryRole: UserRole.customer,
      assignments: [
        { role: UserRole.restaurant_owner, scopeType: RoleScopeType.restaurant, isActive: true },
      ],
    });
    expect(hasRequiredRoles(u, [UserRole.restaurant_owner], undefined)).toBe(true);
  });

  it('denies missing role', () => {
    const u = userStub({ primaryRole: UserRole.customer, assignments: [] });
    expect(hasRequiredRoles(u, [UserRole.super_admin], undefined)).toBe(false);
  });

  it('denies inactive assignment', () => {
    const u = userStub({
      primaryRole: UserRole.customer,
      assignments: [
        { role: UserRole.restaurant_owner, scopeType: RoleScopeType.restaurant, isActive: false },
      ],
    });
    expect(hasRequiredRoles(u, [UserRole.restaurant_owner], undefined)).toBe(false);
  });

  it('requires scope on assignments when scope filter set', () => {
    const u = userStub({
      primaryRole: UserRole.restaurant_host,
      assignments: [
        { role: UserRole.restaurant_host, scopeType: RoleScopeType.restaurant, isActive: true },
      ],
    });
    expect(hasRequiredRoles(u, [UserRole.restaurant_host], [RoleScopeType.restaurant])).toBe(true);
    expect(hasRequiredRoles(u, [UserRole.restaurant_host], [RoleScopeType.call_center])).toBe(false);
  });
});

describe('RbacGuard', () => {
  it('throws Unauthorized when userId is missing', async () => {
    const guard = new RbacGuard(
      { getAllAndOverride: jest.fn() } as unknown as Reflector,
      {} as PrismaService,
    );
    await expect(guard.canActivate(makeCtx({}))).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws Forbidden when roles do not match', async () => {
    const u = userStub({ primaryRole: UserRole.customer, assignments: [] });
    const full = { ...u, status: UserStatus.active };
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(full) },
    } as unknown as PrismaService;
    const reflector = {
      getAllAndOverride: (k: string) => (k === ROLES_KEY ? [UserRole.operations_admin] : undefined),
    } as unknown as Reflector;
    const guard = new RbacGuard(reflector, prisma);
    await expect(
      guard.canActivate(makeCtx({ userId: u.id, sessionId: 's1' })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows when user matches @Roles (super_admin)', async () => {
    const u = userStub({ primaryRole: UserRole.super_admin, assignments: [] });
    const full = { ...u, status: UserStatus.active } as AuthedRequestUser;
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(full) },
    } as unknown as PrismaService;
    const reflector = {
      getAllAndOverride: (k: string) => {
        if (k === ROLES_KEY) return [UserRole.finance_manager];
        if (k === ROLE_SCOPE_TYPES_KEY) return undefined;
        return undefined;
      },
    } as unknown as Reflector;
    const guard = new RbacGuard(reflector, prisma);
    await expect(guard.canActivate(makeCtx({ userId: u.id, sessionId: 's1' }))).resolves.toBe(true);
  });
});
