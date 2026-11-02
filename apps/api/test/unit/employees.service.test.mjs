import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { EmployeesService } from '../../dist/employees/employees.service.js';
import { createValidationPipe } from '../../dist/common/http/validation.pipe.js';
import { EmployeesController, WorkShiftsController } from '../../dist/employees/employees.controller.js';
import { CreateEmployeeDto, CreateShiftDto, UpdateEmployeeDto, UpdateShiftDto } from '../../dist/employees/dto/employees.dto.js';
import { authorizationScopeKey, requiredPermissionsKey } from '../../dist/authorization/authorization.decorators.js';

async function validate(type, value) {
  return createValidationPipe().transform(value, { type: 'body', metatype: type });
}

function fixture({ failAudit = false } = {}) {
  const organizationId = randomUUID(); const otherOrganizationId = randomUUID(); const branchId = randomUUID();
  const state = { employees: [], assignments: [], shifts: [], shiftAssignments: [], audits: [], failAudit };
  const transaction = async (work) => {
    const draft = structuredClone(state);
    const tx = {
      employee: {
        create: async ({ data }) => { const item = { id: randomUUID(), status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date(), ...data }; draft.employees.push(item); return item; },
        findFirst: async ({ where }) => draft.employees.find((item) => Object.entries(where).every(([key, value]) => item[key] === value)) ?? null,
        update: async ({ where, data }) => Object.assign(draft.employees.find((item) => item.id === where.id), data),
      },
      branch: { findFirst: async ({ where }) => where.id === branchId && where.organizationId === organizationId && where.status === 'ACTIVE' ? { id: branchId } : null },
      employeeBranchAssignment: {
        upsert: async ({ where, create, update }) => { const found = draft.assignments.find((item) => item.employeeId === where.employeeId_branchId.employeeId && item.branchId === where.employeeId_branchId.branchId); if (found) return Object.assign(found, update); const item = { id: randomUUID(), status: 'ACTIVE', ...create }; draft.assignments.push(item); return item; },
        findFirst: async ({ where }) => draft.assignments.find((item) => Object.entries(where).every(([key, value]) => item[key] === value)) ? { ...draft.assignments.find((item) => Object.entries(where).every(([key, value]) => item[key] === value)), employee: draft.employees.find((employee) => employee.id === where.employeeId) } : null,
        update: async ({ where, data }) => Object.assign(draft.assignments.find((item) => item.id === where.id), data),
      },
      workShift: {
        create: async ({ data }) => { const item = { id: randomUUID(), status: 'SCHEDULED', createdAt: new Date(), updatedAt: new Date(), ...data }; draft.shifts.push(item); return item; },
        findFirst: async ({ where }) => draft.shifts.find((item) => Object.entries(where).every(([key, value]) => item[key] === value)) ?? null,
        update: async ({ where, data }) => Object.assign(draft.shifts.find((item) => item.id === where.id), data),
      },
      workShiftAssignment: {
        upsert: async ({ where, create, update }) => { const found = draft.shiftAssignments.find((item) => item.workShiftId === where.workShiftId_employeeId.workShiftId && item.employeeId === where.workShiftId_employeeId.employeeId); if (found) return Object.assign(found, update); const item = { id: randomUUID(), status: 'ACTIVE', ...create }; draft.shiftAssignments.push(item); return item; },
        findFirst: async ({ where }) => draft.shiftAssignments.find((item) => Object.entries(where).every(([key, value]) => item[key] === value)) ?? null,
        update: async ({ where, data }) => Object.assign(draft.shiftAssignments.find((item) => item.id === where.id), data),
      },
      auditEvent: { create: async ({ data }) => { if (draft.failAudit) throw new Error('simulated audit failure'); draft.audits.push(data); } },
    };
    const result = await work(tx);
    Object.assign(state, draft);
    return result;
  };
  const prisma = { $transaction: transaction, employee: { findMany: async () => state.employees, findFirst: async ({ where }) => state.employees.find((item) => item.id === where.id && item.organizationId === where.organizationId) ?? null }, workShift: { findMany: async () => state.shifts, findFirst: async ({ where }) => state.shifts.find((item) => item.id === where.id && item.organizationId === where.organizationId && item.branchId === where.branchId) ?? null } };
  return { service: new EmployeesService(prisma), state, organizationId, otherOrganizationId, branchId };
}

test('crea empleado y registra auditoría dentro de la transacción', async () => {
  const { service, state, organizationId } = fixture(); const actor = randomUUID();
  const employee = await service.createEmployee(organizationId, { employeeCode: 'ana-01', displayName: 'Ana' }, actor);
  assert.equal(employee.organizationId, organizationId);
  assert.equal(state.employees.length, 1);
  assert.deepEqual(state.audits.map((item) => item.eventType), ['EMPLOYEE_CREATED']);
});

