import assert from 'node:assert/strict';
import test from 'node:test';
import { DatabaseController } from '../../dist/database/database.controller.js';

test('expone únicamente el estado técnico después de confirmar PostgreSQL', async () => {
  let pinged = false;
  const controller = new DatabaseController({
    ping: async () => { pinged = true; },
  });

  assert.deepEqual(await controller.health(), {
    service: 'restaurant-os-api',
    status: 'ok',
    phase: '1.2',
    database: 'reachable',
  });
  assert.equal(pinged, true);
});
