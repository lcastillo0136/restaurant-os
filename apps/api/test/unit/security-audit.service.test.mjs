import assert from 'node:assert/strict';
import test from 'node:test';
import { SecurityAuditService } from '../../dist/security-audit/security-audit.service.js';

test('persiste solo metadatos permitidos y no propaga una falla secundaria de auditoría', async () => {
  const writes = [];
  const audit = new SecurityAuditService({ securityAuditEvent: { create: async ({ data }) => writes.push(data) } });
  await audit.record({ eventType: 'AUTH_LOGIN', result: 'SUCCESS', requestId: 'request-safe-id', actorUserId: 'user-1' });
  assert.deepEqual(writes[0], { eventType: 'AUTH_LOGIN', result: 'SUCCESS', requestId: 'request-safe-id', actorUserId: 'user-1', organizationId: undefined, branchId: undefined });

  const unavailable = new SecurityAuditService({ securityAuditEvent: { create: async () => { throw new Error('audit unavailable'); } } });
  await assert.doesNotReject(() => unavailable.record({ eventType: 'AUTH_LOGIN', result: 'FAILURE', requestId: 'request-safe-id' }));
});
