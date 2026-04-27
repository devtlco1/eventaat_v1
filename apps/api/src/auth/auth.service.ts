import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OtpChannel,
  OtpPurpose,
  OtpStatus,
  Prisma,
  UserRole,
  type User,
  UserStatus,
} from '../../generated/client';
import { PrismaService } from '../prisma/prisma.service';
import { writeAudit } from './auth.audit';
import { normalizeIraqPhone, isValidIraqNormalized } from './auth.phone';
import {
  generateNumericOtp,
  generateRefreshToken,
  hashOtp,
  hashRefreshToken,
  verifyOtp,
} from './auth.security';
import { ACCESS_JWT_TYPE, type AccessTokenPayload } from './auth.tokens';
import { OtpDispatcherService } from './otp-dispatcher.service';
import type { RequestOtpDto } from './dto/request-otp.dto';
import type { VerifyOtpDto } from './dto/verify-otp.dto';
import { MeResponseDto } from './dto/me-response.dto';
import { VerifyOtpResponseDto, RequestOtpResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly dispatcher: OtpDispatcherService,
  ) {}

  private get pepper(): string {
    return this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
  }

  /** Read from process so tests and tools can toggle without ConfigService cache issues. */
  private get devExposeOtp(): boolean {
    return process.env.AUTH_DEV_EXPOSE_OTP === 'true';
  }

  private get otpTtlMs(): number {
    const m = parseInt(this.config.get<string>('OTP_EXPIRES_MINUTES', '5'), 10) || 5;
    return m * 60 * 1000;
  }

  private get refreshTtlMs(): number {
    const d = parseInt(this.config.get<string>('REFRESH_TOKEN_EXPIRES_DAYS', '14'), 10) || 14;
    return d * 24 * 60 * 60 * 1000;
  }

  private get accessExp(): string {
    return this.config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m')!;
  }

  async requestOtp(dto: RequestOtpDto, ip?: string, userAgent?: string): Promise<RequestOtpResponseDto> {
    const { e164, phoneNormalized } = normalizeIraqPhone(dto.phone);
    if (!e164 || !isValidIraqNormalized(phoneNormalized)) {
      throw new BadRequestException({
        code: 'INVALID_PHONE',
        message: 'Invalid phone number for Iraq',
        messageAr: 'رقم الهاتف غير صالح',
      });
    }

    let user = await this.prisma.user.findUnique({ where: { phoneNormalized } });

    if (user) {
      if (user.status === UserStatus.disabled) {
        throw new ForbiddenException({
          code: 'ACCOUNT_DISABLED',
          message: 'Account is disabled',
          messageAr: 'الحساب معطّل',
        });
      }
      if (user.status === UserStatus.suspended) {
        throw new ForbiddenException({
          code: 'ACCOUNT_SUSPENDED',
          message: 'Account is suspended',
          messageAr: 'الحساب موقوف',
        });
      }
    }

    if (!user) {
      try {
        user = await this.prisma.user.create({
          data: {
            phone: e164,
            phoneNormalized,
            fullName: dto.fullName ?? null,
            city: dto.city ?? null,
            status: UserStatus.pending_verification,
            primaryRole: 'customer',
            isPhoneVerified: false,
          },
        });
      } catch (e) {
        this.rethrowPrismaOrThrow(e, 'user_create');
      }
    } else {
      if (dto.fullName != null || dto.city != null) {
        try {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: {
              ...(dto.fullName != null ? { fullName: dto.fullName } : {}),
              ...(dto.city != null ? { city: dto.city } : {}),
            },
          });
        } catch (e) {
          this.rethrowPrismaOrThrow(e, 'user_update');
        }
      }
    }

    if (!user) {
      throw new HttpException(
        { code: 'USER_MISSING', message: 'Could not create user' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      await this.prisma.otpChallenge.updateMany({
        where: {
          phoneNormalized,
          status: OtpStatus.pending,
        },
        data: { status: OtpStatus.cancelled },
      });
    } catch (e) {
      this.rethrowPrismaOrThrow(e, 'otp_cancel');
    }

    const code = generateNumericOtp(6);
    const codeHash = hashOtp(code, this.pepper);
    const expiresAt = new Date(Date.now() + this.otpTtlMs);
    const maxAttempts = parseInt(this.config.get<string>('OTP_MAX_ATTEMPTS', '5'), 10) || 5;

    let challenge: { id: string; expiresAt: Date; channel: OtpChannel; purpose: OtpPurpose };
    try {
      const created = await this.prisma.otpChallenge.create({
        data: {
          userId: user.id,
          phone: e164,
          phoneNormalized,
          purpose: dto.purpose as OtpPurpose,
          channel: dto.channel as OtpChannel,
          status: OtpStatus.pending,
          codeHash,
          expiresAt,
          maxAttempts,
        },
        select: { id: true, expiresAt: true, channel: true, purpose: true },
      });
      challenge = created;
    } catch (e) {
      this.rethrowPrismaOrThrow(e, 'otp_create');
    }

    await this.dispatcher.dispatch({
      phone: e164,
      phoneNormalized,
      channel: challenge.channel,
      purpose: challenge.purpose,
      challengeId: challenge.id,
    });

    // Dev-only audit: no PII; optional dev OTP only when flag is set
    if (ip || userAgent) {
      void writeAudit(this.prisma, {
        action: 'auth.otp_requested',
        actorUserId: user.id,
        entityType: 'OtpChallenge',
        entityId: challenge.id,
        ipAddress: ip,
        userAgent: userAgent,
        metadata: { channel: challenge.channel, purpose: challenge.purpose } as object,
      });
    } else {
      void writeAudit(this.prisma, {
        action: 'auth.otp_requested',
        actorUserId: user.id,
        entityType: 'OtpChallenge',
        entityId: challenge.id,
        metadata: { channel: challenge.channel, purpose: challenge.purpose } as object,
      });
    }

    return {
      challengeId: challenge.id,
      expiresAt: challenge.expiresAt,
      channel: challenge.channel,
      purpose: challenge.purpose,
      devOtp: this.devExposeOtp ? code : undefined,
    };
  }

  async verifyOtp(dto: VerifyOtpDto, ip?: string, userAgent?: string): Promise<VerifyOtpResponseDto> {
    const ch = await this.prisma.otpChallenge.findUnique({
      where: { id: dto.challengeId },
      include: { user: true },
    });
    if (!ch || ch.status !== OtpStatus.pending) {
      throw new BadRequestException({
        code: 'CHALLENGE_INVALID',
        message: 'Invalid or used challenge',
        messageAr: 'الرمز غير صالح',
      });
    }
    if (ch.expiresAt < new Date()) {
      try {
        await this.prisma.otpChallenge.update({
          where: { id: ch.id },
          data: { status: OtpStatus.expired, failedAt: new Date() },
        });
      } catch {
        /* best effort */
      }
      throw new BadRequestException({
        code: 'CHALLENGE_EXPIRED',
        message: 'Code expired',
        messageAr: 'انتهت صلاحية الرمز',
      });
    }

    if (dto.phone) {
      const { phoneNormalized: pn } = normalizeIraqPhone(dto.phone);
      if (pn !== ch.phoneNormalized) {
        throw new BadRequestException({
          code: 'PHONE_MISMATCH',
          message: 'Phone does not match challenge',
          messageAr: 'الهاتف لا يتطابق',
        });
      }
    }

    if (!ch.user) {
      throw new BadRequestException({ code: 'CHALLENGE_ORPHAN', message: 'Challenge has no user' });
    }
    if (ch.user.status === UserStatus.disabled || ch.user.status === UserStatus.suspended) {
      throw new ForbiddenException({
        code: 'ACCOUNT_BLOCKED',
        message: 'Account cannot sign in',
        messageAr: 'تعذر تسجيل الدخول',
      });
    }

    const valid = verifyOtp(dto.code, ch.codeHash, this.pepper);
    if (!valid) {
      const next = ch.attemptCount + 1;
      const atLimit = next >= ch.maxAttempts;
      await this.prisma.otpChallenge.update({
        where: { id: ch.id },
        data: {
          attemptCount: next,
          ...(atLimit
            ? { status: OtpStatus.failed, failedAt: new Date() }
            : {}),
        },
      });
      if (atLimit) {
        void writeAudit(this.prisma, {
          action: 'auth.otp_lockout',
          actorUserId: ch.userId,
          entityType: 'OtpChallenge',
          entityId: ch.id,
          ipAddress: ip,
          userAgent: userAgent,
        });
        throw new HttpException(
          { code: 'TOO_MANY_ATTEMPTS', message: 'Too many attempts', messageAr: 'محاولات كثيرة' },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      void writeAudit(this.prisma, {
        action: 'auth.otp_failed',
        actorUserId: ch.userId,
        entityType: 'OtpChallenge',
        entityId: ch.id,
        ipAddress: ip,
        userAgent: userAgent,
        metadata: { attempt: next } as Prisma.JsonObject,
      });
      throw new BadRequestException({
        code: 'INVALID_CODE',
        message: 'Invalid code',
        messageAr: 'الرمز غير صحيح',
      });
    }

    const refreshPlain = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshPlain, this.pepper);
    const sessionExpires = new Date(Date.now() + this.refreshTtlMs);
    const accessExpDate = this.computeAccessExpDate();

    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: ch.userId! },
        data: {
          status: UserStatus.active,
          isPhoneVerified: true,
          lastLoginAt: new Date(),
        },
        include: { roleAssignments: true },
      });

      await tx.otpChallenge.update({
        where: { id: ch.id },
        data: { status: OtpStatus.verified, verifiedAt: new Date() },
      });

      await tx.otpChallenge.updateMany({
        where: { userId: ch.userId!, id: { not: ch.id }, status: OtpStatus.pending },
        data: { status: OtpStatus.cancelled },
      });

      const session = await tx.userSession.create({
        data: {
          userId: updated.id,
          refreshTokenHash,
          userAgent: userAgent ?? null,
          ipAddress: ip ?? null,
          expiresAt: sessionExpires,
        },
      });

      return { user: updated, session };
    });

    const payload: AccessTokenPayload = {
      sub: result.user.id,
      sid: result.session.id,
      typ: ACCESS_JWT_TYPE,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accessToken = this.jwt.sign(payload as any, { expiresIn: this.accessExp as any });

    const expiresAt = accessExpDate;

    void writeAudit(this.prisma, {
      action: 'auth.otp_verified',
      actorUserId: result.user.id,
      entityType: 'OtpChallenge',
      entityId: ch.id,
      ipAddress: ip,
      userAgent: userAgent,
    });
    void writeAudit(this.prisma, {
      action: 'auth.login_success',
      actorUserId: result.user.id,
      entityType: 'User',
      entityId: result.user.id,
      ipAddress: ip,
      userAgent: userAgent,
    });

    return {
      user: this.toUserPublicFromEntity(
        result.user,
        result.user.roleAssignments.map((a) => ({
          id: a.id,
          role: a.role as UserRole,
          scopeType: String(a.scopeType),
          scopeId: a.scopeId,
          isActive: a.isActive,
        })),
      ),
      accessToken,
      refreshToken: refreshPlain,
      sessionId: result.session.id,
      expiresAt: expiresAt,
    };
  }

  private computeAccessExpDate(): string {
    const s = this.accessExp.trim();
    const m = s.match(/^(\d+)([smhd])$/i);
    if (!m) {
      return new Date(Date.now() + 15 * 60 * 1000).toISOString();
    }
    const n = parseInt(m[1], 10);
    const u = m[2].toLowerCase();
    let ms = 0;
    if (u === 's') {
      ms = n * 1000;
    } else if (u === 'm') {
      ms = n * 60 * 1000;
    } else if (u === 'h') {
      ms = n * 60 * 60 * 1000;
    } else if (u === 'd') {
      ms = n * 24 * 60 * 60 * 1000;
    }
    return new Date(Date.now() + ms).toISOString();
  }

  toUserPublicFromEntity(
    u: User,
    assignments: { id: string; role: UserRole; scopeType: string; scopeId: string; isActive: boolean }[],
  ): MeResponseDto {
    return {
      id: u.id,
      phone: u.phone,
      phoneNormalized: u.phoneNormalized,
      fullName: u.fullName,
      city: u.city,
      status: u.status,
      primaryRole: u.primaryRole,
      isPhoneVerified: u.isPhoneVerified,
      roleAssignments: assignments.map((a) => ({
        id: a.id,
        role: a.role,
        scopeType: a.scopeType,
        scopeId: a.scopeId,
        isActive: a.isActive,
      })),
    };
  }

  async getMe(
    userId: string,
  ): Promise<MeResponseDto> {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roleAssignments: true },
    });
    if (!u) {
      throw new HttpException(
        { code: 'USER_NOT_FOUND', message: 'User not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    return this.toUserPublicFromEntity(
      u,
      u.roleAssignments.map((a) => ({
        id: a.id,
        role: a.role as UserRole,
        scopeType: String(a.scopeType),
        scopeId: a.scopeId,
        isActive: a.isActive,
      })),
    );
  }

  async logout(
    userId: string,
    sessionIdFromToken: string,
    bodySessionId: string | undefined,
    ip?: string,
    userAgent?: string,
  ): Promise<{ success: true }> {
    if (bodySessionId && bodySessionId !== sessionIdFromToken) {
      throw new BadRequestException({
        code: 'SESSION_MISMATCH',
        message: 'sessionId does not match the current token',
      });
    }
    const n = await this.prisma.userSession.updateMany({
      where: { id: sessionIdFromToken, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (n.count < 1) {
      throw new NotFoundException({ code: 'SESSION_NOT_FOUND', message: 'Session not found' });
    }
    void writeAudit(this.prisma, {
      action: 'auth.logout',
      actorUserId: userId,
      entityType: 'UserSession',
      entityId: sessionIdFromToken,
      ipAddress: ip,
      userAgent: userAgent,
    });
    return { success: true };
  }

  /** Re-throws; maps known Prisma "database unreachable" cases to 503. */
  private rethrowPrismaOrThrow(e: unknown, _ctx: string): never {
    if (e && typeof e === 'object' && 'code' in e) {
      const c = (e as { code?: string }).code;
      if (c === 'P1001' || c === 'P1017') {
        throw new HttpException(
          { code: 'DB_UNAVAILABLE', message: 'Database unavailable' },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    }
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Can't reach") || msg.includes("ECONNREFUSED")) {
      throw new HttpException(
        { code: 'DB_UNAVAILABLE', message: 'Database unavailable' },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    throw e;
  }
}
