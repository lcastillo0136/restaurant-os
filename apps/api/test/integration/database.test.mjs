import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const applicationRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

async function waitForDatabase(url) {
  const deadline = Date.now() + 10_000;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      lastError = new Error(`La API respondió ${response.status}.`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
  }
  throw lastError ?? new Error('La API no respondió a tiempo.');
}

test('conecta NestJS con PostgreSQL mediante la cuenta de aplicación local', async (context) => {
  const port = 34_000 + Math.floor(Math.random() * 1_000);
  const api = spawn(process.execPath, ['dist/main.js'], {
    cwd: applicationRoot,
    env: {
      ...process.env,
      API_HOST: '127.0.0.1',
      API_PORT: String(port),
      API_EXECUTION_MODE: 'test',
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

  const response = await waitForDatabase(`http://127.0.0.1:${port}/api/v1/system/database`);
  assert.deepEqual(await response.json(), {
    service: 'restaurant-os-api',
    status: 'ok',
    phase: '1.2',
    database: 'reachable',
  }, output.join(''));
});
