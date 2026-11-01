import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { PasswordService } from '../auth/password.service.js';
import { parseFirstAdminCommand, resolveAuthorizedBootstrapUrl } from './first-admin-command.js';
import { FirstAdminProvisioner, FirstAdminProvisioningError, type FirstAdminRepository } from './first-admin-provisioner.js';

async function readLine(prompt: string, hidden = false): Promise<string> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new FirstAdminProvisioningError('El bootstrap exige una terminal interactiva; no acepta secretos redirigidos.');
  }
  process.stdout.write(prompt);
  if (!hidden) {
    const { createInterface } = await import('node:readline/promises');
    const reader = createInterface({ input: process.stdin, output: process.stdout });
    try {
      return await reader.question('');
    } finally {
      reader.close();
    }
  }
  return new Promise((resolve, reject) => {
    let value = '';
    const input = process.stdin;
    const finish = (): void => {
      input.off('data', onData);
      input.setRawMode(false);
      process.stdout.write('\n');
      resolve(value);
    };
    const onData = (chunk: Buffer): void => {
      const character = chunk.toString('utf8');
      if (character === '\r' || character === '\n') return finish();
      if (character === '\u0003') {
        input.off('data', onData);
        input.setRawMode(false);
        reject(new FirstAdminProvisioningError('Bootstrap cancelado por el operador.'));
        return;
      }
      if (character === '\u0008' || character === '\u007f') {
        value = value.slice(0, -1);
        return;
      }
      value += character;
    };
    input.setRawMode(true);
    input.resume();
    input.on('data', onData);
  });
}

async function main(): Promise<void> {
  const command = parseFirstAdminCommand(process.argv.slice(2));
  const databaseUrl = resolveAuthorizedBootstrapUrl(process.env.FIRST_ADMIN_DATABASE_URL, command.targetName);
  const identifier = await readLine('Identificador local: ');
  const displayName = await readLine('Nombre para mostrar (opcional): ');
  const password = await readLine('Contraseña (no se mostrará): ', true);
  const confirmation = await readLine(`Escriba ${command.targetName} para confirmar la escritura: `);
  if (confirmation !== command.targetName) throw new FirstAdminProvisioningError('La confirmación final no coincide con la base objetivo.');

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
  try {
    // Prisma expone una sobrecarga adicional de $transaction para lotes; el
    // provisionador solo usa la variante interactiva descrita por este contrato.
    const provisioner = new FirstAdminProvisioner(prisma as unknown as FirstAdminRepository, new PasswordService());
    await provisioner.provision({
      organizationId: command.organizationId,
      branchId: command.branchId,
      roleCode: command.roleCode,
      approvedPermissionCodes: command.approvedPermissionCodes,
      approvalReference: command.approvalReference,
      identifier,
      displayName,
      password,
    });
    process.stdout.write('Bootstrap del primer administrador completado. Verifique login, rotación y revocación conforme al procedimiento aprobado.\n');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Error no identificable durante el bootstrap.';
  process.stderr.write(`Bootstrap rechazado: ${message}\n`);
  process.exitCode = 1;
});
