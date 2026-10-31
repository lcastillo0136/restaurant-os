import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveDatabaseUrl } from '../../dist/database/database-environment.js';

const validDatabaseUrl = new URL('postgresql://127.0.0.1:5432/restaurant_dev?schema=public');
validDatabaseUrl.username = 'restaurant_app';
validDatabaseUrl.password = 'encoded+test-value';
const validUrl = validDatabaseUrl.toString();

test('acepta exclusivamente la configuración local de la cuenta de aplicación', () => {
  assert.equal(resolveDatabaseUrl({ DATABASE_URL: validUrl }), validUrl);
});

test('rechaza ausencia de secreto y destinos o cuentas no autorizados', () => {
  assert.throws(() => resolveDatabaseUrl({}), /DATABASE_URL/);
  assert.throws(
    () => resolveDatabaseUrl({ DATABASE_URL: validUrl.replace('restaurant_app', 'postgres') }),
    /restaurant_app/,
  );
  assert.throws(
    () => resolveDatabaseUrl({ DATABASE_URL: validUrl.replace('127.0.0.1', '0.0.0.0') }),
    /restaurant_app/,
  );
});
