import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../dist/generated/prisma/client.js';
import {
  loadDatabaseEnvironment,
  resolveDatabaseUrl,
} from '../../dist/database/database-environment.js';

loadDatabaseEnvironment();

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: resolveDatabaseUrl() }),
});

test('aísla asignaciones de rol entre organizaciones y conserva el alcance por sucursal', async () => {
  const suffix = randomUUID();

  await assert.rejects(
    prisma.$transaction(async (transaction) => {
      const [organizationA, organizationB] = await Promise.all([
        transaction.organization.create({
          data: { code: `isolation-a-${suffix}`, displayName: 'Organización técnica A' },
        }),
        transaction.organization.create({
          data: { code: `isolation-b-${suffix}`, displayName: 'Organización técnica B' },
        }),
      ]);
      const [branchA, branchB] = await Promise.all([
        transaction.branch.create({
          data: { organizationId: organizationA.id, code: `a-${suffix}`, displayName: 'Sucursal técnica A' },
        }),
        transaction.branch.create({
          data: { organizationId: organizationB.id, code: `b-${suffix}`, displayName: 'Sucursal técnica B' },
        }),
      ]);
      const [user, role] = await Promise.all([
        transaction.appUser.create({
          data: { identitySource: 'test', identitySubject: suffix },
        }),
        transaction.role.create({
          data: { code: `isolation-role-${suffix}`, displayName: 'Rol técnico de aislamiento' },
        }),
      ]);

      await transaction.userRole.createMany({
        data: [
          { organizationId: organizationA.id, userId: user.id, roleId: role.id, scope: 'ORGANIZATION' },
          { organizationId: organizationB.id, userId: user.id, roleId: role.id, scope: 'ORGANIZATION' },
          { organizationId: organizationA.id, userId: user.id, roleId: role.id, scope: 'BRANCH', branchId: branchA.id },
        ],
      });

      await transaction.userRole.create({
        data: {
          organizationId: organizationA.id,
          userId: user.id,
          roleId: role.id,
          scope: 'BRANCH',
          branchId: branchB.id,
        },
      });
    }),
    (error) => error && typeof error === 'object' && error.code === 'P2003',
  );
});

test.after(async () => {
  await prisma.$disconnect();
});
