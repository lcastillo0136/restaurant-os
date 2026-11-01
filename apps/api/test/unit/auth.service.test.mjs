import assert from 'node:assert/strict';
import test from 'node:test';
import { AuthService } from '../../dist/auth/auth.service.js';
import { LoginRateLimiterService } from '../../dist/auth/login-rate-limiter.service.js';

function dependencies({ status = 'ACTIVE', passwordValid = true } = {}) {
  const auditEvents = [];
  const user = {
    id: 'user-1', identitySource: 'LOCAL', identitySubject: 'operator', displayName: 'Operator', status,
    credential: { passwordHash: 'argon2id-placeholder' },
  };
  return {
    prisma: { appUser: { findFirst: async () => user } },
    passwords: { verify: async () => passwordValid },
    sessions: {
      issue: async () => ({ accessToken: 'a'.repeat(43), accessExpiresAt: new Date(), refreshToken: 'b'.repeat(43), refreshExpiresAt: new Date() }),
      rotate: async () => null,
      authenticate: async () => null,
      revoke: async () => true,
    },
    audit: { record: async (event) => auditEvents.push(event) },
    auditEvents,
  };
}

test('normaliza identidad, entrega tokens solo con credenciales válidas y no audita la contraseña', async () => {
  const deps = dependencies();
  const service = new AuthService(deps.prisma, deps.passwords, deps.sessions, deps.audit, new LoginRateLimiterService({ limit: 5, windowMs: 60_000 }));
  const result = await service.login('  OPERATOR  ', 'long passphrase for test only', 'request-1');

  assert.equal(result.user.identitySubject, 'operator');
  assert.equal(result.tokens.accessToken.length, 43);
  assert.deepEqual(deps.auditEvents, [{ eventType: 'AUTH_LOGIN', result: 'SUCCESS', requestId: 'request-1', actorUserId: 'user-1' }]);
  assert.equal(JSON.stringify(deps.auditEvents).includes('passphrase'), false);
});

test('usa el mismo rechazo para credenciales inválidas y usuarios suspendidos', async () => {
  for (const input of [{ passwordValid: false }, { status: 'SUSPENDED' }]) {
    const deps = dependencies(input);
    const service = new AuthService(deps.prisma, deps.passwords, deps.sessions, deps.audit, new LoginRateLimiterService({ limit: 5, windowMs: 60_000 }));
    await assert.rejects(() => service.login('operator', 'long passphrase for test only', 'request-2'), { status: 401 });
    assert.equal(deps.auditEvents[0].result, 'FAILURE');
  }
});

test('limita intentos repetidos sin bloquear indefinidamente', async () => {
  const limiter = new LoginRateLimiterService({ limit: 2, windowMs: 1_000 });
  assert.equal(limiter.consume('login:operator', 0), true);
  assert.equal(limiter.consume('login:operator', 1), true);
  assert.equal(limiter.consume('login:operator', 2), false);
  assert.equal(limiter.consume('login:operator', 1_001), true);
});
