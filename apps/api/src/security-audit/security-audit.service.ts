import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

export type SecurityAuditInput = Readonly<{
  eventType: string;
  result: 'SUCCESS' | 'FAILURE' | 'REVOKED' | 'RATE_LIMITED';
  requestId?: string;
  actorUserId?: string;
  organizationId?: string;
  branchId?: string;
}>;

@Injectable()
export class SecurityAuditService {
  private readonly logger = new Logger(SecurityAuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(input: SecurityAuditInput): Promise<void> {
    try {
      await this.prisma.securityAuditEvent.create({
        data: {
          eventType: input.eventType,
          result: input.result,
          requestId: input.requestId,
          actorUserId: input.actorUserId,
          organizationId: input.organizationId,
          branchId: input.branchId,
        },
      });
    } catch {
      this.logger.warn(JSON.stringify({
        event: 'security_audit_write_failed',
        eventType: input.eventType,
        requestId: input.requestId,
      }));
    }
  }
}
