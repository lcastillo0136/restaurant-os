import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { config } from 'dotenv';

for (const candidate of [
  resolve(process.cwd(), '.env.database'),
  resolve(process.cwd(), '..', '..', '.env.database'),
]) {
  if (existsSync(candidate)) {
    config({ path: candidate, override: false, quiet: true });
    break;
  }
}

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) throw new Error('DATABASE_URL es obligatorio para el seed técnico.');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function main(): Promise<void> {
  const organization = await prisma.organization.upsert({
    where: { code: 'restaurant-os-demo' },
    update: {
      displayName: 'Restaurant OS — Organización de demostración',
      status: 'ACTIVE',
    },
    create: {
      code: 'restaurant-os-demo',
      displayName: 'Restaurant OS — Organización de demostración',
    },
  });

  await prisma.branch.upsert({
    where: {
      organizationId_code: {
        organizationId: organization.id,
        code: 'demo-central',
      },
    },
    update: {
      displayName: 'Sucursal ficticia de demostración',
      timeZone: 'America/Mexico_City',
      status: 'ACTIVE',
    },
    create: {
      organizationId: organization.id,
      code: 'demo-central',
      displayName: 'Sucursal ficticia de demostración',
      timeZone: 'America/Mexico_City',
    },
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
