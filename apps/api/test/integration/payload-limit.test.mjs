import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const applicationRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const testDatabaseUrl = new URL('postgresql://127.0.0.1:5432/restaurant_dev?schema=public');
testDatabaseUrl.username = 'restaurant_app';
testDatabaseUrl.password = 'ci-test-password';

async function waitForHealth(url) {
  const deadline = Date.now() + 10_000;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
      lastError = new Error(`La API respondió ${response.status}.`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
  }
  throw lastError ?? new Error('La API no respondió a tiempo.');
}

test('un JSON excesivo devuelve 413 con encabezados de seguridad y request ID', async (context) => {
  const port = 34_000 + Math.floor(Math.random() * 1_000);
  const api = spawn(process.execPath, ['dist/main.js'], {
    cwd: applicationRoot,
    env: {
      ...process.env,
      API_HOST: '127.0.0.1',
      API_PORT: String(port),
      API_EXECUTION_MODE: 'test',
      API_BODY_LIMIT_BYTES: '1024',
      DATABASE_URL: testDatabaseUrl.toString(),
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

  const baseUrl = `http://127.0.0.1:${port}`;
  await waitForHealth(`${baseUrl}/api/v1/system/health`);
  const response = await fetch(`${baseUrl}/api/v1/system/health`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ payload: 'x'.repeat(2_048) }),
  });

  assert.equal(response.status, 413, output.join(''));
  const body = await response.json();
  assert.equal(body.code, 'PAYLOAD_TOO_LARGE');
  assert.match(body.requestId, /^[0-9a-f-]{36}$/i);
  assert.equal(response.headers.get('x-request-id'), body.requestId);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  assert.equal(response.headers.get('permissions-policy'), 'camera=(), geolocation=(), microphone=()');
});
