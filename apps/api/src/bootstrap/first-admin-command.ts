import { URL } from 'node:url';
import { FirstAdminProvisioningError } from './first-admin-provisioner.js';

export type FirstAdminCommand = Readonly<{
  targetName: string;
  organizationId: string;
  branchId?: string;
  roleCode: string;
  approvedPermissionCodes: readonly string[];
  approvalReference: string;
}>;

const requiredOptions = new Set([
  '--target-name', '--organization-id', '--role-code', '--permission', '--approval-reference', '--confirm-first-administrator',
]);
const optionalOptions = new Set(['--branch-id']);

function requiredOption(options: ReadonlyMap<string, string[]>, name: string): string {
  const values = options.get(name) ?? [];
  if (values.length !== 1 || !values[0]?.trim()) throw new FirstAdminProvisioningError(`${name} debe declararse exactamente una vez.`);
  return values[0].trim();
}

function optionalSingleOption(options: ReadonlyMap<string, string[]>, name: string): string | undefined {
  const values = options.get(name) ?? [];
  if (values.length === 0) return undefined;
  if (values.length !== 1 || !values[0]?.trim()) throw new FirstAdminProvisioningError(`${name} debe declararse como máximo una vez y con un valor no vacío.`);
  return values[0].trim();
}

/** Parses only non-secret, explicit operator intent. Passwords are prompted, never parsed. */
export function parseFirstAdminCommand(argumentsList: readonly string[]): FirstAdminCommand {
  const options = new Map<string, string[]>();
  for (let index = 0; index < argumentsList.length; index += 2) {
    const option = argumentsList[index];
    const value = argumentsList[index + 1];
    if (!requiredOptions.has(option) && !optionalOptions.has(option)) {
      throw new FirstAdminProvisioningError(`Opción no permitida: ${option ?? '(vacía)'}.`);
    }
    if (value === undefined || value.startsWith('--')) throw new FirstAdminProvisioningError(`Falta el valor explícito para ${option}.`);
    const values = options.get(option) ?? [];
    values.push(value);
    options.set(option, values);
  }

  const targetName = requiredOption(options, '--target-name');
  const confirmation = requiredOption(options, '--confirm-first-administrator');
  if (confirmation !== `BOOTSTRAP-FIRST-ADMIN:${targetName}`) {
    throw new FirstAdminProvisioningError('La confirmación explícita no coincide con la base objetivo.');
  }
  const approvedPermissionCodes = (options.get('--permission') ?? []).map((value) => {
    const permission = value.trim();
    if (!permission) throw new FirstAdminProvisioningError('--permission no admite valores vacíos.');
    return permission;
  });
  if (approvedPermissionCodes.length === 0) throw new FirstAdminProvisioningError('Debe indicar al menos un --permission.');

  return Object.freeze({
    targetName,
    organizationId: requiredOption(options, '--organization-id'),
    branchId: optionalSingleOption(options, '--branch-id'),
    roleCode: requiredOption(options, '--role-code'),
    approvedPermissionCodes,
    approvalReference: requiredOption(options, '--approval-reference'),
  });
}

/** The connection is opt-in and must name an authorized, non-development target. */
export function resolveAuthorizedBootstrapUrl(rawValue: string | undefined, targetName: string): string {
  if (!rawValue?.trim()) throw new FirstAdminProvisioningError('FIRST_ADMIN_DATABASE_URL es obligatorio y no se lee desde archivos .env.');
  let url: URL;
  try {
    url = new URL(rawValue);
  } catch {
    throw new FirstAdminProvisioningError('FIRST_ADMIN_DATABASE_URL debe ser una URL PostgreSQL válida.');
  }
  const databaseName = decodeURIComponent(url.pathname.replace(/^\//, ''));
  if (url.protocol !== 'postgresql:' || !databaseName || databaseName !== targetName) {
    throw new FirstAdminProvisioningError('La URL no coincide exactamente con --target-name.');
  }
  if (databaseName === 'restaurant_dev') {
    throw new FirstAdminProvisioningError('restaurant_dev está bloqueada para el bootstrap del primer administrador.');
  }
  return rawValue;
}
