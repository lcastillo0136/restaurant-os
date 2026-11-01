import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

export type PermissionGrant = Readonly<{
  organizationId: string;
  branchId: string | null;
  scope: 'ORGANIZATION' | 'BRANCH';
  roleCode: string;
  permissions: string[];
}>;

export type RequestedScope = Readonly<{
  organizationId: string;
  branchId?: string;
}>;

@Injectable()
export class AuthorizationService {
  constructor(private readonly prisma: PrismaService) {}

  async getGrants(userId: string): Promise<PermissionGrant[]> {
    const assignments = await this.prisma.userRole.findMany({
      where: {
        userId,
        role: { status: 'ACTIVE' },
        organization: { status: 'ACTIVE' },
      },
      include: {
        organization: true,
        branch: true,
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });
    return assignments
      .filter((assignment) => (
        assignment.organization.status === 'ACTIVE'
        && (
          (assignment.scope === 'ORGANIZATION' && assignment.branchId === null)
          || (
            assignment.scope === 'BRANCH'
            && assignment.branch !== null
            && assignment.branch.status === 'ACTIVE'
            && assignment.branch.organizationId === assignment.organizationId
          )
        )
      ))
      .map((assignment) => ({
        organizationId: assignment.organizationId,
        branchId: assignment.branchId,
        scope: assignment.scope,
        roleCode: assignment.role.code,
        permissions: assignment.role.permissions
          .filter(({ permission }) => permission.status === 'ACTIVE')
          .map(({ permission }) => permission.code),
      }));
  }

  async hasPermissions(userId: string, requiredPermissions: string[], scope: RequestedScope): Promise<boolean> {
    if (requiredPermissions.length === 0 || !scope.organizationId) return false;
    const grants = await this.getGrants(userId);
    return requiredPermissions.every((permission) => grants.some((grant) => (
      grant.permissions.includes(permission)
      && grant.organizationId === scope.organizationId
      && (
        grant.scope === 'ORGANIZATION'
        || (Boolean(scope.branchId) && grant.branchId === scope.branchId)
      )
    )));
  }
}
