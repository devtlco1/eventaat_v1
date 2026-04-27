import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OtpChannel, OtpPurpose, UserRole, UserStatus } from '../../../generated/client';

const otpPurposes: OtpPurpose[] = [
  'login',
  'register',
  'phone_verification',
  'staff_invite',
];
const otpChannels: OtpChannel[] = ['whatsapp', 'sms', 'manual'];

export class RequestOtpResponseDto {
  @ApiProperty()
  challengeId!: string;

  @ApiProperty()
  expiresAt!: Date;

  @ApiProperty({ enum: otpChannels, enumName: 'OtpChannel' })
  channel!: OtpChannel;

  @ApiProperty({ enum: otpPurposes, enumName: 'OtpPurpose' })
  purpose!: OtpPurpose;

  @ApiPropertyOptional({
    description: 'Only when AUTH_DEV_EXPOSE_OTP=true. Never in production.',
  })
  devOtp?: string;
}

class RoleAssignmentPublicDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;

  @ApiProperty()
  scopeType!: string;

  @ApiProperty()
  scopeId!: string;

  @ApiProperty()
  isActive!: boolean;
}

class UserPublicDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  phone!: string;

  @ApiProperty()
  phoneNormalized!: string;

  @ApiPropertyOptional()
  fullName!: string | null;

  @ApiPropertyOptional()
  city!: string | null;

  @ApiProperty({ enum: UserStatus })
  status!: UserStatus;

  @ApiProperty({ enum: UserRole })
  primaryRole!: UserRole;

  @ApiProperty()
  isPhoneVerified!: boolean;

  @ApiProperty({ type: [RoleAssignmentPublicDto] })
  roleAssignments!: RoleAssignmentPublicDto[];
}

export class VerifyOtpResponseDto {
  @ApiProperty({ type: UserPublicDto })
  user!: UserPublicDto;

  @ApiProperty({ description: 'Bearer access token (JWT)' })
  accessToken!: string;

  @ApiProperty({ description: 'Opaque refresh token; store securely (only hash in DB)' })
  refreshToken!: string;

  @ApiProperty()
  sessionId!: string;

  @ApiProperty({ description: 'Access token expiry (ISO 8601)' })
  expiresAt!: string;
}

export class LogoutResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;
}
