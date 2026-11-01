import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { safeBootstrapErrorMessage } from '../../dist/bootstrap/bootstrap-error.js';
import { parseFirstAdminCommand, resolveAuthorizedBootstrapUrl } from '../../dist/bootstrap/first-admin-command.js';
import { FirstAdminProvisioner, FirstAdminProvisioningError } from '../../dist/bootstrap/first-admin-provisioner.js';
import { readHiddenLine } from '../../dist/bootstrap/terminal-input.js';
import { PasswordService } from '../../dist/auth/password.service.js';

const passwordProfile = { memory: 8192, passes: 1, parallelism: 1, tagLength: 32 };

function createRepository() {
  const organizationId = randomUUID();
  const branchId = randomUUID();
  const state = {
    users: [],
    audits: [],
    locks: [],
    organizationId,
    branchId,
    role: {
      id: randomUUID(),
      code: 'ORG_ADMIN_BOOTSTRAP',
      permissions: [{ permission: { code: 'auth.session.read', status: 'ACTIVE' } }],
    },
  };
  let chain = Promise.resolve();
  const transaction = {
    $executeRawUnsafe: async (query) => { state.locks.push(query); },
    appUser: {
      count: async () => state.users.length,
      findFirst: async ({ where }) => state.users.find((user) => user.identitySubject === where.identitySubject) ?? null,
      create: async ({ data }) => {
        const user = { id: randomUUID(), ...data };
        state.users.push(user);
        return user;
      },
    },
    organization: { findFirst: async ({ where }) => where.id === organizationId ? { id: organizationId } : null },
    branch: { findFirst: async ({ where }) => where.id === branchId && where.organizationId === organizationId ? { id: branchId, organizationId } : null },
    role: { findFirst: async ({ where }) => where.code === state.role.code ? state.role : null },
    securityAuditEvent: { create: async ({ data }) => { state.audits.push(data); } },
  };
  const repository = {
    $transaction: async (callback) => {
      const previous = chain;
      let release;
      chain = new Promise((resolve) => { release = resolve; });
      await previous;
      try { return await callback(transaction); } finally { release(); }
    },
  };
  return { repository, state };
}

function request(state, overrides = {}) {
  return {
    organizationId: state.organizationId,
    roleCode: state.role.code,
    approvedPermissionCodes: ['auth.session.read'],
    approvalReference: 'owner-approved-test',
    identifier: 'first.admin',
    displayName: 'Administración inicial',
    password: 'isolated-test-passphrase',
    ...overrides,
  };
}

test('aprovisiona una sola identidad con Argon2id, rol exacto y auditoría sin secreto', async () => {
  const { repository, state } = createRepository();
  const service = new FirstAdminProvisioner(repository, new PasswordService(passwordProfile));
  const result = await service.provision(request(state));

  assert.equal(result.organizationId, state.organizationId);
  assert.equal(state.users.length, 1);
  assert.match(state.users[0].credential.create.passwordHash, /^\$argon2id\$/);
  assert.equal(JSON.stringify(state).includes('isolated-test-passphrase'), false);
  assert.deepEqual(state.audits.map((event) => event.eventType), ['ADMIN_BOOTSTRAP']);
  assert.equal(state.locks.length, 1);
});

test('rechaza segundo bootstrap concurrente sin crear una segunda identidad', async () => {
  const { repository, state } = createRepository();
  const service = new FirstAdminProvisioner(repository, new PasswordService(passwordProfile));
  const results = await Promise.allSettled([service.provision(request(state)), service.provision(request(state, { identifier: 'other.admin' }))]);

  assert.deepEqual(results.map((result) => result.status).sort(), ['fulfilled', 'rejected']);
  assert.equal(state.users.length, 1);
});

test('rechaza rol sin coincidencia exacta de permisos y entradas inseguras', async () => {
  const { repository, state } = createRepository();
  const service = new FirstAdminProvisioner(repository, new PasswordService(passwordProfile));
  await assert.rejects(() => service.provision(request(state, { approvedPermissionCodes: ['audit.read'] })), /no coincide exactamente/);
  await assert.rejects(() => service.provision(request(state, { password: 'short' })), /12 y 128/);
  assert.equal(state.users.length, 0);
});

