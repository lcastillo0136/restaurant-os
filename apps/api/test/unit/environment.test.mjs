import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveApiEnvironment } from '../../dist/environment.js';

test('resuelve configuración local segura por defecto', () => {
  assert.deepEqual(resolveApiEnvironment({}), {
    host: '127.0.0.1',
    port: 3000,
    executionMode: 'development',
    allowedOrigins: [],
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
});
