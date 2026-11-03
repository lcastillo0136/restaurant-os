import 'reflect-metadata';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import {
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '../../dist/auth/auth.guard.js';
import { AuthService } from '../../dist/auth/auth.service.js';
import { LoginRateLimiterService } from '../../dist/auth/login-rate-limiter.service.js';
import { AuthorizationGuard } from '../../dist/authorization/authorization.guard.js';
import { AuthorizationService } from '../../dist/authorization/authorization.service.js';
import { createValidationPipe } from '../../dist/common/http/validation.pipe.js';
import { HttpExceptionFilter } from '../../dist/common/http/http-exception.filter.js';
import { EmployeesController, WorkShiftsController } from '../../dist/employees/employees.controller.js';
import {
  CreateEmployeeDto,
  CreateShiftDto,
  UpdateEmployeeDto,
} from '../../dist/employees/dto/employees.dto.js';
import { FloorController } from '../../dist/floor/floor.controller.js';
import {
  CreateAreaDto,
  CreateTableDto,
  TableStatusDto,
} from '../../dist/floor/dto/floor.dto.js';
import {
  BranchesController,
  OrganizationsController,
} from '../../dist/organizations/organizations.controller.js';
import {
  CreateBranchDto,
  UpdateBranchDto,
} from '../../dist/organizations/dto/branch.dto.js';
import { UpdateOrganizationDto } from '../../dist/organizations/dto/organization.dto.js';

const organizationId = '11111111-1111-4111-8111-111111111111';
const branchId = '22222222-2222-4222-8222-222222222222';
const otherOrganizationId = '33333333-3333-4333-8333-333333333333';
const otherBranchId = '44444444-4444-4444-8444-444444444444';
const employeeId = '55555555-5555-4555-8555-555555555555';
const tableId = '66666666-6666-4666-8666-666666666666';

function contextForAuthorization(handler, controller, request) {
  return {
    getHandler: () => handler,
    getClass: () => controller,
    switchToHttp: () => ({ getRequest: () => request }),
  };
}

function contextForAuthentication(request) {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  };
}

function grant({
  userId,
  organization = organizationId,
  branch = null,
  scope = 'ORGANIZATION',
  roleStatus = 'ACTIVE',
  permissionStatus = 'ACTIVE',
  permissions = ['employees.read'],
}) {
  return {
    userId,
    organizationId: organization,
    branchId: branch,
    scope,
    organization: { status: 'ACTIVE' },
    branch: branch
      ? { status: 'ACTIVE', organizationId: organization }
      : null,
    role: {
      code: 'TEST_ROLE',
      status: roleStatus,
      permissions: permissions.map((code) => ({
        permission: { code, status: permissionStatus },
      })),
    },
  };
}

function authorizationService(grants, branches) {
  const prisma = {
    userRole: {
      findMany: async ({ where }) =>
        grants.filter(
          (item) =>
            item.userId === where.userId &&
            item.role.status === 'ACTIVE' &&
            item.organization.status === 'ACTIVE',
        ),
    },
    branch: {
      findFirst: async ({ where }) =>
        branches.find(
          (branch) =>
            branch.id === where.id &&
            branch.organizationId === where.organizationId &&
            branch.status === where.status,
        ) ?? null,
    },
  };

  return new AuthorizationService(prisma);
}

function validationMetadata(metatype) {
  return {
    type: 'body',
    metatype,
  };
}

async function validate(metatype, value) {
  return createValidationPipe().transform(value, validationMetadata(metatype));
}

