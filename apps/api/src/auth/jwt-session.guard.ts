import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ACCESS_JWT_TYPE, isAccessPayload } from './auth.tokens';
import { Request } from 'express';

export type AuthedRequest = Request & {
  userId: string;
  sessionId: string;
};

@Injectable()
export class JwtSessionGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException({ code: 'MISSING_TOKEN', message: 'Authorization Bearer required' });
    }
    const token = auth.slice(7);
    const secret = this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
    let payload: object;
    try {
      payload = this.jwt.verify(token, { secret }) as object;
    } catch {
      throw new UnauthorizedException({ code: 'INVALID_TOKEN', message: 'Invalid or expired token' });
    }
    if (!isAccessPayload(payload) || payload.typ !== ACCESS_JWT_TYPE) {
      throw new UnauthorizedException({ code: 'INVALID_TOKEN', message: 'Invalid or expired token' });
    }
    const session = await this.prisma.userSession.findFirst({
      where: {
        id: payload.sid,
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (!session) {
      throw new UnauthorizedException({ code: 'SESSION_REVOKED', message: 'Session invalid or expired' });
    }
    (req as AuthedRequest).userId = payload.sub;
    (req as AuthedRequest).sessionId = payload.sid;
    return true;
  }
}
