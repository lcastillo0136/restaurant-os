import { describe, expect, it } from 'vitest';
import {
  DemoRepository,
  RestRepository,
  type ApiError,
  type HttpTransport,
} from '../../src/data';
import {
  branchDateTimeInputValue,
  branchIsoInstant,
} from '../../src/WorkShiftsPanel';

const organizationId = 'organization-demo';
const centroBranchId = 'centro';

async function expectApiError(
  operation: Promise<unknown>,
  status: ApiError['status'],
): Promise<void> {
  await expect(operation).rejects.toMatchObject({ status });
}

describe('DemoRepository — administración de Fase 2.5', () => {
  it('aísla sucursales y valida creación, edición y códigos duplicados', async () => {
    const repository = new DemoRepository();

    expect(await repository.branches(organizationId)).toHaveLength(2);
    expect(await repository.branches('organization-external')).toHaveLength(1);

    await expectApiError(
      repository.createBranch({
        code: 'centro',
        displayName: 'Centro duplicado',
        timeZone: 'America/Mexico_City',
        status: 'ACTIVE',
      }),
      409,
    );

    const branch = await repository.createBranch({
      code: 'norte',
      displayName: 'Norte',
      timeZone: 'America/Mexico_City',
      status: 'ACTIVE',
    });
    const updated = await repository.updateBranch(branch.id, {
      displayName: 'Norte actualizado',
      timeZone: 'America/Tijuana',
    });

    expect(updated.displayName).toBe('Norte actualizado');
    expect(updated.timeZone).toBe('America/Tijuana');
  });

  it('valida empleados, asignaciones y sucursales inactivas', async () => {
    const repository = new DemoRepository();
    const employee = await repository.createEmployee({
      organizationId,
      employeeCode: 'emp-002',
      displayName: 'Luis Ortega',
      status: 'ACTIVE',
    });

    await expectApiError(
      repository.createEmployee({
        organizationId,
        employeeCode: 'emp-002',
        displayName: 'Duplicado',
        status: 'ACTIVE',
      }),
      409,
    );

    const assignment = await repository.assignEmployeeToBranch({
      organizationId,
      employeeId: employee.id,
      branchId: centroBranchId,
    });
    expect(assignment.status).toBe('ACTIVE');

    await expectApiError(
      repository.assignEmployeeToBranch({
        organizationId,
        employeeId: employee.id,
        branchId: centroBranchId,
      }),
      409,
    );

    await expectApiError(
      repository.assignEmployeeToBranch({
        organizationId,
        employeeId: employee.id,
        branchId: 'external-branch',
      }),
      404,
    );
  });

  it('crea, actualiza, cancela y asigna personal elegible a turnos', async () => {
    const repository = new DemoRepository();
    const shift = await repository.createWorkShift({
      organizationId,
      branchId: centroBranchId,
      scheduledStart: '2026-11-03T14:00:00.000Z',
      scheduledEnd: '2026-11-03T22:00:00.000Z',
    });

    const updated = await repository.updateWorkShift({
      organizationId,
      branchId: centroBranchId,
      id: shift.id,
      scheduledStart: '2026-11-03T15:00:00.000Z',
    });
    expect(updated.scheduledStart).toBe('2026-11-03T15:00:00.000Z');

    const assignment = await repository.assignEmployeeToWorkShift({
      organizationId,
      branchId: centroBranchId,
      id: shift.id,
      employeeId: 'e1',
    });
    expect(assignment.status).toBe('ACTIVE');

    await expectApiError(
      repository.assignEmployeeToWorkShift({
        organizationId,
        branchId: centroBranchId,
        id: shift.id,
        employeeId: 'e1',
      }),
      409,
    );

    await expectApiError(
      repository.createWorkShift({
        organizationId,
        branchId: centroBranchId,
        scheduledStart: '2026-11-03T22:00:00.000Z',
        scheduledEnd: '2026-11-03T14:00:00.000Z',
      }),
      409,
    );

    const canceled = await repository.cancelWorkShift({
      organizationId,
      branchId: centroBranchId,
      id: shift.id,
    });
    expect(canceled.status).toBe('CANCELED');
  });

  it('protege áreas y mesas, incluida su máquina de estados', async () => {
    const repository = new DemoRepository();

    await expectApiError(
      repository.createArea({
        organizationId,
        branchId: centroBranchId,
        code: 'salon',
        displayName: 'Duplicada',
      }),
      409,
    );

    await expectApiError(
      repository.updateAreaStatus({
        organizationId,
        branchId: centroBranchId,
        id: 'area-salon-centro',
        status: 'INACTIVE',
      }),
      409,
    );

    const area = await repository.createArea({
      organizationId,
      branchId: centroBranchId,
      code: 'privado',
      displayName: 'Privado',
    });
    await expect(repository.updateArea({
      organizationId,
      branchId: centroBranchId,
      id: area.id,
      displayName: 'Privado actualizado',
    })).resolves.toMatchObject({ displayName: 'Privado actualizado' });

    const table = await repository.createTable({
      organizationId,
      branchId: centroBranchId,
      areaId: area.id,
      code: 'p-01',
      capacity: 6,
    });
    expect(table.status).toBe('AVAILABLE');

    await expectApiError(
      repository.createTable({
        organizationId,
        branchId: centroBranchId,
        areaId: area.id,
        code: 'p-02',
        capacity: 0,
      }),
      400,
    );

    const reserved = await repository.updateTableStatus({
      organizationId,
      branchId: centroBranchId,
      id: table.id,
      status: 'RESERVED',
    });
    expect(reserved.status).toBe('RESERVED');

    await expectApiError(
      repository.updateTableStatus({
        organizationId,
        branchId: centroBranchId,
        id: table.id,
        status: 'CLEANING',
      }),
      409,
    );
  });

  it('mantiene sesiones estructurales coherentes, versionadas e históricas', async () => {
    const repository = new DemoRepository();
    const opened = await repository.openTableSession({
      organizationId,
      branchId: centroBranchId,
      tableId: 'table-centro-01',
    });

    expect(opened.status).toBe('OPEN');
    expect((await repository.tables(organizationId, centroBranchId))[0].status).toBe(
      'OCCUPIED',
    );

    await expectApiError(
      repository.openTableSession({
        organizationId,
        branchId: centroBranchId,
        tableId: 'table-centro-01',
      }),
      409,
    );

    await expectApiError(
      repository.closeTableSession({
        organizationId,
        branchId: centroBranchId,
        tableId: 'table-centro-01',
        sessionId: opened.id,
        version: opened.version + 1,
      }),
      409,
    );

    expect(await repository.currentTableSession(
      organizationId,
      centroBranchId,
      'table-centro-01',
    )).toMatchObject({ id: opened.id, status: 'OPEN', version: 1 });

    const closed = await repository.closeTableSession({
      organizationId,
      branchId: centroBranchId,
      tableId: 'table-centro-01',
      sessionId: opened.id,
      version: opened.version,
    });
    expect(closed).toMatchObject({ status: 'CLOSED', version: 2 });
    expect(closed.closedAt).not.toBeNull();

    await expectApiError(
      repository.closeTableSession({
        organizationId,
        branchId: centroBranchId,
        tableId: 'table-centro-01',
        sessionId: opened.id,
        version: opened.version,
      }),
      409,
    );

    const table = (await repository.tables(organizationId, centroBranchId)).find(
      (candidate) => candidate.id === 'table-centro-01',
    );
    expect(table?.status).toBe('CLEANING');
    expect(await repository.tableSessions(
      organizationId,
      centroBranchId,
      'table-centro-01',
    )).toHaveLength(1);
  });
});

