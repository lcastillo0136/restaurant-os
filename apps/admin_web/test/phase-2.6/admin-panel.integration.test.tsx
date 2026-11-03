import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../src/App';
import { AreasPanel } from '../../src/AreasPanel';
import { EmployeesPanel } from '../../src/EmployeesPanel';
import { TableSessionsPanel } from '../../src/TableSessionsPanel';
import { TablesPanel } from '../../src/TablesPanel';
import { WorkShiftsPanel } from '../../src/WorkShiftsPanel';
import {
  DemoRepository,
  type Employee,
  type Permission,
} from '../../src/data';

const organizationId = 'organization-demo';
const centroBranchId = 'centro';

const allPermissions: ReadonlySet<Permission> = new Set([
  'branches.read',
  'branches.manage',
  'employees.read',
  'employees.manage',
  'work-shifts.read',
  'work-shifts.manage',
  'areas.read',
  'areas.manage',
  'tables.read',
  'tables.manage',
  'table-sessions.read',
  'table-sessions.manage',
]);

function setDashboardRoute(): void {
  window.history.pushState({}, '', '/dashboard');
}

afterEach(() => {
  setDashboardRoute();
});

describe('Fase 2.6-D — recorridos globales del panel', () => {
  it('V26-ADM-01, V26-ADM-02 y V26-ADM-09: conserva navegación demo y limpia el detalle al cambiar de sucursal', async () => {
    setDashboardRoute();
    const user = userEvent.setup();

    render(<App />);

    expect(
      screen.getByRole('navigation', { name: 'Navegación principal' }),
    ).toBeTruthy();
    expect(screen.getByText('DEMOSTRACIÓN')).toBeTruthy();
    expect(
      screen.getByRole('heading', { name: 'Resumen administrativo' }),
    ).toBeTruthy();
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Resumen' }),
    );

    await user.click(screen.getByRole('button', { name: 'Mesas' }));
    await screen.findByText('m-01');
    const centroTable = screen.getByRole('row', {
      name: /m-01 4 Salón principal AVAILABLE/i,
    });
    await user.click(
      within(centroTable).getByRole('button', { name: 'Sesión' }),
    );
    await screen.findByRole('heading', { name: 'Mesa m-01' });

    await user.selectOptions(screen.getByLabelText('Sucursal'), 'terraza');
    await screen.findByText('Sin mesas');
    expect(
      screen.queryByRole('heading', { name: 'Mesa m-01' }),
    ).toBeNull();

    for (const [label, route] of [
      ['Pedidos', '/pedidos'],
      ['Menú', '/menu'],
      ['Cajas', '/cajas'],
      ['Reportes', '/reportes'],
    ] as const) {
      await user.click(screen.getByRole('button', { name: label }));
      expect(window.location.pathname).toBe(route);
      expect(
        screen.getByText(new RegExp(`${label} aún no está implementado`)),
      ).toBeTruthy();
    }

    await user.click(screen.getByRole('button', { name: 'Personal' }));
    await screen.findByRole('heading', { name: 'Empleados' });
    await user.click(screen.getByRole('button', { name: 'Ajustes' }));
    expect(screen.getByRole('heading', { name: 'Sucursales' })).toBeTruthy();
  });

  it('V26-ADM-03 y V26-ADM-07: valida, crea, edita y conserva el formulario de sucursal tras 409', async () => {
    setDashboardRoute();
    const user = userEvent.setup();
    const uniqueCode = `sucursal-${Date.now()}`;

    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Ajustes' }));

    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(screen.getByRole('alert').textContent).toContain(
      'Revisa código, nombre y zona horaria.',
    );

    await user.type(screen.getByLabelText('Código'), uniqueCode);
    await user.type(screen.getByLabelText('Nombre'), 'Sucursal de integración');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    await screen.findByText(
      'Sucursal guardada tras confirmación del repositorio demo.',
    );

    const createdRow = screen.getByRole('row', {
      name: new RegExp(`${uniqueCode} Sucursal de integración`),
    });
    await user.click(within(createdRow).getByRole('button', { name: 'Editar' }));
    const nameInput = screen.getByLabelText('Nombre');
    await user.clear(nameInput);
    await user.type(nameInput, 'Sucursal de integración actualizada');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(
      await screen.findAllByText('Sucursal de integración actualizada'),
    ).not.toHaveLength(0);

    await user.click(screen.getByRole('button', { name: 'Nueva sucursal' }));
    await user.type(screen.getByLabelText('Código'), 'centro');
    await user.type(screen.getByLabelText('Nombre'), 'Centro duplicado');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    await screen.findByRole('alert');
    expect(screen.getByRole('alert').textContent).toContain('Código duplicado');
    expect((screen.getByLabelText('Código') as HTMLInputElement).value).toBe(
      'centro',
    );
    expect((screen.getByLabelText('Nombre') as HTMLInputElement).value).toBe(
      'Centro duplicado',
    );
  });

  it('V26-ADM-05, V26-ADM-06 y V26-ADM-08: comunica lectura fallida, offline, sesión expirada y permiso insuficiente', async () => {
    setDashboardRoute();
    const user = userEvent.setup();

    render(<App />);

    const scenario = screen.getByLabelText('Escenario UX demo');
    await user.selectOptions(scenario, 'READ_ERROR');
    expect(screen.getByText('● Error de lectura simulado.')).toBeTruthy();

    await user.selectOptions(scenario, 'OFFLINE');
    expect(screen.getByText('● Sin conexión demo.')).toBeTruthy();
    await user.click(
      screen.getByRole('button', {
        name: 'Recuperar conexión y actualizar',
      }),
    );
    await screen.findByText('● Conexión demo disponible.');

    await user.selectOptions(scenario, 'FORBIDDEN');
    expect(
      screen.getByText('Sucursal oculta por permiso insuficiente.'),
    ).toBeTruthy();

    await user.selectOptions(scenario, 'SESSION_EXPIRED');
    await screen.findByRole('heading', { name: 'Sesión expirada' });
    await user.click(
      screen.getByRole('button', { name: 'Volver a la pantalla de acceso' }),
    );
    expect(screen.getByRole('heading', { name: 'Acceso requerido' })).toBeTruthy();
  });

  it('V26-ADM-07 y V26-ADM-08: conserva un formulario y no confirma una mutación rechazada', async () => {
    setDashboardRoute();
    const user = userEvent.setup();

    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Ajustes' }));
    await user.selectOptions(
      screen.getByLabelText('Escenario UX demo'),
      'MUTATION_REJECTED',
    );
    await user.type(screen.getByLabelText('Código'), 'mutation-026');
    await user.type(screen.getByLabelText('Nombre'), 'Mutación rechazada');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() =>
      expect(
        screen
          .getAllByRole('alert')
          .some((alert) => alert.textContent?.includes('La mutación demo fue rechazada')),
      ).toBe(true),
    );
    expect((screen.getByLabelText('Código') as HTMLInputElement).value).toBe(
      'mutation-026',
    );
    expect(
      screen.queryByText('Sucursal guardada tras confirmación del repositorio demo.'),
    ).toBeNull();
  });
});

