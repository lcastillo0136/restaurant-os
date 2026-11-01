import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { AuthController } from '../../dist/auth/auth.controller.js';
import { AuthGuard } from '../../dist/auth/auth.guard.js';
import { AuthService } from '../../dist/auth/auth.service.js';
import { LoginRateLimiterService } from '../../dist/auth/login-rate-limiter.service.js';
import { PasswordService } from '../../dist/auth/password.service.js';
import { SessionService } from '../../dist/auth/session.service.js';
import { AuthorizationService } from '../../dist/authorization/authorization.service.js';
import { AuthorizationGuard } from '../../dist/authorization/authorization.guard.js';
import { SecurityAuditService } from '../../dist/security-audit/security-audit.service.js';
import { createFoundationFixture } from '../fixtures/foundation-in-memory.mjs';

const passwordProfile = { memory: 8192, passes: 1, parallelism: 1, tagLength: 32 };
const sessionPolicy = { accessTokenTtlSeconds: 120, refreshTokenTtlSeconds: 900 };
const testPassphrase = 'integration-only-passphrase-not-a-production-secret';

async function createServices() {
  const fixture = createFoundationFixture();
  const passwords = new PasswordService(passwordProfile);
  fixture.state.user.credential.passwordHash = await passwords.hash(testPassphrase);
  const sessions = new SessionService(fixture.prisma, sessionPolicy);
  const authorization = new AuthorizationService(fixture.prisma);
  const audit = new SecurityAuditService(fixture.prisma);
  const auth = new AuthService(
    fixture.prisma,
    passwords,
    sessions,
    audit,
    new LoginRateLimiterService({ limit: 3, windowMs: 60_000 }),
  );
  return { fixture, sessions, authorization, auth, controller: new AuthController(auth, authorization) };
}

function response() {
  return { locals: { requestId: randomUUID() } };
}

function guardContext(request) {
  return { switchToHttp: () => ({ getRequest: () => request }) };
}

test('integra login, guard, identidad, rotación, logout, RBAC y auditoría sin persistencia PostgreSQL', async () => {
  const { fixture, authorization, auth, controller } = await createServices();
  const login = await controller.login({ identifier: `  ${fixture.state.user.identitySubject.toUpperCase()}  `, password: testPassphrase }, response());

  assert.equal(login.user.id, fixture.userId);
  assert.equal(login.tokens.accessToken.length, 43);
  assert.equal(JSON.stringify(fixture.sessions).includes(login.tokens.accessToken), false);
  assert.equal(JSON.stringify(fixture.audits).includes(login.tokens.accessToken), false);
  assert.equal(JSON.stringify(fixture.audits).includes(testPassphrase), false);

  const request = {
    header: (name) => name === 'authorization' ? `Bearer ${login.tokens.accessToken}` : undefined,
    params: { organizationId: fixture.organizationId, branchId: fixture.branchId },
  };
  const authGuard = new AuthGuard(auth);
  assert.equal(await authGuard.canActivate(guardContext(request)), true);
  const identity = await controller.me(request);
  assert.equal(identity.user.id, fixture.userId);
  assert.deepEqual(identity.grants.map((grant) => grant.permissions), [['auth.session.read']]);

  const reflector = {
    getAllAndOverride: (key) => key === 'restaurant-os:required-permissions'
      ? ['auth.session.read']
      : { organizationParam: 'organizationId', branchParam: 'branchId' },
  };
  const authorizationGuard = new AuthorizationGuard(reflector, authorization);
  assert.equal(await authorizationGuard.canActivate({
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => request }),
  }), true);

  const refreshed = await controller.refresh({ refreshToken: login.tokens.refreshToken }, response());
  await assert.rejects(() => auth.authenticate(login.tokens.accessToken), { status: 401 });
  const refreshedRequest = {
    header: (name) => name === 'authorization' ? `Bearer ${refreshed.tokens.accessToken}` : undefined,
    params: {},
  };
  await authGuard.canActivate(guardContext(refreshedRequest));
  await controller.logout(refreshedRequest, response());
  await assert.rejects(() => authGuard.canActivate(guardContext(refreshedRequest)), { status: 401 });
  assert.deepEqual(fixture.audits.map((event) => event.eventType), ['AUTH_LOGIN', 'AUTH_REFRESH', 'AUTH_LOGOUT']);
});

test('mantiene errores de autenticación seguros para credenciales inválidas, usuario deshabilitado y rate limit', async () => {
  const { fixture, auth } = await createServices();
  const identifier = fixture.state.user.identitySubject;
  await assert.rejects(() => auth.login(identifier, 'incorrect-integration-passphrase', 'request-invalid-1'), { status: 401 });
  fixture.state.user.status = 'SUSPENDED';
  await assert.rejects(() => auth.login(identifier, testPassphrase, 'request-invalid-2'), { status: 401 });
  await assert.rejects(() => auth.login(identifier, testPassphrase, 'request-invalid-3'), { status: 401 });
  await assert.rejects(() => auth.login(identifier, testPassphrase, 'request-invalid-4'), { status: 429 });
});
