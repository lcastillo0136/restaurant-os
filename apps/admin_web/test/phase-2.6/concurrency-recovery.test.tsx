import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TableSessionsPanel } from '../../src/TableSessionsPanel';
import {
  DemoRepository,
  type ApiError,
  type DiningTable,
  type Permission,
  type TableSession,
} from '../../src/data';

const organizationId = 'organization-demo';
const centroBranchId = 'centro';
const terrazaBranchId = 'terraza';

const sessionPermissions: ReadonlySet<Permission> = new Set([
  'table-sessions.read',
  'table-sessions.manage',
]);

function deferred<T>() {
  let resolve: (value: T) => void;
  let reject: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return {
    promise,
    reject: reject!,
    resolve: resolve!,
  };
}

async function expectApiError(
  operation: Promise<unknown>,
  status: ApiError['status'],
): Promise<void> {
  await expect(operation).rejects.toMatchObject({ status });
}

describe('Fase 2.6-E — conflictos deterministas de sesiones', () => {
  it('V26-SES-02 y V26-SES-08: dos aperturas secuenciadas dejan una sola sesión OPEN y no cambian el estado tras el conflicto', async () => {
    const repository = new DemoRepository();

    const results = await Promise.allSettled([
      repository.openTableSession({
        organizationId,
        branchId: centroBranchId,
        tableId: 'table-centro-01',
      }),
      repository.openTableSession({
        organizationId,
        branchId: centroBranchId,
        tableId: 'table-centro-01',
      }),
    ]);

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
    expect(
      await repository.currentTableSession(
        organizationId,
        centroBranchId,
        'table-centro-01',
      ),
    ).toMatchObject({ status: 'OPEN', version: 1 });
    expect(
      (await repository.tables(organizationId, centroBranchId)).find(
        (table) => table.id === 'table-centro-01',
      )?.status,
    ).toBe('OCCUPIED');
    expect(
      await repository.tableSessions(
        organizationId,
        centroBranchId,
        'table-centro-01',
      ),
    ).toHaveLength(1);
  });

  it('V26-SES-04, V26-SES-05, V26-SES-06 y V26-SES-07: dos cierres con la misma versión confirman sólo el primero y conservan historial coherente', async () => {
    const repository = new DemoRepository();
    const opened = await repository.openTableSession({
      organizationId,
      branchId: centroBranchId,
      tableId: 'table-centro-01',
    });

    const results = await Promise.allSettled([
      repository.closeTableSession({
        organizationId,
        branchId: centroBranchId,
        tableId: 'table-centro-01',
        sessionId: opened.id,
        version: opened.version,
      }),
      repository.closeTableSession({
        organizationId,
        branchId: centroBranchId,
        tableId: 'table-centro-01',
        sessionId: opened.id,
        version: opened.version,
      }),
    ]);

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
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

    expect(
      await repository.currentTableSession(
        organizationId,
        centroBranchId,
        'table-centro-01',
      ),
    ).toBeNull();
    expect(
      await repository.tableSessions(
        organizationId,
        centroBranchId,
        'table-centro-01',
      ),
    ).toMatchObject([{ id: opened.id, status: 'CLOSED', version: 2 }]);
    expect(
      (await repository.tables(organizationId, centroBranchId)).find(
        (table) => table.id === 'table-centro-01',
      )?.status,
    ).toBe('CLEANING');
  });

  it('V26-EMP-04, V26-EMP-08 y V26-FLR-05: rechaza dependencias inactivas sin alterar la asignación ni una mesa ocupada', async () => {
    const repository = new DemoRepository();
    const shift = await repository.createWorkShift({
      organizationId,
      branchId: terrazaBranchId,
      scheduledStart: '2026-11-03T14:00:00.000Z',
      scheduledEnd: '2026-11-03T22:00:00.000Z',
    });

    await repository.assignEmployeeToBranch({
      organizationId,
      employeeId: 'e1',
      branchId: terrazaBranchId,
    });
    await repository.updateEmployeeBranchAssignmentStatus({
      organizationId,
      employeeId: 'e1',
      branchId: terrazaBranchId,
      status: 'INACTIVE',
    });
    await expectApiError(
      repository.assignEmployeeToWorkShift({
        organizationId,
        branchId: terrazaBranchId,
        id: shift.id,
        employeeId: 'e1',
      }),
      404,
    );

    const opened = await repository.openTableSession({
      organizationId,
      branchId: centroBranchId,
      tableId: 'table-centro-01',
    });
    await expectApiError(
      repository.updateTableStatus({
        organizationId,
        branchId: centroBranchId,
        id: 'table-centro-01',
        status: 'RESERVED',
      }),
      409,
    );

    expect(
      await repository.employeeBranchAssignments(organizationId, 'e1'),
    ).toContainEqual(
      expect.objectContaining({
        branchId: terrazaBranchId,
        status: 'INACTIVE',
      }),
    );
    expect(
      await repository.currentTableSession(
        organizationId,
        centroBranchId,
        'table-centro-01',
      ),
    ).toMatchObject({ id: opened.id, status: 'OPEN', version: 1 });
  });
});

