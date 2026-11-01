import { normalizeLocalIdentifier } from '../auth/auth.service.js';
import { PasswordService } from '../auth/password.service.js';

export type FirstAdminInput = Readonly<{
  organizationId: string;
  branchId?: string;
  roleCode: string;
  approvedPermissionCodes: readonly string[];
  approvalReference: string;
  identifier: string;
  displayName?: string;
  password: string;
}>;

export type FirstAdminResult = Readonly<{
  userId: string;
  organizationId: string;
  branchId: string | null;
  roleCode: string;
}>;

type ActiveRole = Readonly<{
  id: string;
  code: string;
  permissions: readonly Readonly<{ permission: Readonly<{ code: string; status: string }> }> [];
}>;

export type FirstAdminTransaction = Readonly<{
  $executeRawUnsafe(query: string): Promise<unknown>;
  appUser: Readonly<{
    count(): Promise<number>;
    findFirst(args: unknown): Promise<Readonly<{ id: string }> | null>;
    create(args: unknown): Promise<Readonly<{ id: string }>>;
  }>;
  organization: Readonly<{
    findFirst(args: unknown): Promise<Readonly<{ id: string }> | null>;
  }>;
  branch: Readonly<{
    findFirst(args: unknown): Promise<Readonly<{ id: string; organizationId: string }> | null>;
  }>;
  role: Readonly<{
    findFirst(args: unknown): Promise<ActiveRole | null>;
  }>;
  securityAuditEvent: Readonly<{
    create(args: unknown): Promise<unknown>;
  }>;
}>;

export type FirstAdminRepository = Readonly<{
  $transaction<T>(
    callback: (transaction: FirstAdminTransaction) => Promise<T>,
    options: Readonly<{ isolationLevel: 'Serializable' }>,
  ): Promise<T>;
}>;

export class FirstAdminProvisioningError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FirstAdminProvisioningError';
  }
}

const postgresAdvisoryLock = "SELECT pg_advisory_xact_lock(hashtext('restaurant-os:first-administrator'))";

function distinctSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function hasExactPermissions(role: ActiveRole, expectedPermissions: readonly string[]): boolean {
  const actual = distinctSorted(
    role.permissions
      .filter(({ permission }) => permission.status === 'ACTIVE')
      .map(({ permission }) => permission.code),
  );
  const expected = distinctSorted(expectedPermissions);
  return actual.length > 0 && actual.length === expected.length && actual.every((permission, index) => permission === expected[index]);
}

function requireValue(value: string | undefined, label: string): string {
  if (!value?.trim()) throw new FirstAdminProvisioningError(`${label} es obligatorio.`);
  return value.trim();
}

function validateInput(input: FirstAdminInput): FirstAdminInput {
  const identifier = normalizeLocalIdentifier(requireValue(input.identifier, 'El identificador'));
  if (identifier.length < 3 || identifier.length > 160) {
    throw new FirstAdminProvisioningError('El identificador debe tener entre 3 y 160 caracteres.');
  }
  if (input.password.length < 12 || input.password.length > 128) {
    throw new FirstAdminProvisioningError('La contraseña debe tener entre 12 y 128 caracteres.');
  }
  const approvedPermissionCodes = distinctSorted(input.approvedPermissionCodes.map((permission) => permission.trim()).filter(Boolean));
  if (approvedPermissionCodes.length === 0) {
    throw new FirstAdminProvisioningError('Debe declarar al menos un permiso aprobado para el rol.');
  }
  return {
    ...input,
    organizationId: requireValue(input.organizationId, 'organizationId'),
    branchId: input.branchId?.trim() || undefined,
    roleCode: requireValue(input.roleCode, 'El código de rol'),
    approvedPermissionCodes,
    approvalReference: requireValue(input.approvalReference, 'La referencia de autorización'),
    identifier,
    displayName: input.displayName?.trim() || undefined,
  };
}

/**
 * Crea exactamente la primera identidad administrativa contra un repositorio
 * previamente autorizado. No crea roles/permisos: exige que el rol aprobado ya
 * exista y coincida exactamente con los permisos declarados por el operador.
 */
export class FirstAdminProvisioner {
  constructor(
    private readonly repository: FirstAdminRepository,
    private readonly passwords: Pick<PasswordService, 'hash'>,
  ) {}

  async provision(requestedInput: FirstAdminInput): Promise<FirstAdminResult> {
    const input = validateInput(requestedInput);
    const passwordHash = await this.passwords.hash(input.password);

    return this.repository.$transaction(async (transaction) => {
      // PostgreSQL serializable por sí solo puede reintentar; este candado hace
      // explícita la exclusión entre dos bootstrap concurrentes.
      await transaction.$executeRawUnsafe(postgresAdvisoryLock);

      if (await transaction.appUser.count() !== 0) {
        throw new FirstAdminProvisioningError('El bootstrap solo admite una base sin identidades existentes.');
      }

      const organization = await transaction.organization.findFirst({
        where: { id: input.organizationId, status: 'ACTIVE' },
        select: { id: true },
      });
      if (!organization) throw new FirstAdminProvisioningError('La organización indicada no está activa.');

      if (input.branchId) {
        const branch = await transaction.branch.findFirst({
          where: { id: input.branchId, organizationId: input.organizationId, status: 'ACTIVE' },
          select: { id: true, organizationId: true },
        });
        if (!branch) throw new FirstAdminProvisioningError('La sucursal no está activa o no pertenece a la organización indicada.');
      }

      const role = await transaction.role.findFirst({
        where: { code: input.roleCode, status: 'ACTIVE' },
        include: { permissions: { include: { permission: true } } },
      });
      if (!role || !hasExactPermissions(role, input.approvedPermissionCodes)) {
        throw new FirstAdminProvisioningError('El rol no coincide exactamente con la autorización de permisos declarada.');
      }

      const duplicate = await transaction.appUser.findFirst({
        where: { identitySource: 'LOCAL', identitySubject: input.identifier },
        select: { id: true },
      });
      if (duplicate) throw new FirstAdminProvisioningError('La identidad local ya existe.');

      const user = await transaction.appUser.create({
        data: {
          identitySource: 'LOCAL',
          identitySubject: input.identifier,
          displayName: input.displayName,
          status: 'ACTIVE',
          credential: { create: { passwordHash } },
          userRoles: {
            create: {
              organizationId: input.organizationId,
              roleId: role.id,
              scope: input.branchId ? 'BRANCH' : 'ORGANIZATION',
              branchId: input.branchId ?? null,
            },
          },
        },
        select: { id: true },
      });

      await transaction.securityAuditEvent.create({
        data: {
          eventType: 'ADMIN_BOOTSTRAP',
          result: 'SUCCESS',
          actorUserId: user.id,
          organizationId: input.organizationId,
          branchId: input.branchId,
          metadata: { roleCode: role.code, approvalReference: input.approvalReference },
        },
      });

      return Object.freeze({
        userId: user.id,
        organizationId: input.organizationId,
        branchId: input.branchId ?? null,
        roleCode: role.code,
      });
    }, { isolationLevel: 'Serializable' });
  }
}
