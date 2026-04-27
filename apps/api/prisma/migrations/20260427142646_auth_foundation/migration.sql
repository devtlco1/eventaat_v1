-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('customer', 'restaurant_owner', 'branch_manager', 'restaurant_host', 'call_center_agent', 'call_center_supervisor', 'operations_admin', 'content_manager', 'finance_manager', 'super_admin');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'pending_verification', 'suspended', 'disabled');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('login', 'register', 'phone_verification', 'staff_invite');

-- CreateEnum
CREATE TYPE "OtpChannel" AS ENUM ('whatsapp', 'sms', 'manual');

-- CreateEnum
CREATE TYPE "OtpStatus" AS ENUM ('pending', 'verified', 'expired', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "RoleScopeType" AS ENUM ('platform', 'restaurant', 'branch', 'call_center');

-- CreateEnum
CREATE TYPE "AuditActorType" AS ENUM ('user', 'system', 'support');

-- CreateTable
CREATE TABLE "foundation_schema_marker" (
    "id" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "foundation_schema_marker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phoneNormalized" TEXT NOT NULL,
    "fullName" TEXT,
    "city" TEXT,
    "status" "UserStatus" NOT NULL,
    "primaryRole" "UserRole" NOT NULL,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "disabledAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role_assignments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "scopeType" "RoleScopeType" NOT NULL,
    "scopeId" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_role_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_challenges" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "phone" TEXT NOT NULL,
    "phoneNormalized" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "channel" "OtpChannel" NOT NULL,
    "status" "OtpStatus" NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "providerMessageId" TEXT,
    "providerStatus" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "otp_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshTokenHash" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "revokedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorType" "AuditActorType" NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNormalized_key" ON "users"("phoneNormalized");

-- CreateIndex
CREATE INDEX "user_role_assignments_userId_role_scopeType_idx" ON "user_role_assignments"("userId", "role", "scopeType");

-- CreateIndex
CREATE INDEX "user_role_assignments_userId_isActive_idx" ON "user_role_assignments"("userId", "isActive");

-- CreateIndex
CREATE INDEX "user_role_assignments_scopeType_scopeId_idx" ON "user_role_assignments"("scopeType", "scopeId");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_assignments_userId_role_scopeType_scopeId_key" ON "user_role_assignments"("userId", "role", "scopeType", "scopeId");

-- CreateIndex
CREATE INDEX "otp_challenges_phoneNormalized_idx" ON "otp_challenges"("phoneNormalized");

-- CreateIndex
CREATE INDEX "otp_challenges_status_idx" ON "otp_challenges"("status");

-- CreateIndex
CREATE INDEX "otp_challenges_purpose_idx" ON "otp_challenges"("purpose");

-- CreateIndex
CREATE INDEX "otp_challenges_expiresAt_idx" ON "otp_challenges"("expiresAt");

-- CreateIndex
CREATE INDEX "otp_challenges_userId_idx" ON "otp_challenges"("userId");

-- CreateIndex
CREATE INDEX "user_sessions_userId_idx" ON "user_sessions"("userId");

-- CreateIndex
CREATE INDEX "user_sessions_expiresAt_idx" ON "user_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "user_sessions_revokedAt_idx" ON "user_sessions"("revokedAt");

-- CreateIndex
CREATE INDEX "audit_logs_actorUserId_idx" ON "audit_logs"("actorUserId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_challenges" ADD CONSTRAINT "otp_challenges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
