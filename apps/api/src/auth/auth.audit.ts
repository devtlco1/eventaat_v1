import { AuditActorType, Prisma } from '../../generated/client';
import type { PrismaService } from '../prisma/prisma.service';

export type AuditInput = {
  action: string;
  actorUserId: string | null;
  entityType?: string;
  entityId?: string;
  metadata?: Prisma.JsonValue;
  ipAddress?: string;
  userAgent?: string;
};

/**
 * Appends a row to `AuditLog` (no PII in action codes).
 */
export async function writeAudit(
  prisma: PrismaService,
  input: AuditInput,
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorType: input.actorUserId != null ? AuditActorType.user : AuditActorType.system,
      action: input.action,
      actorUserId: input.actorUserId,
      entityType: input.entityType,
      entityId: input.entityId,
      ...(input.metadata != null ? { metadata: input.metadata as Prisma.InputJsonValue } : {}),
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });
}
