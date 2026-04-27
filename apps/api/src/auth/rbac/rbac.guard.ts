import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { UserStatus } from '../../../generated/client';
import { ROLES_KEY, ROLE_SCOPE_TYPES_KEY, type AuthedRequestUser, type JwtAuthedRequest } from './rbac.types';
import { hasRequiredRoles } from './rbac.utils';
import { UserRole, RoleScopeType } from '../../../generated/client';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<JwtAuthedRequest>();
    const userId = req.userId;
    if (!userId) {
      throw new UnauthorizedException({ code: 'NOT_AUTHENTICATED', message: 'Session required' });
    }

    const found = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roleAssignments: true },
    });
    const user = found as AuthedRequestUser | null;

    if (!user) {
      throw new UnauthorizedException({ code: 'USER_GONE', message: 'User not found' });
    }
    if (user.status === UserStatus.disabled) {
      throw new ForbiddenException({ code: 'ACCOUNT_DISABLED', message: 'Account is disabled' });
    }
    if (user.status === UserStatus.suspended) {
      throw new ForbiddenException({ code: 'ACCOUNT_SUSPENDED', message: 'Account is suspended' });
    }

    req.user = user;

    const required =
      this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [context.getHandler(), context.getClass()]) ??
      [];
    const scopeTypes = this.reflector.getAllAndOverride<RoleScopeType[] | undefined>(ROLE_SCOPE_TYPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!hasRequiredRoles(user, required, scopeTypes)) {
      throw new ForbiddenException({ code: 'INSUFFICIENT_ROLE', message: 'Not allowed for this resource' });
    }
    return true;
  }
}
