import assert from 'node:assert/strict';
import test from 'node:test';
import { SessionService } from '../../dist/auth/session.service.js';

const policy = { accessTokenTtlSeconds: 60, refreshTokenTtlSeconds: 600 };
const user = { id: 'user-1', identitySource: 'LOCAL', identitySubject: 'operator', displayName: 'Operator', status: 'ACTIVE' };

function sessionPrisma() {
  let record;
  return {
    authSession: {
      create: async ({ data }) => {
        record = { id: 'session-1', revokedAt: null, lastUsedAt: null, user, ...data };
        return record;
      },
      findUnique: async ({ where }) => {
        if (!record) return null;
        if (where.accessTokenHash === record.accessTokenHash || where.refreshTokenHash === record.refreshTokenHash) return record;
        return null;
      },
      updateMany: async ({ where, data }) => {
        if (!record || record.id !== where.id || record.revokedAt !== where.revokedAt) return { count: 0 };
        if (where.refreshTokenHash && record.refreshTokenHash !== where.refreshTokenHash) return { count: 0 };
        Object.assign(record, data);
        return { count: 1 };
      },
    },
    get record() { return record; },
  };
}

test('emite, rota y revoca tokens opacos sin almacenar sus valores', async () => {
  const prisma = sessionPrisma();
  const sessions = new SessionService(prisma, policy);
  const now = new Date('2026-11-01T00:00:00Z');
  const issued = await sessions.issue(user.id, now);

  assert.equal(prisma.record.accessTokenHash.includes(issued.accessToken), false);
  assert.equal(prisma.record.refreshTokenHash.includes(issued.refreshToken), false);
  assert.equal((await sessions.authenticate(issued.accessToken, now))?.userId, user.id);

  const rotated = await sessions.rotate(issued.refreshToken, now);
  assert.ok(rotated);
  assert.notEqual(rotated.tokens.refreshToken, issued.refreshToken);
  assert.equal(await sessions.rotate(issued.refreshToken, now), null);
  assert.equal(await sessions.revoke('session-1', now), true);
  assert.equal(await sessions.authenticate(rotated.tokens.accessToken, now), null);
});

test('rechaza tokens expirados y usuarios suspendidos', async () => {
  const prisma = sessionPrisma();
  const sessions = new SessionService(prisma, policy);
  const now = new Date('2026-11-01T00:00:00Z');
  const issued = await sessions.issue(user.id, now);
  assert.equal(await sessions.authenticate(issued.accessToken, new Date('2026-11-01T00:01:01Z')), null);
  prisma.record.user.status = 'SUSPENDED';
  assert.equal(await sessions.authenticate(issued.accessToken, now), null);
});
