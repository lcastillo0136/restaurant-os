import assert from 'node:assert/strict';
import test from 'node:test';
import { AuthorizationService } from '../../dist/authorization/authorization.service.js';

const assignments = [
  {
    organizationId: 'organization-a', branchId: null, scope: 'ORGANIZATION',
    role: { code: 'ADMINISTRATOR', permissions: [{ permission: { code: 'auth.session.read', status: 'ACTIVE' } }] },
  },
  {
    organizationId: 'organization-b', branchId: 'branch-b1', scope: 'BRANCH',
    role: { code: 'CASHIER', permissions: [{ permission: { code: 'cash.open', status: 'ACTIVE' } }] },
  },
];

test('deniega por defecto y valida organización/sucursal contra asignaciones del servidor', async () => {
  const prisma = { userRole: { findMany: async () => assignments } };
  const authorization = new AuthorizationService(prisma);

  assert.equal(await authorization.hasPermissions('user-1', ['auth.session.read'], { organizationId: 'organization-a' }), true);
  assert.equal(await authorization.hasPermissions('user-1', ['cash.open'], { organizationId: 'organization-b', branchId: 'branch-b1' }), true);
  assert.equal(await authorization.hasPermissions('user-1', ['cash.open'], { organizationId: 'organization-b', branchId: 'branch-b2' }), false);
  assert.equal(await authorization.hasPermissions('user-1', ['cash.open'], { organizationId: 'organization-a' }), false);
  assert.equal(await authorization.hasPermissions('user-1', [], { organizationId: 'organization-a' }), false);
});
