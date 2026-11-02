import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { ChangeBranchStatusDto, CreateBranchDto, UpdateBranchDto } from './dto/branch.dto.js';
import { UpdateOrganizationDto } from './dto/organization.dto.js';

const organizationSelect = { id: true, code: true, displayName: true, status: true, createdAt: true, updatedAt: true } as const;
const branchSelect = { id: true, organizationId: true, code: true, displayName: true, timeZone: true, status: true, createdAt: true, updatedAt: true } as const;

function validTimeZone(value: string): boolean {
  try { Intl.DateTimeFormat('en-US', { timeZone: value }); return true; } catch { return false; }
}

function uniqueFailure(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'P2002';
}

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async organization(organizationId: string) {
    const organization = await this.prisma.organization.findFirst({ where: { id: organizationId, status: 'ACTIVE' }, select: organizationSelect });
    if (!organization) throw new NotFoundException();
    return organization;
  }

  async updateOrganization(organizationId: string, dto: UpdateOrganizationDto, actorUserId: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.organization.findFirst({ where: { id: organizationId, status: 'ACTIVE' }, select: { id: true } });
      if (!existing) throw new NotFoundException();
      const organization = await tx.organization.update({ where: { id: organizationId }, data: { displayName: dto.displayName }, select: organizationSelect });
      await tx.auditEvent.create({ data: { organizationId, actorUserId, eventType: 'ORGANIZATION_UPDATED', entityType: 'ORGANIZATION', entityId: organizationId, metadata: {} } });
      return organization;
    });
  }

  async branches(organizationId: string) {
    await this.organization(organizationId);
    return this.prisma.branch.findMany({ where: { organizationId }, select: branchSelect, orderBy: { code: 'asc' } });
  }

  async branch(organizationId: string, branchId: string) {
    const branch = await this.prisma.branch.findFirst({ where: { id: branchId, organizationId }, select: branchSelect });
    if (!branch) throw new NotFoundException();
    return branch;
  }

  async createBranch(organizationId: string, dto: CreateBranchDto, actorUserId: string) {
    if (!validTimeZone(dto.timeZone)) throw new ConflictException('Zona horaria inválida.');
    try {
      return await this.prisma.$transaction(async (tx) => {
        const organization = await tx.organization.findFirst({ where: { id: organizationId, status: 'ACTIVE' }, select: { id: true } });
        if (!organization) throw new NotFoundException();
        const branch = await tx.branch.create({ data: { organizationId, code: dto.code, displayName: dto.displayName, timeZone: dto.timeZone }, select: branchSelect });
        await tx.auditEvent.create({ data: { organizationId, branchId: branch.id, actorUserId, eventType: 'BRANCH_CREATED', entityType: 'BRANCH', entityId: branch.id, metadata: {} } });
        return branch;
      });
    } catch (error) { if (uniqueFailure(error)) throw new ConflictException('El código de sucursal ya existe en la organización.'); throw error; }
  }

  async updateBranch(organizationId: string, branchId: string, dto: UpdateBranchDto, actorUserId: string) {
    if (dto.timeZone && !validTimeZone(dto.timeZone)) throw new ConflictException('Zona horaria inválida.');
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.branch.findFirst({ where: { id: branchId, organizationId }, select: { id: true } });
      if (!existing) throw new NotFoundException();
      const branch = await tx.branch.update({ where: { id: branchId }, data: dto, select: branchSelect });
      await tx.auditEvent.create({ data: { organizationId, branchId, actorUserId, eventType: 'BRANCH_UPDATED', entityType: 'BRANCH', entityId: branchId, metadata: {} } });
      return branch;
    });
  }

  async changeBranchStatus(organizationId: string, branchId: string, dto: ChangeBranchStatusDto, actorUserId: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.branch.findFirst({ where: { id: branchId, organizationId }, select: { id: true, status: true } });
      if (!existing) throw new NotFoundException();
      const eventType = dto.status === existing.status ? 'BRANCH_UPDATED' : dto.status === 'ACTIVE' ? 'BRANCH_ACTIVATED' : 'BRANCH_DEACTIVATED';
      const branch = await tx.branch.update({ where: { id: branchId }, data: { status: dto.status }, select: branchSelect });
      await tx.auditEvent.create({ data: { organizationId, branchId, actorUserId, eventType, entityType: 'BRANCH', entityId: branchId, metadata: {} } });
      return branch;
    });
  }
}
