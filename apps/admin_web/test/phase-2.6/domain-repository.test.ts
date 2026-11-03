import { describe, expect, it } from 'vitest';
import {
  DemoRepository,
  type ApiError,
  type DemoSimulationMode,
} from '../../src/data';
import { branchIsoInstant } from '../../src/WorkShiftsPanel';

const organizationId = 'organization-demo';
const centroBranchId = 'centro';
const terrazaBranchId = 'terraza';

async function expectApiError(
  operation: Promise<unknown>,
  status: ApiError['status'],
): Promise<void> {
  await expect(operation).rejects.toMatchObject({ status });
}

describe('Fase 2.6-B — organización, sucursales y errores simulados', () => {
  it('V26-ORG-03: no expone recursos de otra organización o sucursal', async () => {
    const repository = new DemoRepository();

    await expectApiError(
      repository.tables(organizationId, 'external-branch'),
      404,
    );
    await expectApiError(
      repository.tables('organization-external', centroBranchId),
      404,
    );
    await expectApiError(
      repository.createArea({
        organizationId,
        branchId: 'external-branch',
        code: 'ajena',
        displayName: 'Área ajena',
      }),
      404,
    );

    expect(await repository.tables(organizationId, centroBranchId)).toHaveLength(2);
  });

  it('V26-ORG-02: bloquea operaciones de dominio en una sucursal inactiva', async () => {
    const repository = new DemoRepository();
    const inactiveBranch = await repository.createBranch({
      code: 'inactiva',
      displayName: 'Sucursal inactiva',
      timeZone: 'America/Mexico_City',
      status: 'INACTIVE',
    });

    await expectApiError(
      repository.createArea({
        organizationId,
        branchId: inactiveBranch.id,
        code: 'salon',
        displayName: 'Salón bloqueado',
      }),
      409,
    );

    expect(await repository.areas(organizationId, inactiveBranch.id)).toEqual([]);
  });

  it('V26-AUT-03, V26-AUT-04 y V26-ADM-08: representa 401, 403 y 0 sin mutar datos', async () => {
    const repository = new DemoRepository();
    const initialEmployees = await repository.employees(organizationId);
    const errorModes: Array<[DemoSimulationMode, ApiError['status']]> = [
      ['SESSION_EXPIRED', 401],
      ['FORBIDDEN', 403],
      ['OFFLINE', 0],
    ];

    for (const [mode, status] of errorModes) {
      repository.setSimulationMode(mode);
      await expectApiError(repository.employees(organizationId), status);
    }

    repository.setSimulationMode('OFFLINE');
    await expectApiError(
      repository.createEmployee({
        organizationId,
        employeeCode: 'emp-offline',
        displayName: 'Sin confirmación',
        status: 'ACTIVE',
      }),
      0,
    );

    repository.setSimulationMode('ONLINE');
    expect(await repository.employees(organizationId)).toEqual(initialEmployees);
  });
});