describe('RestRepository — adaptador bloqueado', () => {
  it('prepara lecturas simuladas y bloquea escrituras sin red ni credenciales', async () => {
    const calls: string[] = [];
    const transport: HttpTransport = async (path) => {
      calls.push(path);
      return {
        status: 200,
        body: [],
      };
    };
    const blocked = new RestRepository(transport);
    const enabled = new RestRepository(transport, true);

    await expectApiError(blocked.createEmployee({
      organizationId,
      employeeCode: 'emp-999',
      displayName: 'Bloqueado',
      status: 'ACTIVE',
    }), 0);

    await enabled.workShifts(organizationId, centroBranchId);
    expect(calls).toEqual([
      `/organizations/${organizationId}/branches/${centroBranchId}/work-shifts`,
    ]);
  });

  it('consulta las rutas GET existentes y conserva el alcance organizacional y de sucursal', async () => {
    const calls: string[] = [];
    const transport: HttpTransport = async (path) => {
      calls.push(path);

      if (path === `/organizations/${organizationId}/branches`) {
        return {
          status: 200,
          body: [
            {
              id: centroBranchId,
              code: 'centro',
              displayName: 'Centro',
              timeZone: 'America/Mexico_City',
              status: 'ACTIVE',
            },
          ],
        };
      }

      if (path === `/organizations/${organizationId}/employees`) {
        return {
          status: 200,
          body: [
            {
              id: 'employee-1',
              organizationId,
              employeeCode: 'emp-001',
              displayName: 'Ana Morales',
              status: 'ACTIVE',
            },
          ],
        };
      }

      if (path === `/organizations/${organizationId}/branches/${centroBranchId}/employees`) {
        return {
          status: 200,
          body: [
            {
              id: 'branch-assignment-1',
              organizationId,
              employeeId: 'employee-1',
              branchId: centroBranchId,
              status: 'ACTIVE',
              employee: {
                id: 'employee-1',
                employeeCode: 'emp-001',
              },
            },
          ],
        };
      }

      if (path === `/organizations/${organizationId}/branches/${centroBranchId}/work-shifts`) {
        return { status: 200, body: [] };
      }

      if (path === `/organizations/${organizationId}/branches/${centroBranchId}/work-shifts/shift-1/assignments`) {
        return {
          status: 200,
          body: [
            {
              id: 'shift-assignment-1',
              organizationId,
              branchId: centroBranchId,
              workShiftId: 'shift-1',
              employeeId: 'employee-1',
              status: 'ACTIVE',
            },
          ],
        };
      }

      if (path === `/organizations/${organizationId}/branches/${centroBranchId}/areas`) {
        return { status: 200, body: [] };
      }

      if (path === `/organizations/${organizationId}/branches/${centroBranchId}/tables`) {
        return {
          status: 200,
          body: [
            {
              id: 'table-1',
              organizationId,
              branchId: centroBranchId,
              areaId: 'area-1',
              code: 'm-01',
              capacity: 4,
              status: 'AVAILABLE',
            },
          ],
        };
      }

      if (path === `/organizations/${organizationId}/branches/${centroBranchId}/tables/table-1/sessions`) {
        return { status: 200, body: [] };
      }

      if (path === `/organizations/${organizationId}/branches/${centroBranchId}/tables/table-1/sessions/current`) {
        return { status: 404, body: null };
      }

      throw new Error(`Ruta inesperada: ${path}`);
    };
    const repository = new RestRepository(transport, true);

    await expect(repository.branches(organizationId)).resolves.toHaveLength(1);
    await expect(repository.employees(organizationId)).resolves.toHaveLength(1);
    await expect(
      repository.employeeBranchAssignments(organizationId, 'employee-1'),
    ).resolves.toMatchObject([{ branchId: centroBranchId }]);
    await expect(repository.workShifts(organizationId, centroBranchId)).resolves.toEqual([]);
    await expect(
      repository.workShiftAssignments(organizationId, centroBranchId, 'shift-1'),
    ).resolves.toMatchObject([{ employeeId: 'employee-1' }]);
    await expect(repository.areas(organizationId, centroBranchId)).resolves.toEqual([]);
    await expect(
      repository.tables(organizationId, centroBranchId, 'area-1'),
    ).resolves.toHaveLength(1);
    await expect(
      repository.tableSessions(organizationId, centroBranchId, 'table-1'),
    ).resolves.toEqual([]);
    await expect(
      repository.currentTableSession(organizationId, centroBranchId, 'table-1'),
    ).resolves.toBeNull();

    expect(calls).toEqual([
      `/organizations/${organizationId}/branches`,
      `/organizations/${organizationId}/employees`,
      `/organizations/${organizationId}/branches`,
      `/organizations/${organizationId}/branches/${centroBranchId}/employees`,
      `/organizations/${organizationId}/branches/${centroBranchId}/work-shifts`,
      `/organizations/${organizationId}/branches/${centroBranchId}/work-shifts/shift-1/assignments`,
      `/organizations/${organizationId}/branches/${centroBranchId}/areas`,
      `/organizations/${organizationId}/branches/${centroBranchId}/tables`,
      `/organizations/${organizationId}/branches/${centroBranchId}/tables/table-1/sessions`,
      `/organizations/${organizationId}/branches/${centroBranchId}/tables/table-1/sessions/current`,
    ]);
  });
});

describe('Zona horaria de turnos', () => {
  it('convierte el horario laboral de una sucursal sin usar la zona horaria del equipo', () => {
    const branchTimeZone = 'Europe/Madrid';
    const converted = branchIsoInstant('2026-06-01T10:30', branchTimeZone);

    expect(converted).toEqual({ instant: '2026-06-01T08:30:00.000Z' });
    expect(
      branchDateTimeInputValue('2026-06-01T08:30:00.000Z', branchTimeZone),
    ).toBe('2026-06-01T10:30');
  });

  it('rechaza horas inexistentes y ambiguas antes de enviar el turno', () => {
    expect(branchIsoInstant('2026-03-29T02:30', 'Europe/Madrid')).toMatchObject({
      error: expect.stringContaining('no existe'),
    });
    expect(branchIsoInstant('2026-10-25T02:30', 'Europe/Madrid')).toMatchObject({
      error: expect.stringContaining('ambigua'),
    });
  });
});