describe('Fase 2.6-E — recuperación y ACK de TableSessionsPanel', () => {
  it('V26-ADM-02: descarta una lectura antigua al cambiar de sucursal y mesa', async () => {
    const repository = new DemoRepository();
    const terrazaTable = await repository.createTable({
      organizationId,
      branchId: terrazaBranchId,
      areaId: 'area-terraza-branch',
      code: 'm-terraza-026',
      capacity: 4,
    });
    const oldTables = deferred<DiningTable[]>();
    const oldSessions = deferred<TableSession[]>();
    const oldCurrentSession = deferred<TableSession | null>();
    const originalTables = repository.tables.bind(repository);
    const originalSessions = repository.tableSessions.bind(repository);
    const originalCurrentSession = repository.currentTableSession.bind(repository);

    vi.spyOn(repository, 'tables').mockImplementation((organization, branch) => {
      if (organization === organizationId && branch === centroBranchId) {
        return oldTables.promise;
      }

      return originalTables(organization, branch);
    });
    vi.spyOn(repository, 'tableSessions').mockImplementation(
      (organization, branch, tableId) => {
        if (
          organization === organizationId &&
          branch === centroBranchId &&
          tableId === 'table-centro-01'
        ) {
          return oldSessions.promise;
        }

        return originalSessions(organization, branch, tableId);
      },
    );
    vi.spyOn(repository, 'currentTableSession').mockImplementation(
      (organization, branch, tableId) => {
        if (
          organization === organizationId &&
          branch === centroBranchId &&
          tableId === 'table-centro-01'
        ) {
          return oldCurrentSession.promise;
        }

        return originalCurrentSession(organization, branch, tableId);
      },
    );

    const view = render(
      <TableSessionsPanel
        branchId={centroBranchId}
        organizationId={organizationId}
        permissions={sessionPermissions}
        repository={repository}
        tableId="table-centro-01"
      />,
    );

    await waitFor(() =>
      expect(repository.tables).toHaveBeenCalledWith(
        organizationId,
        centroBranchId,
      ),
    );
    view.rerender(
      <TableSessionsPanel
        branchId={terrazaBranchId}
        organizationId={organizationId}
        permissions={sessionPermissions}
        repository={repository}
        tableId={terrazaTable.id}
      />,
    );
    await screen.findByRole('heading', { name: 'Mesa m-terraza-026' });

    await act(async () => {
      oldTables.resolve(await originalTables(organizationId, centroBranchId));
      oldSessions.resolve(
        await originalSessions(organizationId, centroBranchId, 'table-centro-01'),
      );
      oldCurrentSession.resolve(
        await originalCurrentSession(
          organizationId,
          centroBranchId,
          'table-centro-01',
        ),
      );
    });

    expect(
      screen.getByRole('heading', { name: 'Mesa m-terraza-026' }),
    ).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Mesa m-01' })).toBeNull();
  });

  it('V26-ADM-03 y V26-ADM-07: bloquea el cierre pendiente y conserva la sesión tras un 409 sin mostrar éxito', async () => {
    const user = userEvent.setup();
    const repository = new DemoRepository();
    const opened = await repository.openTableSession({
      organizationId,
      branchId: centroBranchId,
      tableId: 'table-centro-01',
    });
    const closeOperation = deferred<TableSession>();
    vi.spyOn(repository, 'closeTableSession').mockImplementation(
      () => closeOperation.promise,
    );

    render(
      <TableSessionsPanel
        branchId={centroBranchId}
        organizationId={organizationId}
        permissions={sessionPermissions}
        repository={repository}
        tableId="table-centro-01"
      />,
    );

    await screen.findByText('Estado de mesa: OCCUPIED');
    await user.click(
      screen.getByRole('button', { name: 'Cerrar sesión estructural' }),
    );
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Confirmar cierre',
      }),
    );

    expect(
      (
        within(screen.getByRole('alertdialog')).getByRole('button', {
          name: 'Cerrando…',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(
      screen.queryByText('Sesión estructural cerrada tras confirmación del repositorio.'),
    ).toBeNull();

    await act(async () => {
      closeOperation.reject({
        status: 409,
        message: 'La versión de la sesión cambió',
      } satisfies ApiError);
    });

    await screen.findByRole('alert');
    expect(screen.getByRole('alert').textContent).toContain(
      'La versión de la sesión cambió',
    );
    expect(
      screen.queryByText('Sesión estructural cerrada tras confirmación del repositorio.'),
    ).toBeNull();
    expect(await repository.currentTableSession(
      organizationId,
      centroBranchId,
      'table-centro-01',
    )).toMatchObject({ id: opened.id, status: 'OPEN', version: 1 });
  });
});