test('revierte la creación si falla la auditoría', async () => {
  const { service, state, organizationId } = fixture({ failAudit: true });
  await assert.rejects(() => service.createEmployee(organizationId, { employeeCode: 'ana-01', displayName: 'Ana' }, randomUUID()));
  assert.equal(state.employees.length, 0);
  assert.equal(state.audits.length, 0);
});

test('aísla la asignación laboral por organización y exige empleado activo', async () => {
  const { service, state, organizationId, otherOrganizationId, branchId } = fixture(); const actor = randomUUID();
  const employee = await service.createEmployee(organizationId, { employeeCode: 'ana-01', displayName: 'Ana' }, actor);
  await assert.rejects(() => service.assignBranch(otherOrganizationId, branchId, employee.id, actor), { status: 404 });
  const assignment = await service.assignBranch(organizationId, branchId, employee.id, actor);
  assert.equal(assignment.organizationId, organizationId);
  assert.equal(state.audits.at(-1).eventType, 'EMPLOYEE_BRANCH_ASSIGNED');
});

test('cancela sólo el turno de la sucursal autorizada y lo audita', async () => {
  const { service, state, organizationId, otherOrganizationId, branchId } = fixture(); const actor = randomUUID();
  const shift = await service.createShift(organizationId, branchId, { scheduledStart: '2026-11-03T09:00:00.000Z', scheduledEnd: '2026-11-03T17:00:00.000Z' }, actor);
  await assert.rejects(() => service.cancelShift(otherOrganizationId, branchId, shift.id, actor), { status: 404 });
  const canceled = await service.cancelShift(organizationId, branchId, shift.id, actor);
  assert.equal(canceled.status, 'CANCELED');
  assert.equal(state.audits.at(-1).eventType, 'WORK_SHIFT_CANCELED');
});

test('requiere asignación laboral activa y conserva historial al cancelar asignación a turno', async () => {
  const { service, state, organizationId, branchId } = fixture(); const actor = randomUUID();
  const employee = await service.createEmployee(organizationId, { employeeCode: 'ana-01', displayName: 'Ana' }, actor);
  const shift = await service.createShift(organizationId, branchId, { scheduledStart: '2026-11-03T09:00:00.000Z', scheduledEnd: '2026-11-03T17:00:00.000Z' }, actor);
  await assert.rejects(() => service.assignShift(organizationId, branchId, shift.id, employee.id, actor), { status: 404 });
  await service.assignBranch(organizationId, branchId, employee.id, actor);
  const assignment = await service.assignShift(organizationId, branchId, shift.id, employee.id, actor);
  const canceled = await service.setShiftAssignmentStatus(organizationId, branchId, shift.id, employee.id, 'CANCELED', actor);
  assert.equal(canceled.id, assignment.id);
  assert.equal(state.shiftAssignments.length, 1);
  assert.equal(state.shiftAssignments[0].status, 'CANCELED');
  assert.equal(state.audits.at(-1).eventType, 'WORK_SHIFT_ASSIGNMENT_CANCELED');
});

test('rechaza empleado inactivo y reactiva una asignación sin duplicarla', async () => {
  const { service, state, organizationId, branchId } = fixture(); const actor = randomUUID();
  const employee = await service.createEmployee(organizationId, { employeeCode: 'ana-01', displayName: 'Ana' }, actor);
  const shift = await service.createShift(organizationId, branchId, { scheduledStart: '2026-11-03T09:00:00.000Z', scheduledEnd: '2026-11-03T17:00:00.000Z' }, actor);
  await service.assignBranch(organizationId, branchId, employee.id, actor);
  await service.setBranchAssignmentStatus(organizationId, branchId, employee.id, 'INACTIVE', actor);
  await service.assignBranch(organizationId, branchId, employee.id, actor);
  assert.equal(state.assignments.length, 1);
  await service.setEmployeeStatus(organizationId, employee.id, 'INACTIVE', actor);
  await assert.rejects(() => service.assignShift(organizationId, branchId, shift.id, employee.id, actor), { status: 404 });
});

test('repetir asignación a turno no duplica el registro vigente', async () => {
  const { service, state, organizationId, branchId } = fixture(); const actor = randomUUID();
  const employee = await service.createEmployee(organizationId, { employeeCode: 'ana-01', displayName: 'Ana' }, actor);
  const shift = await service.createShift(organizationId, branchId, { scheduledStart: '2026-11-03T09:00:00.000Z', scheduledEnd: '2026-11-03T17:00:00.000Z' }, actor);
  await service.assignBranch(organizationId, branchId, employee.id, actor);
  await service.assignShift(organizationId, branchId, shift.id, employee.id, actor);
  await service.assignShift(organizationId, branchId, shift.id, employee.id, actor);
  assert.equal(state.shiftAssignments.length, 1);
  assert.equal(state.shiftAssignments[0].status, 'ACTIVE');
});

