import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtSessionGuard } from './jwt-session.guard';
import { OtpProviderConfig } from './otp/otp-provider.config';
import { MockOtpProvider } from './otp/mock-otp.provider';
import { WhatsappOtpProvider } from './otp/whatsapp-otp.provider';
import { SmsOtpProvider } from './otp/sms-otp.provider';
import { OtpDispatcherService } from './otp/otp-dispatcher.service';
import { RbacGuard } from './rbac/rbac.guard';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          expiresIn: (config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m') ?? '15m') as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpProviderConfig,
    MockOtpProvider,
    WhatsappOtpProvider,
    SmsOtpProvider,
    OtpDispatcherService,
    JwtSessionGuard,
    RbacGuard,
  ],
  exports: [AuthService, JwtModule, JwtSessionGuard, RbacGuard],
})
export class AuthModule {}
