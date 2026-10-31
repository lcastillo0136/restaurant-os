import assert from 'node:assert/strict';
import test from 'node:test';
import { createHttpLogEntry } from '../../dist/common/http/http-logging.interceptor.js';

test('el registro HTTP solo contiene metadatos seguros de la solicitud', () => {
  const request = {
    method: 'POST',
    path: '/api/v1/system/health',
    headers: { authorization: 'Bearer private-token' },
    body: { password: 'private-password' },
  };
  const response = { locals: { requestId: 'request-safe-id' }, statusCode: 200 };
  const entry = createHttpLogEntry(request, response, performance.now());

  assert.deepEqual(Object.keys(entry).sort(), ['durationMs', 'event', 'method', 'path', 'requestId', 'statusCode']);
  assert.equal(JSON.stringify(entry).includes('private-token'), false);
  assert.equal(JSON.stringify(entry).includes('private-password'), false);
});
