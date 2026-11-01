import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { PasswordService } from '../auth/password.service.js';
import { safeBootstrapErrorMessage } from './bootstrap-error.js';
import { parseFirstAdminCommand, resolveAuthorizedBootstrapUrl } from './first-admin-command.js';
import { FirstAdminProvisioner, FirstAdminProvisioningError, type FirstAdminRepository } from './first-admin-provisioner.js';
import { assertInteractiveTerminal, readHiddenLine } from './terminal-input.js';

async function readLine(prompt: string, hidden = false): Promise<string> {
  assertInteractiveTerminal(process.stdin, process.stdout);
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
  return readHiddenLine(process.stdin, process.stdout, prompt);
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
  process.stderr.write(`Bootstrap rechazado: ${safeBootstrapErrorMessage(error)}\n`);
  process.exitCode = 1;
});
