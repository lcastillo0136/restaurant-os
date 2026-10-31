import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

for (const candidate of [
  resolve(process.cwd(), '.env.database'),
  resolve(process.cwd(), '..', '..', '.env.database'),
]) {
  if (existsSync(candidate)) {
    config({ path: candidate, override: false, quiet: true });
    break;
  }
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
