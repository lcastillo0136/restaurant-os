import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { createValidationPipe } from '../../dist/common/http/validation.pipe.js';
import { BranchStatusController } from '../../dist/organizations/organizations.controller.js';
import { CreateBranchDto, UpdateBranchDto } from '../../dist/organizations/dto/branch.dto.js';

async function validate(type, value) {
  return createValidationPipe().transform(value, { type: 'body', metatype: type });
}

test('ValidationPipe rechaza null, blancos, propiedades desconocidas e inmutables', async () => {
  await assert.rejects(() => validate(UpdateBranchDto, { displayName: null }), { status: 400 });
  await assert.rejects(() => validate(UpdateBranchDto, { timeZone: null }), { status: 400 });
  const absent = await validate(UpdateBranchDto, {});
  assert.equal(absent.displayName, undefined);
  assert.equal(absent.timeZone, undefined);
  await assert.rejects(() => validate(CreateBranchDto, { code: 'centro', displayName: '   ', timeZone: 'America/Mexico_City' }), { status: 400 });
  await assert.rejects(() => validate(UpdateBranchDto, { code: 'new-code' }), { status: 400 });
  await assert.rejects(() => validate(UpdateBranchDto, { id: randomUUID() }), { status: 400 });
});

test('solo grant ORGANIZATION puede cambiar estado de sucursal', async () => {
  const organizationId = randomUUID(); const branchId = randomUUID(); const calls = [];
  const organizations = { changeBranchStatus: async (...args) => { calls.push(args); return { id: branchId, status: 'ACTIVE' }; } };
  const branchOnly = new BranchStatusController(organizations, { getGrants: async () => [{ organizationId, scope: 'BRANCH', permissions: ['branches.manage'] }] });
  await assert.rejects(() => branchOnly.change({ auth: { userId: randomUUID() } }, organizationId, branchId, { status: 'ACTIVE' }), { status: 403 });
  assert.equal(calls.length, 0);
  const organizationAdmin = new BranchStatusController(organizations, { getGrants: async () => [{ organizationId, scope: 'ORGANIZATION', permissions: ['branches.manage'] }] });
  await organizationAdmin.change({ auth: { userId: 'admin' } }, organizationId, branchId, { status: 'ACTIVE' });
  assert.equal(calls.length, 1);
});
