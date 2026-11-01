import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const applicationRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const migrationsRoot = resolve(applicationRoot, 'prisma/migrations');
const requiredMigrations = [
  '20261031000100_initial_foundation',
  '20261031000200_user_roles_organization_isolation',
  '20261101000100_authentication_authorization',
];

test('las migraciones de fundamentos permanecen versionadas y no se ejecutan durante la integración aislada', async () => {
  const entries = await readdir(migrationsRoot, { withFileTypes: true });
  const directories = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  for (const migration of requiredMigrations) {
    assert.ok(directories.includes(migration), `Falta la migración ${migration}.`);
    const sql = await readFile(resolve(migrationsRoot, migration, 'migration.sql'), 'utf8');
    assert.match(sql, /CREATE|ALTER/i);
  }
});
