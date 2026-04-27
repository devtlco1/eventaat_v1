/**
 * DTO and response shapes aligned with `apps/api` auth endpoints (no backend coupling in runtime).
 */
import type { UserRole } from '../constants/roles.js';

export type OtpChannel = 'whatsapp' | 'sms' | 'manual';
export type OtpPurpose = 'login' | 'register' | 'phone_verification' | 'staff_invite';

export type RoleAssignmentPublic = {
  id: string;
  role: UserRole;
  scopeType: string;
  scopeId: string;
  isActive: boolean;
};

export type UserPublic = {
  id: string;
  phone: string;
  phoneNormalized: string;
  fullName: string | null;
  city: string | null;
  /** Aligned with API `UserStatus` enum (English keys). */
  status: string;
  primaryRole: UserRole;
  isPhoneVerified: boolean;
  roleAssignments: RoleAssignmentPublic[];
};

export type RequestOtpInput = {
  phone: string;
  purpose: OtpPurpose;
  channel: OtpChannel;
  fullName?: string;
  city?: string;
};

export type RequestOtpResult = {
  challengeId: string;
  /** ISO 8601 */
  expiresAt: string;
  channel: OtpChannel;
  purpose: OtpPurpose;
  devOtp?: string;
};

export type VerifyOtpInput = {
  challengeId: string;
  code: string;
  phone?: string;
};

export type VerifyOtpResult = {
  user: UserPublic;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  expiresAt: string;
};

export type MeResult = UserPublic;

export type LogoutInput = {
  sessionId?: string;
};
