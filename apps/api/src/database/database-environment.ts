import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';

const localEnvironmentCandidates = [
  resolve(process.cwd(), '.env.database'),
  resolve(process.cwd(), '..', '..', '.env.database'),
];

export function loadDatabaseEnvironment(): void {
  for (const candidate of localEnvironmentCandidates) {
    if (existsSync(candidate)) {
      config({ path: candidate, override: false, quiet: true });
      return;
    }
  }
}

export function resolveDatabaseUrl(environment: NodeJS.ProcessEnv = process.env): string {
  const rawUrl = environment.DATABASE_URL?.trim();
  if (!rawUrl) throw new Error('DATABASE_URL es obligatorio para la conexión a PostgreSQL.');

  let databaseUrl: URL;
  try {
    databaseUrl = new URL(rawUrl);
  } catch {
    throw new Error('DATABASE_URL debe ser una URL PostgreSQL válida.');
  }

  if (databaseUrl.protocol !== 'postgresql:'
    || databaseUrl.hostname !== '127.0.0.1'
    || databaseUrl.port !== '5432'
    || databaseUrl.username !== 'restaurant_app'
    || !databaseUrl.password
    || databaseUrl.pathname !== '/restaurant_dev'
    || databaseUrl.searchParams.get('schema') !== 'public') {
    throw new Error('DATABASE_URL debe usar restaurant_app en 127.0.0.1:5432/restaurant_dev con schema=public.');
  }

  return rawUrl;
}