test('deniega asignar personal a turno cancelado', async () => {
  const { service, organizationId, branchId } = fixture(); const actor = randomUUID();
  const employee = await service.createEmployee(organizationId, { employeeCode: 'ana-01', displayName: 'Ana' }, actor);
  const shift = await service.createShift(organizationId, branchId, { scheduledStart: '2026-11-03T09:00:00.000Z', scheduledEnd: '2026-11-03T17:00:00.000Z' }, actor);
  await service.assignBranch(organizationId, branchId, employee.id, actor);
  await service.cancelShift(organizationId, branchId, shift.id, actor);
  await assert.rejects(() => service.assignShift(organizationId, branchId, shift.id, employee.id, actor), { status: 404 });
});

test('revierte asignación laboral y a turno si falla su auditoría', async () => {
  const { service, state, organizationId, branchId } = fixture(); const actor = randomUUID();
  const employee = await service.createEmployee(organizationId, { employeeCode: 'ana-01', displayName: 'Ana' }, actor);
  state.failAudit = true;
  await assert.rejects(() => service.assignBranch(organizationId, branchId, employee.id, actor));
  assert.equal(state.assignments.length, 0);
  state.failAudit = false;
  await service.assignBranch(organizationId, branchId, employee.id, actor);
  const shift = await service.createShift(organizationId, branchId, { scheduledStart: '2026-11-03T09:00:00.000Z', scheduledEnd: '2026-11-03T17:00:00.000Z' }, actor);
  state.failAudit = true;
  await assert.rejects(() => service.assignShift(organizationId, branchId, shift.id, employee.id, actor));
  assert.equal(state.shiftAssignments.length, 0);
});

test('rechaza periodos de turno inválidos antes de escribir', async () => {
  const { service, state, organizationId, branchId } = fixture();
  await assert.rejects(() => service.createShift(organizationId, branchId, { scheduledStart: '2026-11-03T17:00:00.000Z', scheduledEnd: '2026-11-03T09:00:00.000Z' }, randomUUID()), { status: 409 });
  assert.equal(state.shifts.length, 0);
});

test('ValidationPipe valida DTO de empleado y rechaza campos no autorizados', async () => {
  await assert.rejects(() => validate(CreateEmployeeDto, { employeeCode: 'ana-01', displayName: '   ' }), { status: 400 });
  await assert.rejects(() => validate(CreateEmployeeDto, { employeeCode: 'ana-01', displayName: 'Ana', status: 'ACTIVE' }), { status: 400 });
  await assert.rejects(() => validate(UpdateEmployeeDto, { displayName: null }), { status: 400 });
  const absent = await validate(UpdateEmployeeDto, {});
  assert.equal(absent.displayName, undefined);
  await assert.rejects(() => validate(CreateShiftDto, { scheduledStart: 'not-a-date', scheduledEnd: '2026-11-03T17:00:00.000Z' }), { status: 400 });
  await assert.rejects(() => validate(CreateShiftDto, { scheduledStart: '2026-11-03T09:00:00', scheduledEnd: '2026-11-03T17:00:00.000Z' }), { status: 400 });
  assert.equal((await validate(CreateShiftDto, { scheduledStart: '2026-11-03T09:00:00.000Z', scheduledEnd: '2026-11-03T17:00:00+00:00' })).scheduledEnd, '2026-11-03T17:00:00+00:00');
  await assert.rejects(() => validate(UpdateShiftDto, { scheduledStart: null }), { status: 400 });
  await assert.rejects(() => validate(UpdateShiftDto, { id: randomUUID() }), { status: 400 });
});

test('las rutas laborales declaran permisos y alcance obligatorio', () => {
  assert.deepEqual(Reflect.getMetadata(requiredPermissionsKey, EmployeesController.prototype.list), ['employees.read']);
  assert.deepEqual(Reflect.getMetadata(requiredPermissionsKey, WorkShiftsController.prototype.assignShift), ['work-shifts.manage']);
  assert.deepEqual(Reflect.getMetadata(authorizationScopeKey, EmployeesController), { organizationParam: 'organizationId' });
  assert.deepEqual(Reflect.getMetadata(authorizationScopeKey, WorkShiftsController), { organizationParam: 'organizationId', branchParam: 'branchId' });
});
