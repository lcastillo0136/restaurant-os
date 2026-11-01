import assert from 'node:assert/strict';
import test from 'node:test';
import { AuthService } from '../../dist/auth/auth.service.js';
import { LoginRateLimiterService } from '../../dist/auth/login-rate-limiter.service.js';
import { PasswordService } from '../../dist/auth/password.service.js';
import { RealtimeGateway } from '../../dist/realtime/realtime.gateway.js';
import { SecurityAuditService } from '../../dist/security-audit/security-audit.service.js';
import { SessionService } from '../../dist/auth/session.service.js';
import { AuthorizationService } from '../../dist/authorization/authorization.service.js';
import { createFoundationFixture } from '../fixtures/foundation-in-memory.mjs';

const passwordProfile = { memory: 8192, passes: 1, parallelism: 1, tagLength: 32 };
const sessionPolicy = { accessTokenTtlSeconds: 120, refreshTokenTtlSeconds: 900 };
const testPassphrase = 'integration-only-passphrase-not-a-production-secret';
const websocketEnvironment = {
  allowedOrigins: [], maxConnections: 10, maxMessageBytes: 1024,
  sessionRevalidationSeconds: 30, pingIntervalMs: 5000, pingTimeoutMs: 5000,
};

async function createServices() {
  const fixture = createFoundationFixture();
  const passwords = new PasswordService(passwordProfile);
  fixture.state.user.credential.passwordHash = await passwords.hash(testPassphrase);
  const sessions = new SessionService(fixture.prisma, sessionPolicy);
  const authorization = new AuthorizationService(fixture.prisma);
  const auth = new AuthService(
    fixture.prisma,
    passwords,
    sessions,
    new SecurityAuditService(fixture.prisma),
    new LoginRateLimiterService({ limit: 3, windowMs: 60_000 }),
  );
  const login = await auth.login(fixture.state.user.identitySubject, testPassphrase, 'realtime-integration-request');
  return { fixture, auth, authorization, login };
}

function socket(id, accessToken) {
  const events = [];
  const joined = [];
  const left = [];
  return {
    id,
    handshake: { auth: { accessToken }, query: {} },
    data: {},
    events,
    joined,
    left,
    disconnected: false,
    emit: (event, payload) => events.push({ event, payload }),
    join: async (room) => { joined.push(room); },
    leave: async (room) => { left.push(room); },
    disconnect(force) { this.disconnected = force; },
  };
}

test('integra sesión, RBAC, aislamiento de sucursal, revocación de permiso y reconexión sin duplicar sala', async () => {
  const { fixture, auth, authorization, login } = await createServices();
  const gateway = new RealtimeGateway(auth, authorization, websocketEnvironment);
  const client = socket('realtime-1', login.tokens.accessToken);
  await gateway.authenticateHandshake(client);
  gateway.handleConnection(client);

  await gateway.handleSubscribe(client, {
    organizationId: fixture.organizationId,
    branchId: '11111111-1111-4111-8111-111111111111',
    eventTypes: ['technical.connection'],
  });
  assert.equal(client.joined.length, 0);
  assert.equal(client.events.at(-1).payload.data.code, 'SUBSCRIPTION_DENIED');

  await gateway.handleSubscribe(client, {
    organizationId: fixture.organizationId,
    branchId: fixture.branchId,
    eventTypes: ['technical.connection'],
  });
  assert.equal(client.joined.length, 1);
  fixture.state.role.permissions[0].permission.status = 'INACTIVE';
  await gateway.revalidateConnections();
  assert.deepEqual(client.left, client.joined);
  assert.equal(client.events.at(-1).payload.data.code, 'SUBSCRIPTION_REVOKED');
  assert.equal(client.disconnected, false);

  fixture.state.role.permissions[0].permission.status = 'ACTIVE';
  gateway.handleDisconnect(client);
  const reconnected = socket('realtime-2', login.tokens.accessToken);
  await gateway.authenticateHandshake(reconnected);
  await gateway.handleSubscribe(reconnected, {
    organizationId: fixture.organizationId,
    branchId: fixture.branchId,
    eventTypes: ['technical.connection'],
  });
  assert.equal(reconnected.joined.length, 1);
  assert.equal(gateway.activeConnectionCount, 1);
});

test('desconecta de forma segura ante revocación de sesión o fallos simulados de los repositorios', async () => {
  const revoked = await createServices();
  const revokedGateway = new RealtimeGateway(revoked.auth, revoked.authorization, websocketEnvironment);
  const revokedClient = socket('realtime-revoked', revoked.login.tokens.accessToken);
  await revokedGateway.authenticateHandshake(revokedClient);
  await revoked.auth.logout(revokedClient.data.identity, 'realtime-logout');
  await revokedGateway.revalidateConnections();
  assert.equal(revokedClient.disconnected, true);
  assert.equal(revokedClient.events.at(-1).payload.data.code, 'SESSION_INVALID');

  const unavailable = await createServices();
  const unavailableGateway = new RealtimeGateway(unavailable.auth, unavailable.authorization, websocketEnvironment);
  const unavailableClient = socket('realtime-repository-error', unavailable.login.tokens.accessToken);
  await unavailableGateway.authenticateHandshake(unavailableClient);
  await unavailableGateway.handleSubscribe(unavailableClient, {
    organizationId: unavailable.fixture.organizationId,
    branchId: unavailable.fixture.branchId,
    eventTypes: ['technical.connection'],
  });
  unavailable.fixture.state.failAuthorizationReads = true;
  await unavailableGateway.revalidateConnections();
  assert.equal(unavailableClient.disconnected, true);
  assert.equal(unavailableClient.events.at(-1).payload.data.code, 'AUTHORIZATION_REVALIDATION_FAILED');
});