describe('Fase 2.6-B — empleados, asignaciones y turnos', () => {
  it('V26-EMP-01 y V26-EMP-04: crea empleados y rechaza código o sucursal ajenos sin filas adicionales', async () => {
    const repository = new DemoRepository();
    const employee = await repository.createEmployee({
      organizationId,
      employeeCode: 'emp-026',
      displayName: 'Empleado de prueba',
      status: 'ACTIVE',
    });

    await expectApiError(
      repository.createEmployee({
        organizationId,
        employeeCode: 'emp-026',
        displayName: 'Código duplicado',
        status: 'ACTIVE',
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

    expect(await repository.employeeBranchAssignments(organizationId, employee.id)).toEqual([]);
  });

  it('V26-EMP-02, V26-EMP-03 y V26-EMP-04: sólo asigna empleados activos una vez a una sucursal local', async () => {
    const repository = new DemoRepository();
    const inactiveEmployee = await repository.createEmployee({
      organizationId,
      employeeCode: 'emp-inactivo',
      displayName: 'Empleado inactivo',
      status: 'INACTIVE',
    });
    const activeEmployee = await repository.createEmployee({
      organizationId,
      employeeCode: 'emp-activo',
      displayName: 'Empleado activo',
      status: 'ACTIVE',
    });

    await expectApiError(
      repository.assignEmployeeToBranch({
        organizationId,
        employeeId: inactiveEmployee.id,
        branchId: centroBranchId,
      }),
      409,
    );

    const assignment = await repository.assignEmployeeToBranch({
      organizationId,
      employeeId: activeEmployee.id,
      branchId: terrazaBranchId,
    });
    expect(assignment.status).toBe('ACTIVE');

    await expectApiError(
      repository.assignEmployeeToBranch({
        organizationId,
        employeeId: activeEmployee.id,
        branchId: terrazaBranchId,
      }),
      409,
    );
    expect(await repository.employeeBranchAssignments(organizationId, activeEmployee.id)).toHaveLength(1);
  });

  it('V26-EMP-05: rechaza instantes sin offset y periodos temporales inválidos', async () => {
    const repository = new DemoRepository();

    await expectApiError(
      repository.createWorkShift({
        organizationId,
        branchId: centroBranchId,
        scheduledStart: '2026-11-04T09:00',
        scheduledEnd: '2026-11-04T17:00',
      }),
      400,
    );
    await expectApiError(
      repository.createWorkShift({
        organizationId,
        branchId: centroBranchId,
        scheduledStart: '2026-11-04T17:00:00.000Z',
        scheduledEnd: '2026-11-04T09:00:00.000Z',
      }),
      409,
    );

    expect(await repository.workShifts(organizationId, centroBranchId)).toHaveLength(1);
  });

  it('V26-EMP-06 y V26-EMP-07: convierte en zona IANA y rechaza horas DST ambiguas o inexistentes', () => {
    expect(branchIsoInstant('2026-06-01T10:30', 'Europe/Madrid')).toEqual({
      instant: '2026-06-01T08:30:00.000Z',
    });
    expect(branchIsoInstant('2026-03-29T02:30', 'Europe/Madrid')).toMatchObject({
      error: expect.stringContaining('no existe'),
    });
    expect(branchIsoInstant('2026-10-25T02:30', 'Europe/Madrid')).toMatchObject({
      error: expect.stringContaining('ambigua'),
    });
  });

  it('V26-EMP-08: impide asignar personal a un turno cancelado', async () => {
    const repository = new DemoRepository();
    const shift = await repository.createWorkShift({
      organizationId,
      branchId: centroBranchId,
      scheduledStart: '2026-11-04T14:00:00.000Z',
      scheduledEnd: '2026-11-04T22:00:00.000Z',
    });
    await repository.cancelWorkShift({
      organizationId,
      branchId: centroBranchId,
      id: shift.id,
    });

    await expectApiError(
      repository.assignEmployeeToWorkShift({
        organizationId,
        branchId: centroBranchId,
        id: shift.id,
        employeeId: 'e1',
      }),
      409,
    );
    expect(await repository.workShiftAssignments(organizationId, centroBranchId, shift.id)).toEqual([]);
  });

  it('V26-EMP-04 y V26-EMP-08: rechaza empleado sin asignación activa y asignación de turno duplicada', async () => {
    const repository = new DemoRepository();
    const employee = await repository.createEmployee({
      organizationId,
      employeeCode: 'emp-turno',
      displayName: 'Sin asignación laboral',
      status: 'ACTIVE',
    });
    const shift = await repository.createWorkShift({
      organizationId,
      branchId: centroBranchId,
      scheduledStart: '2026-11-05T14:00:00.000Z',
      scheduledEnd: '2026-11-05T22:00:00.000Z',
    });

    await expectApiError(
      repository.assignEmployeeToWorkShift({
        organizationId,
        branchId: centroBranchId,
        id: shift.id,
        employeeId: employee.id,
      }),
      404,
    );

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
  });
});

describe('Fase 2.6-B — áreas y mesas', () => {
  it('V26-FLR-01 y V26-FLR-04: evita códigos duplicados y desactivar un área con mesas', async () => {
    const repository = new DemoRepository();

    await expectApiError(
      repository.createArea({
        organizationId,
        branchId: centroBranchId,
        code: 'salon',
        displayName: 'Código duplicado',
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

    expect(
      (await repository.areas(organizationId, centroBranchId)).find(
        (area) => area.id === 'area-salon-centro',
      )?.status,
    ).toBe('ACTIVE');
  });

  it('V26-FLR-02 y V26-FLR-03: valida capacidad y sólo traslada mesas a áreas activas de su sucursal', async () => {
    const repository = new DemoRepository();
    const targetArea = await repository.createArea({
      organizationId,
      branchId: centroBranchId,
      code: 'privado-026',
      displayName: 'Privado 026',
    });

    await expectApiError(
      repository.createTable({
        organizationId,
        branchId: centroBranchId,
        areaId: targetArea.id,
        code: 'invalid-capacity',
        capacity: 0,
      }),
      400,
    );

    const moved = await repository.updateTable({
      organizationId,
      branchId: centroBranchId,
      id: 'table-centro-01',
      areaId: targetArea.id,
    });
    expect(moved.areaId).toBe(targetArea.id);

    await expectApiError(
      repository.updateTable({
        organizationId,
        branchId: centroBranchId,
        id: 'table-centro-01',
        areaId: 'area-terraza-branch',
      }),
      404,
    );
    expect(
      (await repository.tables(organizationId, centroBranchId)).find(
        (table) => table.id === 'table-centro-01',
      )?.areaId,
    ).toBe(targetArea.id);
  });

  it('V26-FLR-05 y V26-FLR-06: permite transiciones administrativas válidas y rechaza OCCUPIED manual o conflictos', async () => {
    const repository = new DemoRepository();
    const reserved = await repository.updateTableStatus({
      organizationId,
      branchId: centroBranchId,
      id: 'table-centro-01',
      status: 'RESERVED',
    });
    expect(reserved.status).toBe('RESERVED');

    await expectApiError(
      repository.updateTableStatus({
        organizationId,
        branchId: centroBranchId,
        id: 'table-centro-01',
        status: 'OCCUPIED' as never,
      }),
      400,
    );
    await expectApiError(
      repository.updateTableStatus({
        organizationId,
        branchId: centroBranchId,
        id: 'table-centro-01',
        status: 'CLEANING',
      }),
      409,
    );
    expect(
      (await repository.tables(organizationId, centroBranchId)).find(
        (table) => table.id === 'table-centro-01',
      )?.status,
    ).toBe('RESERVED');
  });
});

describe('Fase 2.6-B — sesiones estructurales', () => {
  it('V26-SES-01, V26-SES-02, V26-SES-03 y V26-SES-06: abre una sola sesión desde AVAILABLE', async () => {
    const repository = new DemoRepository();
    const session = await repository.openTableSession({
      organizationId,
      branchId: centroBranchId,
      tableId: 'table-centro-01',
    });

    expect(session).toMatchObject({ status: 'OPEN', version: 1 });
    expect(
      (await repository.tables(organizationId, centroBranchId)).find(
        (table) => table.id === 'table-centro-01',
      )?.status,
    ).toBe('OCCUPIED');

    await expectApiError(
      repository.openTableSession({
        organizationId,
        branchId: centroBranchId,
        tableId: 'table-centro-01',
      }),
      409,
    );
    await expectApiError(
      repository.openTableSession({
        organizationId,
        branchId: centroBranchId,
        tableId: 'table-centro-02',
      }),
      409,
    );
    expect(await repository.tableSessions(organizationId, centroBranchId, 'table-centro-01')).toHaveLength(1);
  });

  it('V26-SES-04, V26-SES-05, V26-SES-06 y V26-SES-07: cierra con versión vigente y conserva historial', async () => {
    const repository = new DemoRepository();
    const opened = await repository.openTableSession({
      organizationId,
      branchId: centroBranchId,
      tableId: 'table-centro-01',
    });

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
    expect(await repository.currentTableSession(organizationId, centroBranchId, 'table-centro-01')).toMatchObject({
      id: opened.id,
      status: 'OPEN',
      version: 1,
    });

    const closed = await repository.closeTableSession({
      organizationId,
      branchId: centroBranchId,
      tableId: 'table-centro-01',
      sessionId: opened.id,
      version: opened.version,
    });
    expect(closed).toMatchObject({ status: 'CLOSED', version: 2 });
    expect(closed.closedAt).not.toBeNull();
    expect(await repository.currentTableSession(organizationId, centroBranchId, 'table-centro-01')).toBeNull();
    expect(await repository.tableSessions(organizationId, centroBranchId, 'table-centro-01')).toMatchObject([
      { id: opened.id, status: 'CLOSED' },
    ]);
    expect(
      (await repository.tables(organizationId, centroBranchId)).find(
        (table) => table.id === 'table-centro-01',
      )?.status,
    ).toBe('CLEANING');
  });

  it('V26-SES-05 y V26-SES-08: no deja mutaciones parciales ante cierre repetido o recurso fuera de alcance', async () => {
    const repository = new DemoRepository();
    const opened = await repository.openTableSession({
      organizationId,
      branchId: centroBranchId,
      tableId: 'table-centro-01',
    });
    const closed = await repository.closeTableSession({
      organizationId,
      branchId: centroBranchId,
      tableId: 'table-centro-01',
      sessionId: opened.id,
      version: opened.version,
    });

    await expectApiError(
      repository.closeTableSession({
        organizationId,
        branchId: centroBranchId,
        tableId: 'table-centro-01',
        sessionId: opened.id,
        version: closed.version,
      }),
      409,
    );
    await expectApiError(
      repository.openTableSession({
        organizationId,
        branchId: terrazaBranchId,
        tableId: 'table-centro-01',
      }),
      404,
    );

    expect(await repository.tableSessions(organizationId, centroBranchId, 'table-centro-01')).toMatchObject([
      { id: opened.id, status: 'CLOSED', version: 2 },
    ]);
    expect(
      (await repository.tables(organizationId, centroBranchId)).find(
        (table) => table.id === 'table-centro-01',
      )?.status,
    ).toBe('CLEANING');
  });
});
