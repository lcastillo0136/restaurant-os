import assert from 'node:assert/strict';
import test from 'node:test';
import { allowedCorsMethods, corsOptions } from '../../dist/common/http/cors-policy.js';

test('prepara preflight PATCH sólo para orígenes explícitos', () => {
  assert.equal(corsOptions([]), undefined);
  const options = corsOptions(['http://localhost:5173']);
  assert.deepEqual(options.origin, ['http://localhost:5173']);
  assert.equal(options.credentials, false);
  assert.equal(allowedCorsMethods.includes('PATCH'), true);
  assert.equal(allowedCorsMethods.includes('*'), false);
});
