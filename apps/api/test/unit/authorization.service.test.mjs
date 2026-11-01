import assert from 'node:assert/strict';
import test from 'node:test';
import { AuthorizationService } from '../../dist/authorization/authorization.service.js';

const assignments = [
  {
    organizationId: 'organization-a', branchId: null, scope: 'ORGANIZATION',
    organization: { status: 'ACTIVE' }, branch: null,
    role: { code: 'ADMINISTRATOR', permissions: [{ permission: { code: 'auth.session.read', status: 'ACTIVE' } }] },
  },
  {
    organizationId: 'organization-b', branchId: 'branch-b1', scope: 'BRANCH',
    organization: { status: 'ACTIVE' }, branch: { status: 'ACTIVE', organizationId: 'organization-b' },
    role: { code: 'CASHIER', permissions: [{ permission: { code: 'cash.open', status: 'ACTIVE' } }] },
  },
];

function prismaWithBranches(branches) {
  return {
    userRole: { findMany: async () => assignments },
    branch: {
      findFirst: async ({ where }) => branches.find((branch) => (
        branch.id === where.id
        && branch.organizationId === where.organizationId
        && branch.status === where.status
      )) ?? null,
    },
  };
}

test('deniega por defecto y valida organización/sucursal contra asignaciones del servidor', async () => {
  const prisma = prismaWithBranches([{ id: 'branch-b1', organizationId: 'organization-b', status: 'ACTIVE' }]);
  const authorization = new AuthorizationService(prisma);

  assert.equal(await authorization.hasPermissions('user-1', ['auth.session.read'], { organizationId: 'organization-a' }), true);
  assert.equal(await authorization.hasPermissions('user-1', ['cash.open'], { organizationId: 'organization-b', branchId: 'branch-b1' }), true);
  assert.equal(await authorization.hasPermissions('user-1', ['cash.open'], { organizationId: 'organization-b', branchId: 'branch-b2' }), false);
  assert.equal(await authorization.hasPermissions('user-1', ['cash.open'], { organizationId: 'organization-a' }), false);
  assert.equal(await authorization.hasPermissions('user-1', [], { organizationId: 'organization-a' }), false);
});

test('rechaza organizaciones inactivas, sucursales inactivas e incongruencias de ámbito', async () => {
  const invalidAssignments = [
    {
      organizationId: 'organization-inactive', branchId: null, scope: 'ORGANIZATION',
      organization: { status: 'INACTIVE' }, branch: null,
      role: { code: 'ADMINISTRATOR', permissions: [{ permission: { code: 'auth.session.read', status: 'ACTIVE' } }] },
    },
    {
      organizationId: 'organization-b', branchId: 'branch-inactive', scope: 'BRANCH',
      organization: { status: 'ACTIVE' }, branch: { status: 'INACTIVE', organizationId: 'organization-b' },
      role: { code: 'CASHIER', permissions: [{ permission: { code: 'cash.open', status: 'ACTIVE' } }] },
    },
    {
      organizationId: 'organization-b', branchId: 'branch-other-organization', scope: 'BRANCH',
      organization: { status: 'ACTIVE' }, branch: { status: 'ACTIVE', organizationId: 'organization-c' },
      role: { code: 'CASHIER', permissions: [{ permission: { code: 'cash.open', status: 'ACTIVE' } }] },
    },
  ];
  const prisma = { userRole: { findMany: async () => invalidAssignments }, branch: { findFirst: async () => null } };
  const authorization = new AuthorizationService(prisma);

  assert.equal(await authorization.hasPermissions('user-1', ['auth.session.read'], { organizationId: 'organization-inactive' }), false);
  assert.equal(await authorization.hasPermissions('user-1', ['cash.open'], { organizationId: 'organization-b', branchId: 'branch-inactive' }), false);
  assert.equal(await authorization.hasPermissions('user-1', ['cash.open'], { organizationId: 'organization-b', branchId: 'branch-other-organization' }), false);
});

test('valida la sucursal solicitada también para grants organizacionales', async () => {
  const branchCalls = [];
  const organizationOnlyAssignments = [assignments[0]];
  const prisma = {
    userRole: { findMany: async () => organizationOnlyAssignments },
    branch: {
      findFirst: async ({ where }) => {
        branchCalls.push(where);
        if (where.id === 'branch-a1' && where.organizationId === 'organization-a' && where.status === 'ACTIVE') {
          return { id: 'branch-a1' };
        }
        return null;
      },
    },
  };
  const authorization = new AuthorizationService(prisma);

  assert.equal(await authorization.hasPermissions('user-1', ['auth.session.read'], { organizationId: 'organization-a', branchId: 'branch-a1' }), true);
  assert.equal(await authorization.hasPermissions('user-1', ['auth.session.read'], { organizationId: 'organization-a', branchId: 'branch-inactive' }), false);
  assert.equal(await authorization.hasPermissions('user-1', ['auth.session.read'], { organizationId: 'organization-a', branchId: 'branch-other-organization' }), false);
  assert.deepEqual(branchCalls, [
    { id: 'branch-a1', organizationId: 'organization-a', status: 'ACTIVE' },
    { id: 'branch-inactive', organizationId: 'organization-a', status: 'ACTIVE' },
    { id: 'branch-other-organization', organizationId: 'organization-a', status: 'ACTIVE' },
  ]);
});
