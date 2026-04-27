import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { AuthedRequestUser } from './rbac.types';
import type { Request } from 'express';

/**
 * Injects the user object loaded by `RbacGuard`. Use with `@UseGuards(JwtSessionGuard, RbacGuard)`.
 * Throws if the user is missing (should not happen on guarded routes that ran `RbacGuard` successfully).
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthedRequestUser => {
    const req = ctx.switchToHttp().getRequest<Request>();
    const u = req.user;
    if (!u) {
      throw new UnauthorizedException({ code: 'USER_NOT_RESOLVED', message: 'RbacGuard must run first' });
    }
    return u;
  },
);
