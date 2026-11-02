import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { OrganizationsService } from '../../dist/organizations/organizations.service.js';

function fixture() {
  const organizationId = randomUUID(); const otherOrganizationId = randomUUID(); const branches = []; const audits = [];
  const organizations = [{ id: organizationId, code: 'main', displayName: 'Principal', status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() }];
  const prisma = {
    organization: { findFirst: async ({ where }) => organizations.find((item) => item.id === where.id && item.status === where.status) ?? null },
    branch: {
      findMany: async ({ where }) => branches.filter((item) => item.organizationId === where.organizationId),
      findFirst: async ({ where }) => branches.find((item) => item.id === where.id && item.organizationId === where.organizationId) ?? null,
    },
    $transaction: async (work) => work({
      organization: { findFirst: async ({ where }) => organizations.find((item) => item.id === where.id && item.status === where.status) ?? null, update: async ({ where, data }) => Object.assign(organizations.find((item) => item.id === where.id), data) },
      branch: {
        findFirst: async ({ where }) => branches.find((item) => item.id === where.id && item.organizationId === where.organizationId) ?? null,
        create: async ({ data }) => { if (branches.some((item) => item.organizationId === data.organizationId && item.code === data.code)) { const error = new Error(); error.code = 'P2002'; throw error; } const branch = { id: randomUUID(), status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date(), ...data }; branches.push(branch); return branch; },
        update: async ({ where, data }) => Object.assign(branches.find((item) => item.id === where.id), data),
      },
      auditEvent: { create: async ({ data }) => { audits.push(data); } },
    }),
  };
  return { service: new OrganizationsService(prisma), organizationId, otherOrganizationId, branches, audits };
}

test('administra sucursales aisladas, valida duplicados y audita cambios', async () => {
  const { service, organizationId, otherOrganizationId, branches, audits } = fixture();
  const actor = randomUUID();
  const created = await service.createBranch(organizationId, { code: 'centro', displayName: 'Centro', timeZone: 'America/Mexico_City' }, actor);
  assert.equal(created.organizationId, organizationId);
  await assert.rejects(() => service.createBranch(organizationId, { code: 'centro', displayName: 'Duplicada', timeZone: 'America/Mexico_City' }, actor), { status: 409 });
  await assert.rejects(() => service.branch(otherOrganizationId, created.id), { status: 404 });
  const updated = await service.changeBranchStatus(organizationId, created.id, { status: 'INACTIVE' }, actor);
  assert.equal(updated.status, 'INACTIVE');
  const reactivated = await service.changeBranchStatus(organizationId, created.id, { status: 'ACTIVE' }, actor);
  assert.equal(reactivated.status, 'ACTIVE');
  assert.deepEqual(audits.map((item) => item.eventType), ['BRANCH_CREATED', 'BRANCH_DEACTIVATED', 'BRANCH_ACTIVATED']);
  assert.equal(branches.length, 1);
});
