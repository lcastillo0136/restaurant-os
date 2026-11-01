import assert from 'node:assert/strict';
import test from 'node:test';
import {
  bodyLimitExceptionMiddleware,
  requestContextMiddleware,
  securityHeadersMiddleware,
} from '../../dist/common/http/request-context.middleware.js';

function response() {
  return {
    locals: {},
    headers: new Map(),
    statusCode: undefined,
    body: undefined,
    setHeader(name, value) { this.headers.set(name, value); },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test('crea identificador por solicitud y encabezados de seguridad', () => {
  const target = response();
  requestContextMiddleware({}, target, () => {});
  securityHeadersMiddleware({}, target, () => {});

  assert.match(target.headers.get('x-request-id'), /^[0-9a-f-]{36}$/i);
  assert.equal(target.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.equal(target.headers.get('X-Frame-Options'), 'DENY');
});

test('convierte un JSON excesivo en 413 seguro con encabezados e identificador de solicitud', () => {
  const target = response();
  requestContextMiddleware({}, target, () => {});
  securityHeadersMiddleware({}, target, () => {});
  const requestId = target.headers.get('x-request-id');
  bodyLimitExceptionMiddleware({ status: 413, type: 'entity.too.large' }, { path: '/api/v1/system/health' }, target, () => {
    throw new Error('no debe continuar');
  });

  assert.equal(target.statusCode, 413);
  assert.equal(target.body.code, 'PAYLOAD_TOO_LARGE');
  assert.equal(target.body.requestId, requestId);
  assert.equal(target.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.equal(target.headers.get('X-Frame-Options'), 'DENY');
  assert.equal(target.headers.get('Referrer-Policy'), 'no-referrer');
  assert.equal(target.headers.get('Permissions-Policy'), 'camera=(), geolocation=(), microphone=()');
});