describe('Fase 2.6-D — personal y turnos', () => {
  it('V26-ADM-03, V26-EMP-01 y V26-EMP-04: confirma empleado sólo tras ACK y permite administrar su asignación', async () => {
    const user = userEvent.setup();
    const repository = new DemoRepository();
    const originalCreate = repository.createEmployee.bind(repository);
    let acknowledgeCreate: (() => void) | undefined;
    const acknowledgement = new Promise<void>((resolve) => {
      acknowledgeCreate = resolve;
    });

    vi.spyOn(repository, 'createEmployee').mockImplementation(
      async (input): Promise<Employee> => {
        await acknowledgement;
        return originalCreate(input);
      },
    );

    render(
      <EmployeesPanel
        branchId={centroBranchId}
        organizationId={organizationId}
        permissions={allPermissions}
        repository={repository}
      />,
    );

    await screen.findByText('Ana Morales');
    await user.click(screen.getByRole('button', { name: 'Nuevo empleado' }));
    await user.type(screen.getByLabelText('Código laboral'), 'emp-ack-026');
    await user.type(screen.getByLabelText('Nombre'), 'Empleado ACK');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(
      (screen.getByRole('button', { name: 'Guardando…' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(
      screen.queryByText('Empleado guardado tras confirmación del repositorio.'),
    ).toBeNull();

    acknowledgeCreate?.();
    await screen.findByText('Empleado guardado tras confirmación del repositorio.');
    const employeeRow = screen.getByRole('row', {
      name: /emp-ack-026 Empleado ACK ACTIVE/i,
    });
    await user.click(
      within(employeeRow).getByRole('button', { name: 'Asignaciones' }),
    );
    await screen.findByRole('heading', { name: 'Sucursales de Empleado ACK' });
    await user.selectOptions(screen.getByLabelText('Sucursal'), 'terraza');
    await user.click(screen.getByRole('button', { name: 'Asignar sucursal' }));
    await screen.findByText('Sucursal asignada tras confirmación del repositorio.');

    await user.click(screen.getByRole('button', { name: 'Desactivar' }));
    expect(screen.getByRole('alertdialog')).toBeTruthy();
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Confirmar',
      }),
    );
    await screen.findByText('Estado de asignación actualizado tras confirmación del repositorio.');
    expect(screen.getByText('INACTIVE')).toBeTruthy();
  });

  it('V26-EMP-06, V26-EMP-07 y V26-EMP-08: usa zona IANA, conserva el formulario DST inválido y asigna personal elegible', async () => {
    const user = userEvent.setup();
    const repository = new DemoRepository();
    await repository.updateBranch(centroBranchId, {
      displayName: 'Centro',
      timeZone: 'Europe/Madrid',
    });
    const shift = await repository.createWorkShift({
      organizationId,
      branchId: centroBranchId,
      scheduledStart: '2026-06-03T08:00:00.000Z',
      scheduledEnd: '2026-06-03T16:00:00.000Z',
    });

    render(
      <WorkShiftsPanel
        branchId={centroBranchId}
        organizationId={organizationId}
        permissions={allPermissions}
        repository={repository}
      />,
    );

    await screen.findByText('Zona horaria laboral: Europe/Madrid');
    await user.click(screen.getByRole('button', { name: 'Nuevo turno' }));
    fireEvent.change(screen.getByLabelText('Inicio'), {
      target: { value: '2026-03-29T02:30' },
    });
    fireEvent.change(screen.getByLabelText('Fin'), {
      target: { value: '2026-03-29T03:30' },
    });
    await user.click(screen.getByRole('button', { name: 'Guardar turno' }));
    await screen.findByRole('alert');
    expect(screen.getByRole('alert').textContent).toContain('no existe');
    expect((screen.getByLabelText('Inicio') as HTMLInputElement).value).toBe(
      '2026-03-29T02:30',
    );

    await user.click(screen.getAllByRole('button', { name: 'Personal' })[0]);
    await screen.findByLabelText('Empleado elegible');
    await user.selectOptions(screen.getByLabelText('Empleado elegible'), 'e1');
    await user.click(screen.getByRole('button', { name: 'Asignar empleado' }));
    await screen.findByText('Empleado asignado tras confirmación del repositorio.');

    await repository.cancelWorkShift({
      organizationId,
      branchId: centroBranchId,
      id: shift.id,
    });
    await expect(
      repository.assignEmployeeToWorkShift({
        organizationId,
        branchId: centroBranchId,
        id: shift.id,
        employeeId: 'e1',
      }),
    ).rejects.toMatchObject({ status: 409 });
  });
});

describe('Fase 2.6-D — áreas, mesas y sesiones estructurales', () => {
  it('V26-FLR-01 a V26-FLR-06: crea y edita áreas, valida mesa y aplica sólo estados administrativos', async () => {
    const user = userEvent.setup();
    const repository = new DemoRepository();
    const areasView = render(
      <AreasPanel
        branchId={centroBranchId}
        organizationId={organizationId}
        permissions={allPermissions}
        repository={repository}
      />,
    );

    await screen.findByText('Salón principal');
    await user.click(screen.getByRole('button', { name: 'Nueva área' }));
    await user.type(screen.getByLabelText('Código'), 'integracion');
    await user.type(screen.getByLabelText('Nombre'), 'Área integración');
    await user.click(screen.getByRole('button', { name: 'Guardar área' }));
    await screen.findByText('Área guardada tras confirmación del repositorio.');

    const areaRow = screen.getByRole('row', { name: /integracion Área integración ACTIVE/i });
    await user.click(within(areaRow).getByRole('button', { name: 'Editar' }));
    const areaName = screen.getByLabelText('Nombre');
    await user.clear(areaName);
    await user.type(areaName, 'Área integración editada');
    await user.click(screen.getByRole('button', { name: 'Guardar área' }));
    await screen.findByText('Área integración editada');
    areasView.unmount();

    const selectedTables: string[] = [];
    render(
      <TablesPanel
        branchId={centroBranchId}
        onSelectTable={(table) => selectedTables.push(table.id)}
        organizationId={organizationId}
        permissions={allPermissions}
        repository={repository}
      />,
    );

    await screen.findByText('m-01');
    await user.click(screen.getByRole('button', { name: 'Nueva mesa' }));
    await user.type(screen.getByLabelText('Código'), 'm-026');
    fireEvent.change(screen.getByLabelText('Capacidad'), {
      target: { value: '0' },
    });
    await user.selectOptions(
      screen.getAllByLabelText('Área')[1],
      'area-salon-centro',
    );
    expect(
      (screen.getByLabelText('Capacidad') as HTMLInputElement).validity
        .rangeUnderflow,
    ).toBe(true);

    fireEvent.change(screen.getByLabelText('Capacidad'), {
      target: { value: '6' },
    });
    await user.click(screen.getByRole('button', { name: 'Guardar mesa' }));
    await screen.findByText('Mesa guardada tras confirmación del repositorio.');
    const tableRow = screen.getByRole('row', { name: /m-026 6 Salón principal AVAILABLE/i });
    expect(
      Array.from(within(tableRow).getAllByRole('option')).some(
        (option) => option.textContent === 'OCCUPIED',
      ),
    ).toBe(false);

    const statusSelect = within(tableRow).getByRole('combobox');
    await user.selectOptions(statusSelect, 'RESERVED');
    await user.click(
      within(tableRow).getByRole('button', { name: 'Aplicar estado' }),
    );
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Confirmar',
      }),
    );
    await screen.findByText('Estado de mesa actualizado tras confirmación del repositorio.');
    expect(
      screen.getByRole('row', {
        name: /m-026 6 Salón principal RESERVED/i,
      }),
    ).toBeTruthy();
    expect(selectedTables).toEqual([]);
  });

  it('V26-SES-01 a V26-SES-08: presenta conflicto 409 sin falsa confirmación y conserva historial tras cierre', async () => {
    const user = userEvent.setup();
    const repository = new DemoRepository();

    const sessionView = render(
      <TableSessionsPanel
        branchId={centroBranchId}
        organizationId={organizationId}
        permissions={allPermissions}
        repository={repository}
        tableId="table-centro-01"
      />,
    );

    const openButton = await screen.findByRole('button', { name: 'Abrir sesión' });
    await repository.openTableSession({
      organizationId,
      branchId: centroBranchId,
      tableId: 'table-centro-01',
    });
    await user.click(openButton);
    await screen.findByRole('alert');
    expect(screen.getByRole('alert').textContent).toContain(
      'La mesa ya tiene una sesión abierta',
    );
    expect(
      screen.queryByText('Sesión estructural abierta tras confirmación del repositorio.'),
    ).toBeNull();

    sessionView.unmount();
    render(
      <TableSessionsPanel
        branchId={centroBranchId}
        organizationId={organizationId}
        permissions={allPermissions}
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
    await screen.findByText('Sesión estructural cerrada tras confirmación del repositorio.');
    expect(screen.getByText('Estado de mesa: CLEANING')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Historial de sesiones' })).toBeTruthy();
    expect(screen.getByText('CLOSED')).toBeTruthy();
  });
});
