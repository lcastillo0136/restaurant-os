import assert from 'node:assert/strict';
import test from 'node:test';
import { RealtimeGateway } from '../../dist/realtime/realtime.gateway.js';

const accessToken = 'x'.repeat(43);
const organizationId = '11111111-1111-4111-8111-111111111111';
const branchId = '22222222-2222-4222-8222-222222222222';
const identity = Object.freeze({
  sessionId: 'session-1',
  userId: 'user-1',
  identitySource: 'LOCAL',
  identitySubject: 'operator',
  displayName: 'Operador',
});

function environment(overrides = {}) {
  return {
    allowedOrigins: [],
    maxConnections: 100,
    maxMessageBytes: 1024,
    sessionRevalidationSeconds: 60,
    pingIntervalMs: 25000,
    pingTimeoutMs: 20000,
    ...overrides,
  };
}

function socket(id = 'socket-1', token = accessToken) {
  const events = [];
  const rooms = [];
  return {
    id,
    handshake: { auth: token ? { accessToken: token } : {}, query: {} },
    data: {},
    events,
    rooms,
    disconnected: false,
    emit: (event, payload) => events.push({ event, payload }),
    join: async (room) => { rooms.push(room); },
    disconnect(force) { this.disconnected = force; },
  };
}

function gateway({ validSession = true, allowed = true, config = {} } = {}) {
  const auth = {
    authenticate: async (token) => {
      if (!validSession || token !== accessToken) throw Object.assign(new Error('invalid'), { status: 401 });
      return identity;
    },
  };
  const authorization = { hasPermissions: async () => allowed };
  return new RealtimeGateway(auth, authorization, environment(config));
}

test('acepta una conexión autenticada por sesión y nunca por identidad declarada', async () => {
  const realtime = gateway();
  const client = socket();
  await realtime.authenticateHandshake(client);
  realtime.handleConnection(client);

  assert.equal(client.data.identity.userId, 'user-1');
  assert.equal(realtime.activeConnectionCount, 1);
  assert.equal(client.events[0].event, 'server.realtime.event');
  assert.equal(client.events[0].payload.type, 'technical.connection.ready');

  const anonymous = socket('socket-2', '');
  await assert.rejects(() => realtime.authenticateHandshake(anonymous), /unauthorized/);
  assert.equal(anonymous.data.identity, undefined);
});

test('autoriza suscripciones por alcance del servidor y deniega una sucursal de otra organización', async () => {
  const calls = [];
  const realtime = new RealtimeGateway(
    { authenticate: async () => identity },
    { hasPermissions: async (userId, permissions, scope) => {
      calls.push({ userId, permissions, scope });
      return scope.organizationId === organizationId && scope.branchId === branchId;
    } },
    environment(),
  );
  const client = socket();
  await realtime.authenticateHandshake(client);
  realtime.handleConnection(client);

  await realtime.handleSubscribe(client, { organizationId, branchId, eventTypes: ['technical.connection'] });
  assert.equal(client.rooms.length, 1);
  assert.equal(client.events.at(-1).payload.type, 'technical.subscription.confirmed');
  assert.deepEqual(calls[0], {
    userId: 'user-1',
    permissions: ['auth.session.read'],
    scope: { organizationId, branchId },
  });

  await realtime.handleSubscribe(client, {
    organizationId,
    branchId: '44444444-4444-4444-8444-444444444444',
    eventTypes: ['technical.connection'],
  });
  assert.equal(client.rooms.length, 1);
  assert.equal(client.events.at(-1).payload.data.code, 'SUBSCRIPTION_DENIED');
});

test('rechaza mensajes excesivos antes de evaluar la suscripción', async () => {
  const realtime = gateway();
  const client = socket();
  await realtime.authenticateHandshake(client);
  realtime.handleConnection(client);
  await realtime.handleSubscribe(client, { organizationId, eventTypes: ['technical.connection'], padding: 'x'.repeat(2048) });
  assert.equal(client.events.at(-1).payload.data.code, 'MESSAGE_TOO_LARGE');
});

test('revalida sesiones activas, desconecta una revocada y limpia recursos', async () => {
  let validSession = true;
  const auth = { authenticate: async () => {
    if (!validSession) throw Object.assign(new Error('revoked'), { status: 401 });
    return identity;
  } };
  const realtime = new RealtimeGateway(auth, { hasPermissions: async () => true }, environment());
  const client = socket();
  await realtime.authenticateHandshake(client);
  realtime.handleConnection(client);
  validSession = false;
  await realtime.revalidateConnections();

  assert.equal(client.disconnected, true);
  assert.equal(client.events.at(-1).payload.data.code, 'SESSION_INVALID');
  assert.equal(realtime.activeConnectionCount, 0);
  realtime.handleDisconnect(client);
  assert.equal(realtime.activeConnectionCount, 0);
});

test('limita conexiones simultáneas sin registrar credenciales', async () => {
  const realtime = gateway({ config: { maxConnections: 1 } });
  const first = socket('socket-first');
  const second = socket('socket-second');
  await realtime.authenticateHandshake(first);
  realtime.handleConnection(first);
  await realtime.authenticateHandshake(second);
  realtime.handleConnection(second);

  assert.equal(second.disconnected, true);
  assert.equal(second.events.at(-1).payload.data.code, 'CONNECTION_LIMIT_REACHED');
  assert.equal(realtime.activeConnectionCount, 1);
});

test('rechaza sesiones expiradas o revocadas durante el handshake', async () => {
  for (const status of ['expired', 'revoked']) {
    const realtime = new RealtimeGateway(
      { authenticate: async () => { throw Object.assign(new Error(status), { status: 401 }); } },
      { hasPermissions: async () => true },
      environment(),
    );
    await assert.rejects(() => realtime.authenticateHandshake(socket(`socket-${status}`)), /unauthorized|expired|revoked/);
  }
});
