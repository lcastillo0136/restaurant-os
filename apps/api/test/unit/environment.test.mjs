import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveApiEnvironment, resolveAuthEnvironment } from '../../dist/environment.js';

test('resuelve configuración local segura por defecto', () => {
  assert.deepEqual(resolveApiEnvironment({}), {
    host: '127.0.0.1',
    port: 3000,
    executionMode: 'development',
    allowedOrigins: [],
    bodyLimitBytes: 65536,
  });
});

test('normaliza una lista explícita de orígenes permitidos', () => {
  const environment = resolveApiEnvironment({
    API_HOST: '0.0.0.0',
    API_PORT: '3100',
    API_EXECUTION_MODE: 'test',
    API_ALLOWED_ORIGINS: 'http://localhost:5173, https://restaurant.local, http://localhost:5173',
  });

  assert.deepEqual(environment.allowedOrigins, ['http://localhost:5173', 'https://restaurant.local']);
  assert.equal(environment.port, 3100);
});

test('rechaza puertos y orígenes inseguros o inválidos', () => {
  assert.throws(() => resolveApiEnvironment({ API_PORT: '0' }), /API_PORT/);
  assert.throws(() => resolveApiEnvironment({ API_PORT: '3000.5' }), /API_PORT/);
  assert.throws(() => resolveApiEnvironment({ API_ALLOWED_ORIGINS: '*' }), /API_ALLOWED_ORIGINS/);
  assert.throws(() => resolveApiEnvironment({ API_HOST: 'https://example.test' }), /API_HOST/);
  assert.throws(() => resolveApiEnvironment({ API_BODY_LIMIT_BYTES: '100' }), /API_BODY_LIMIT_BYTES/);
  assert.throws(
    () => resolveApiEnvironment({ API_EXECUTION_MODE: 'production', API_HOST: '0.0.0.0' }),
    /loopback/,
  );
});

test('resuelve expiraciones y límite de intentos de autenticación con límites seguros', () => {
  assert.deepEqual(resolveAuthEnvironment({}), {
    accessTokenTtlSeconds: 900,
    refreshTokenTtlSeconds: 604800,
    loginAttemptLimit: 5,
    loginAttemptWindowSeconds: 900,
  });
  assert.throws(() => resolveAuthEnvironment({ AUTH_ACCESS_TOKEN_TTL_SECONDS: '0' }), /AUTH_ACCESS_TOKEN_TTL_SECONDS/);
  assert.throws(() => resolveAuthEnvironment({ AUTH_ACCESS_TOKEN_TTL_SECONDS: '3600', AUTH_REFRESH_TOKEN_TTL_SECONDS: '3600' }), /mayor/);
});