test('exige destino explícito y bloquea restaurant_dev antes de abrir una conexión', () => {
  const targetName = 'restaurant_phase_21_isolated';
  const command = parseFirstAdminCommand([
    '--target-name', targetName,
    '--organization-id', randomUUID(),
    '--role-code', 'ORG_ADMIN_BOOTSTRAP',
    '--permission', 'auth.session.read',
    '--approval-reference', 'owner-approved-2026-11-01',
    '--confirm-first-administrator', `BOOTSTRAP-FIRST-ADMIN:${targetName}`,
  ]);
  assert.equal(command.targetName, targetName);
  assert.equal(resolveAuthorizedBootstrapUrl(`postgresql://user:secret@127.0.0.1:5432/${targetName}`, targetName).includes(targetName), true);
  assert.throws(() => resolveAuthorizedBootstrapUrl('postgresql://user:secret@127.0.0.1:5432/restaurant_dev', 'restaurant_dev'), /bloqueada/);
  assert.throws(() => parseFirstAdminCommand(['--target-name', targetName]), /exactamente una vez/);
  assert.throws(() => parseFirstAdminCommand([
    '--target-name', targetName,
    '--organization-id', randomUUID(),
    '--branch-id', randomUUID(),
    '--branch-id', randomUUID(),
    '--role-code', 'ORG_ADMIN_BOOTSTRAP',
    '--permission', 'auth.session.read',
    '--approval-reference', 'owner-approved-2026-11-01',
    '--confirm-first-administrator', `BOOTSTRAP-FIRST-ADMIN:${targetName}`,
  ]), /--branch-id/);
  assert.throws(() => parseFirstAdminCommand([
    '--target-name', targetName,
    '--organization-id', randomUUID(),
    '--role-code', 'ORG_ADMIN_BOOTSTRAP',
    '--permission', '',
    '--approval-reference', 'owner-approved-2026-11-01',
    '--confirm-first-administrator', `BOOTSTRAP-FIRST-ADMIN:${targetName}`,
  ]), /--permission/);
});

class FakeTerminalInput {
  constructor() {
    this.isTTY = true;
    this.listeners = new Map();
    this.rawModes = [];
    this.resumed = false;
  }

  on(event, listener) { this.listeners.set(event, listener); }
  off(event) { this.listeners.delete(event); }
  setRawMode(enabled) { this.rawModes.push(enabled); }
  resume() { this.resumed = true; }
  emitData(value) { this.listeners.get('data')?.(Buffer.from(value)); }
}

class FakeTerminalOutput {
  constructor() { this.isTTY = true; this.output = ''; }
  write(value) { this.output += value; }
}

test('lee contraseña por bloques sin eco y restaura raw mode al confirmar o cancelar', async () => {
  const input = new FakeTerminalInput();
  const output = new FakeTerminalOutput();
  const read = readHiddenLine(input, output, 'Contraseña: ');
  input.emitData('parte');
  input.emitData('1\x7F2\r');
  assert.equal(await read, 'parte2');
  assert.equal(input.resumed, true);
  assert.deepEqual(input.rawModes, [true, false]);
  assert.equal(output.output.includes('parte2'), false);

  const cancelledInput = new FakeTerminalInput();
  const cancelledOutput = new FakeTerminalOutput();
  const cancelled = readHiddenLine(cancelledInput, cancelledOutput, 'Contraseña: ');
  cancelledInput.emitData('pegado\u0003');
  await assert.rejects(() => cancelled, /cancelado/);
  assert.deepEqual(cancelledInput.rawModes, [true, false]);
  assert.equal(cancelledOutput.output.includes('pegado'), false);
});

test('solo muestra mensajes controlados; oculta errores internos', () => {
  assert.equal(safeBootstrapErrorMessage(new Error('postgresql://user:secret@host SQL SELECT 1')), 'El bootstrap no pudo completarse por un error interno. No se muestran detalles sensibles.');
  assert.equal(safeBootstrapErrorMessage(new FirstAdminProvisioningError('Destino controlado inválido.')), 'Destino controlado inválido.');
});
