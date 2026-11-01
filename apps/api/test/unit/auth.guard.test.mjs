import assert from 'node:assert/strict';
import test from 'node:test';
import { AuthGuard } from '../../dist/auth/auth.guard.js';

function contextFor(authorization) {
  const request = {
    header: (name) => name === 'authorization' ? authorization : undefined,
  };
  return {
    request,
    context: { switchToHttp: () => ({ getRequest: () => request }) },
  };
}

test('rechaza tokens manipulados o con formato inválido antes de autorizar la solicitud', async () => {
  const auth = { authenticate: async () => { throw Object.assign(new Error('invalid token'), { status: 401 }); } };
  const guard = new AuthGuard(auth);
  const malformed = contextFor('Bearer not-a-valid-token');
  await assert.rejects(() => guard.canActivate(malformed.context), { status: 401 });

  const tampered = contextFor(`Bearer ${'x'.repeat(43)}`);
  await assert.rejects(() => guard.canActivate(tampered.context), { status: 401 });
  assert.equal(tampered.request.auth, undefined);
});