function responseWithRequestId(requestId = 'request-2.6-c') {
  return {
    locals: { requestId },
    statusCode: undefined,
    body: undefined,
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function hostFor(request, response) {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  };
}

test('V26-AUT-01, V26-AUT-02 y V26-AUT-03: AuthGuard distingue identidad válida de token ausente, inválido o revocado', async () => {
  const identity = {
    sessionId: 'session-1',
    userId: 'user-1',
    identitySource: 'LOCAL',
    identitySubject: 'operator',
    displayName: 'Operator',
  };
  const authenticator = {
    authenticate: async (token) => {
      if (token === 'a'.repeat(43)) {
        return identity;
      }

      throw new HttpException('invalid token detail', 401);
    },
  };
  const guard = new AuthGuard(authenticator);
  const missing = { header: () => undefined };
  const invalid = { header: () => `Bearer ${'b'.repeat(43)}` };
  const valid = { header: () => `Bearer ${'a'.repeat(43)}` };

  await assert.rejects(
    () => guard.canActivate(contextForAuthentication(missing)),
    { status: 401 },
  );
  await assert.rejects(
    () => guard.canActivate(contextForAuthentication(invalid)),
    { status: 401 },
  );
  assert.equal(invalid.auth, undefined);
  assert.equal(await guard.canActivate(contextForAuthentication(valid)), true);
  assert.deepEqual(valid.auth, identity);

  const revokedAuth = new AuthService(
    {},
    {},
    { authenticate: async () => null },
    {},
    new LoginRateLimiterService({ limit: 2, windowMs: 1_000 }),
  );
  const revokedRequest = { header: () => `Bearer ${'c'.repeat(43)}` };
  await assert.rejects(
    () => new AuthGuard(revokedAuth).canActivate(contextForAuthentication(revokedRequest)),
    { status: 401 },
  );
  assert.equal(revokedRequest.auth, undefined);
});

test('V26-AUT-01: credenciales incorrectas no producen token ni registran contraseña', async () => {
  const password = `test-${randomUUID()}`;
  const auditEvents = [];
  const auth = new AuthService(
    {
      appUser: {
        findFirst: async () => ({
          id: 'user-1',
          status: 'ACTIVE',
          credential: { passwordHash: 'hash-placeholder' },
        }),
      },
    },
    { verify: async () => false },
    { issue: async () => assert.fail('No debe emitir tokens') },
    { record: async (event) => auditEvents.push(event) },
    new LoginRateLimiterService({ limit: 2, windowMs: 1_000 }),
  );

  await assert.rejects(
    () => auth.login('operator', password, 'request-login-failure'),
    (error) => {
      assert.equal(error.status, 401);
      assert.equal(String(error.message).includes(password), false);
      return true;
    },
  );
  assert.equal(JSON.stringify(auditEvents).includes(password), false);
  assert.deepEqual(auditEvents, [
    {
      eventType: 'AUTH_LOGIN',
      result: 'FAILURE',
      requestId: 'request-login-failure',
      actorUserId: 'user-1',
    },
  ]);
});

test('V26-AUT-04, V26-AUT-05 y V26-AUT-06: AuthorizationGuard real aplica permiso y alcance organizacional o de sucursal', async () => {
  const branches = [
    { id: branchId, organizationId, status: 'ACTIVE' },
    { id: otherBranchId, organizationId, status: 'ACTIVE' },
  ];
  const grants = [
    grant({
      userId: 'organization-user',
      permissions: ['employees.read'],
    }),
    grant({
      userId: 'branch-user',
      branch: branchId,
      scope: 'BRANCH',
      permissions: ['employees.read'],
    }),
  ];
  const guard = new AuthorizationGuard(
    new Reflector(),
    authorizationService(grants, branches),
  );

  const organizationRequest = {
    auth: { userId: 'organization-user' },
    params: { organizationId },
  };
  assert.equal(
    await guard.canActivate(
      contextForAuthorization(
        EmployeesController.prototype.list,
        EmployeesController,
        organizationRequest,
      ),
    ),
    true,
  );

  const branchRequest = {
    auth: { userId: 'branch-user' },
    params: { organizationId, branchId },
  };
  assert.equal(
    await guard.canActivate(
      contextForAuthorization(
        WorkShiftsController.prototype.employees,
        WorkShiftsController,
        branchRequest,
      ),
    ),
    true,
  );

  const crossBranchRequest = {
    auth: { userId: 'branch-user' },
    params: { organizationId, branchId: otherBranchId },
  };
  await assert.rejects(
    () =>
      guard.canActivate(
        contextForAuthorization(
          WorkShiftsController.prototype.employees,
          WorkShiftsController,
          crossBranchRequest,
        ),
      ),
    { status: 403 },
  );
  await assert.rejects(
    () =>
      guard.canActivate(
        contextForAuthorization(
          EmployeesController.prototype.list,
          EmployeesController,
          { auth: { userId: 'without-permission' }, params: { organizationId } },
        ),
      ),
    { status: 403 },
  );
});

test('V26-ORG-01, V26-ORG-02 y V26-AUT-07: RBAC real niega otra organización, sucursal inactiva, rol inactivo y permiso revocado', async () => {
  const branches = [{ id: branchId, organizationId, status: 'ACTIVE' }];
  const grants = [
    grant({
      userId: 'other-organization-user',
      organization: otherOrganizationId,
      permissions: ['table-sessions.manage'],
    }),
    grant({
      userId: 'inactive-role-user',
      branch: branchId,
      scope: 'BRANCH',
      roleStatus: 'INACTIVE',
      permissions: ['table-sessions.manage'],
    }),
    grant({
      userId: 'revoked-permission-user',
      branch: branchId,
      scope: 'BRANCH',
      permissionStatus: 'INACTIVE',
      permissions: ['table-sessions.manage'],
    }),
    grant({
      userId: 'organization-user',
      permissions: ['table-sessions.manage'],
    }),
  ];
  const guard = new AuthorizationGuard(
    new Reflector(),
    authorizationService(grants, branches),
  );
  const scope = (userId, scopedBranchId = branchId) =>
    contextForAuthorization(FloorController.prototype.open, FloorController, {
      auth: { userId },
      params: { organizationId, branchId: scopedBranchId },
    });

  for (const userId of [
    'other-organization-user',
    'inactive-role-user',
    'revoked-permission-user',
  ]) {
    await assert.rejects(() => guard.canActivate(scope(userId)), { status: 403 });
  }
  await assert.rejects(
    () => guard.canActivate(scope('organization-user', otherBranchId)),
    { status: 403 },
  );
});

test('V26-ORG-05, V26-EMP-05 y V26-FLR-02: ValidationPipe real rechaza DTOs inválidos, null e inmutables', async () => {
  const areaId = '77777777-7777-4777-8777-777777777777';
  const invalidInputs = [
    [CreateBranchDto, { code: 'branch', displayName: '   ', timeZone: 'America/Mexico_City' }],
    [UpdateBranchDto, { displayName: null }],
    [UpdateBranchDto, { code: 'immutable' }],
    [CreateEmployeeDto, { employeeCode: 'employee', displayName: null }],
    [UpdateEmployeeDto, { status: 'ACTIVE' }],
    [CreateShiftDto, { scheduledStart: '2026-11-03T08:00', scheduledEnd: '2026-11-03T16:00' }],
    [CreateAreaDto, { code: 'salon', displayName: '   ' }],
    [CreateTableDto, { code: 'm-1', areaId, capacity: 1.5 }],
    [TableStatusDto, { status: 'OCCUPIED' }],
  ];

  for (const [dto, input] of invalidInputs) {
    await assert.rejects(() => validate(dto, input), { status: 400 });
  }

  const branchUpdate = await validate(UpdateBranchDto, {});
  assert.equal(branchUpdate.displayName, undefined);
  assert.equal(branchUpdate.timeZone, undefined);
});

test('V26-AUT-08: controladores organizacionales delegan sólo UUID de ruta válido y preservan el alcance', async () => {
  const calls = [];
  const organizations = {
    organization: async (...arguments_) => {
      calls.push(['organization', arguments_]);
      return { id: organizationId };
    },
    branch: async (...arguments_) => {
      calls.push(['branch', arguments_]);
      return { id: branchId };
    },
  };
  const organizationsController = new OrganizationsController(organizations);
  const branchesController = new BranchesController(organizations);

  assert.throws(
    () => organizationsController.get({ params: { organizationId: 'not-a-uuid' } }),
    { status: 400 },
  );
  await organizationsController.get({ params: { organizationId } });
  await branchesController.get({
    params: { organizationId, branchId },
  });

  assert.deepEqual(calls, [
    ['organization', [organizationId]],
    ['branch', [organizationId, branchId]],
  ]);
});

test('V26-AUT-08: controladores de empleados, turnos y mesas conservan ruta, actor y DTO aprobados', async () => {
  const calls = [];
  const employeesService = {
    createEmployee: async (...arguments_) => {
      calls.push(['employee', arguments_]);
      return { id: employeeId };
    },
    createShift: async (...arguments_) => {
      calls.push(['shift', arguments_]);
      return { id: 'shift-1' };
    },
  };
  const floorService = {
    openSession: async (...arguments_) => {
      calls.push(['session', arguments_]);
      return { id: 'session-1' };
    },
  };
  const employeeController = new EmployeesController(employeesService);
  const shiftController = new WorkShiftsController(employeesService);
  const floorController = new FloorController(floorService);
  const request = { auth: { userId: 'actor-1' } };
  const employeeDto = { employeeCode: 'emp-001', displayName: 'Operador' };
  const shiftDto = {
    scheduledStart: '2026-11-03T08:00:00.000Z',
    scheduledEnd: '2026-11-03T16:00:00.000Z',
  };

  await employeeController.create(organizationId, employeeDto, request);
  await shiftController.create(organizationId, branchId, shiftDto, request);
  await floorController.open(organizationId, branchId, tableId, request);

  assert.deepEqual(calls, [
    ['employee', [organizationId, employeeDto, 'actor-1']],
    ['shift', [organizationId, branchId, shiftDto, 'actor-1']],
    ['session', [organizationId, branchId, tableId, 'actor-1']],
  ]);
});

test('V26-AUT-08: el filtro HTTP normaliza 400, 401, 403, 404 y 409 sin filtrar detalles internos', () => {
  const filter = new HttpExceptionFilter();
  const sensitiveDetail = 'postgresql://private-user:private-secret@localhost/restaurant_dev';

  for (const status of [400, 401, 403, 404, 409]) {
    const response = responseWithRequestId();
    filter.catch(
      new HttpException(sensitiveDetail, status),
      hostFor({ method: 'GET', path: '/api/v1/protected-resource' }, response),
    );

    assert.equal(response.statusCode, status);
    assert.equal(JSON.stringify(response.body).includes('private-secret'), false);
    assert.equal(response.body.path, '/api/v1/protected-resource');
    assert.equal(response.body.requestId, 'request-2.6-c');
  }
});

test('V26-AUT-04: AuthorizationGuard no sustituye una ausencia de identidad por autorización', async () => {
  const guard = new AuthorizationGuard(
    new Reflector(),
    authorizationService([], []),
  );

  await assert.rejects(
    () =>
      guard.canActivate(
        contextForAuthorization(
          EmployeesController.prototype.list,
          EmployeesController,
          { params: { organizationId } },
        ),
      ),
    ForbiddenException,
  );
});
