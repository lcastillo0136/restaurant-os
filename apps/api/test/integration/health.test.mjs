import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const applicationRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

async function waitForHealth(url, options = undefined) {
  const deadline = Date.now() + 10_000;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      lastError = new Error(`La API respondió ${response.status}.`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
  }
  throw lastError ?? new Error('La API no respondió a tiempo.');
}

test('arranca la API y responde health en loopback', async (context) => {
  const port = 33_000 + Math.floor(Math.random() * 1_000);
  const api = spawn(process.execPath, ['dist/main.js'], {
    cwd: applicationRoot,
    env: {
      ...process.env,
      API_HOST: '127.0.0.1',
      API_PORT: String(port),
      API_EXECUTION_MODE: 'test',
      API_ALLOWED_ORIGINS: 'http://localhost:5173',
    },
    stdio: 'pipe',
  });
  const output = [];
  let exited = false;
  const exitPromise = once(api, 'exit');
  api.once('exit', () => { exited = true; });
  api.stderr.on('data', (chunk) => output.push(chunk.toString()));
  context.after(async () => {
    if (!exited) api.kill('SIGTERM');
    await exitPromise;
  });

  const response = await waitForHealth(`http://127.0.0.1:${port}/api/v1/system/health`, {
    headers: { Origin: 'http://localhost:5173' },
  });
  assert.deepEqual(await response.json(), {
    service: 'restaurant-os-api',
    status: 'ok',
    phase: '1.1',
  });
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5173');

  const missingRoute = await fetch(`http://127.0.0.1:${port}/api/v1/not-a-route`);
  assert.equal(missingRoute.status, 404, output.join(''));
});
