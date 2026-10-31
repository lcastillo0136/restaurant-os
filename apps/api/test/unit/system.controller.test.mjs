import assert from 'node:assert/strict';
import test from 'node:test';
import { SystemController } from '../../dist/system.controller.js';

test('expone health técnico sin estado de negocio', () => {
  const controller = new SystemController();
  assert.deepEqual(controller.health(), {
    service: 'restaurant-os-api',
    status: 'ok',
    phase: '1.3',
  });
  assert.deepEqual(controller.status(), {
    service: 'restaurant-os-api',
    status: 'environment-ready',
    phase: '1.3',
    database: 'readiness-endpoint-available',
    status: 'backend-core-ready',
  });
});
