import 'reflect-metadata';
import assert from 'node:assert/strict';
import test from 'node:test';
import { Reflector } from '@nestjs/core';
import { AuthorizationGuard } from '../../dist/authorization/authorization.guard.js';
import { AuthorizationService } from '../../dist/authorization/authorization.service.js';
import { WorkShiftsController } from '../../dist/employees/employees.controller.js';

function grant(userId, organizationId, scope, branchId, permissions) {
  return { userId, organizationId, branchId, scope, organization: { status: 'ACTIVE' }, branch: scope === 'BRANCH' ? { status: 'ACTIVE', organizationId } : null, role: { code: 'TEST_ROLE', status: 'ACTIVE', permissions: permissions.map((code) => ({ permission: { code, status: 'ACTIVE' } })) } };
}

function subject({ grants, branches, userId, organizationId = 'organization-a', branchId = 'branch-a' }) {
  const prisma = {
    userRole: { findMany: async ({ where }) => grants.filter((item) => item.userId === where.userId) },
    branch: { findFirst: async ({ where }) => branches.find((item) => item.id === where.id && item.organizationId === where.organizationId && item.status === where.status) ?? null },
  };
  const guard = new AuthorizationGuard(new Reflector(), new AuthorizationService(prisma));
  const request = { auth: { userId }, params: { organizationId, branchId } };
  return { guard, context: { getHandler: () => WorkShiftsController.prototype.assignShift, getClass: () => WorkShiftsController, switchToHttp: () => ({ getRequest: () => request }) } };
}

const activeBranches = [{ id: 'branch-a', organizationId: 'organization-a', status: 'ACTIVE' }, { id: 'branch-b', organizationId: 'organization-a', status: 'ACTIVE' }];

test('AuthorizationGuard real deniega usuario sin work-shifts.manage', async () => {
  const current = subject({ grants: [grant('without-permission', 'organization-a', 'ORGANIZATION', null, ['employees.read'])], branches: activeBranches, userId: 'without-permission' });
  await assert.rejects(() => current.guard.canActivate(current.context), { status: 403 });
});

test('AuthorizationGuard real no permite cruzar sucursales con grant BRANCH', async () => {
  const current = subject({ grants: [grant('branch-a-user', 'organization-a', 'BRANCH', 'branch-a', ['work-shifts.manage'])], branches: activeBranches, userId: 'branch-a-user', branchId: 'branch-b' });
  await assert.rejects(() => current.guard.canActivate(current.context), { status: 403 });
});

test('AuthorizationGuard real permite grant ORGANIZATION dentro de su organización', async () => {
  const current = subject({ grants: [grant('organization-user', 'organization-a', 'ORGANIZATION', null, ['work-shifts.manage'])], branches: activeBranches, userId: 'organization-user' });
  assert.equal(await current.guard.canActivate(current.context), true);
});

test('AuthorizationGuard real deniega otra organización y una sucursal inactiva', async () => {
  const otherOrganization = subject({ grants: [grant('other-user', 'organization-b', 'ORGANIZATION', null, ['work-shifts.manage'])], branches: activeBranches, userId: 'other-user' });
  await assert.rejects(() => otherOrganization.guard.canActivate(otherOrganization.context), { status: 403 });
  const inactiveBranch = subject({ grants: [grant('organization-user', 'organization-a', 'ORGANIZATION', null, ['work-shifts.manage'])], branches: [], userId: 'organization-user', branchId: 'branch-inactive' });
  await assert.rejects(() => inactiveBranch.guard.canActivate(inactiveBranch.context), { status: 403 });
});
