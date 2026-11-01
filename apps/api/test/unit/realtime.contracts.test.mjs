import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createRealtimeEvent,
  parseRealtimeSubscriptionRequest,
  roomForSubscription,
} from '../../dist/realtime/realtime.contracts.js';
import { hasSocketCredentialQuery, isSocketOriginAllowed } from '../../dist/realtime/restaurant-socket-io.adapter.js';

const organizationId = '11111111-1111-4111-8111-111111111111';
const branchId = '22222222-2222-4222-8222-222222222222';

test('los contratos técnicos son versionados, sin eventos comerciales ni salas elegidas por el cliente', () => {
  const request = parseRealtimeSubscriptionRequest({
    organizationId,
    branchId,
    eventTypes: ['technical.connection'],
    correlationId: '33333333-3333-4333-8333-333333333333',
  });
  assert.deepEqual(request, {
    organizationId,
    branchId,
    eventTypes: ['technical.connection'],
    correlationId: '33333333-3333-4333-8333-333333333333',
  });
  assert.equal(parseRealtimeSubscriptionRequest({ organizationId, eventTypes: ['order.created'] }), null);
  assert.equal(parseRealtimeSubscriptionRequest({ organizationId, eventTypes: [] }), null);
  assert.equal(parseRealtimeSubscriptionRequest({ organizationId: 'organization-a', eventTypes: ['technical.connection'] }), null);

  const event = createRealtimeEvent('technical.subscription.confirmed', { eventType: 'technical.connection' }, {
    organizationId,
    branchId,
    correlationId: '33333333-3333-4333-8333-333333333333',
  });
  assert.equal(event.version, '1');
  assert.match(event.eventId, /^[0-9a-f-]{36}$/i);
  assert.equal(event.organizationId, organizationId);
  assert.equal(event.branchId, branchId);
  assert.equal(event.correlationId, '33333333-3333-4333-8333-333333333333');
  assert.equal(roomForSubscription({ organizationId, branchId, eventType: 'technical.connection' }),
    `restaurant-os:v1:organization:${organizationId}:branch:${branchId}:event:technical.connection`);
});

test('valida Origin y rechaza tokens en query strings antes del handshake', () => {
  assert.equal(isSocketOriginAllowed('https://restaurant.local', ['https://restaurant.local']), true);
  assert.equal(isSocketOriginAllowed('https://other.local', ['https://restaurant.local']), false);
  assert.equal(isSocketOriginAllowed(undefined, []), true);
  assert.equal(hasSocketCredentialQuery({ url: '/socket.io/?EIO=4&transport=websocket&accessToken=secret' }), true);
  assert.equal(hasSocketCredentialQuery({ url: '/socket.io/?EIO=4&transport=websocket' }), false);
});
