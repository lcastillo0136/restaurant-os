import {
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AreasPanel } from '../../src/AreasPanel';
import { EmployeesPanel } from '../../src/EmployeesPanel';
import { TableSessionsPanel } from '../../src/TableSessionsPanel';
import { TablesPanel } from '../../src/TablesPanel';
import { WorkShiftsPanel } from '../../src/WorkShiftsPanel';
import { DemoRepository, type Permission } from '../../src/data';

const organizationId = 'organization-demo';
const branchId = 'centro';
const permissions: ReadonlySet<Permission> = new Set([
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

async function expectConflict(operation: Promise<unknown>): Promise<void> {
  await expect(operation).rejects.toMatchObject({ status: 409 });
}

describe('Paneles demo — interacciones de Fase 2.5', () => {
  it('crea, edita y asigna un empleado después del ACK del repositorio', async () => {
    const user = userEvent.setup();
    const repository = new DemoRepository();

    render(
      <EmployeesPanel
        branchId={branchId}
        organizationId={organizationId}
        permissions={permissions}
        repository={repository}
      />,
    );

    await screen.findByText('Ana Morales');
    await user.click(screen.getByRole('button', { name: 'Nuevo empleado' }));
    await user.type(screen.getByLabelText('Código laboral'), 'emp-ux-01');
    await user.type(screen.getByLabelText('Nombre'), 'María Pérez');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    await screen.findByText('Empleado guardado tras confirmación del repositorio.');
    const employeeRow = screen.getByRole('row', {
      name: /emp-ux-01 María Pérez ACTIVE/i,
    });

    await user.click(within(employeeRow).getByRole('button', { name: 'Editar' }));
    const nameInput = screen.getByLabelText('Nombre');
    await user.clear(nameInput);
    await user.type(nameInput, 'María Pérez actualizada');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    await screen.findByText('María Pérez actualizada');
    const updatedRow = screen.getByRole('row', {
      name: /emp-ux-01 María Pérez actualizada ACTIVE/i,
    });
    await user.click(
      within(updatedRow).getByRole('button', { name: 'Asignaciones' }),
    );

    await screen.findByRole('heading', {
      name: 'Sucursales de María Pérez actualizada',
    });
    await user.selectOptions(screen.getByLabelText('Sucursal'), 'terraza');
    await user.click(screen.getByRole('button', { name: 'Asignar sucursal' }));

    await screen.findByText('Sucursal asignada tras confirmación del repositorio.');
    expect(screen.getByText('Terraza')).toBeTruthy();
  });

  it('crea y cancela un turno con horarios de la zona de la sucursal', async () => {
    const user = userEvent.setup();
    const repository = new DemoRepository();

    render(
      <WorkShiftsPanel
        branchId={branchId}
        organizationId={organizationId}
        permissions={permissions}
        repository={repository}
      />,
    );

    await screen.findByText('Zona horaria laboral: America/Mexico_City');
    await user.click(screen.getByRole('button', { name: 'Nuevo turno' }));
    fireEvent.change(screen.getByLabelText('Inicio'), {
      target: { value: '2026-11-05T09:00' },
    });
    fireEvent.change(screen.getByLabelText('Fin'), {
      target: { value: '2026-11-05T17:00' },
    });
    await user.click(screen.getByRole('button', { name: 'Guardar turno' }));

    await screen.findByText('Turno guardado tras confirmación del repositorio.');
    await user.click(screen.getAllByRole('button', { name: 'Cancelar turno' })[0]);
    await user.click(screen.getByRole('button', { name: 'Confirmar' }));

    await screen.findByText('Turno cancelado tras confirmación del repositorio.');
  });

  it('crea área, crea mesa y opera una sesión estructural versionada', async () => {
    const user = userEvent.setup();
    const repository = new DemoRepository();
    const areaPanel = render(
      <AreasPanel
        branchId={branchId}
        organizationId={organizationId}
        permissions={permissions}
        repository={repository}
      />,
    );

    await screen.findByText('Salón principal');
    await user.click(screen.getByRole('button', { name: 'Nueva área' }));
    await user.type(screen.getByLabelText('Código'), 'prueba');
    await user.type(screen.getByLabelText('Nombre'), 'Área de prueba');
    await user.click(screen.getByRole('button', { name: 'Guardar área' }));
    await screen.findByText('Área guardada tras confirmación del repositorio.');
    areaPanel.unmount();

    const tablesPanel = render(
      <TablesPanel
        branchId={branchId}
        onSelectTable={() => undefined}
        organizationId={organizationId}
        permissions={permissions}
        repository={repository}
      />,
    );

    await screen.findByText('m-01');
    await user.click(screen.getByRole('button', { name: 'Nueva mesa' }));
    await user.type(screen.getByLabelText('Código'), 'm-ux-01');
    fireEvent.change(screen.getByLabelText('Capacidad'), {
      target: { value: '6' },
    });
    await user.selectOptions(
      screen.getAllByLabelText('Área')[1],
      'area-salon-centro',
    );
    await user.click(screen.getByRole('button', { name: 'Guardar mesa' }));
    await screen.findByText('Mesa guardada tras confirmación del repositorio.');
    tablesPanel.unmount();

    render(
      <TableSessionsPanel
        branchId={branchId}
        organizationId={organizationId}
        permissions={permissions}
        repository={repository}
        tableId="table-centro-01"
      />,
    );

    await user.click(await screen.findByRole('button', { name: 'Abrir sesión' }));
    await screen.findByText(
      'Sesión estructural abierta tras confirmación del repositorio.',
    );

    await expectConflict(
      repository.openTableSession({
        organizationId,
        branchId,
        tableId: 'table-centro-01',
      }),
    );

    await user.click(
      screen.getByRole('button', { name: 'Cerrar sesión estructural' }),
    );
    await user.click(screen.getByRole('button', { name: 'Confirmar cierre' }));
    await screen.findByText(
      'Sesión estructural cerrada tras confirmación del repositorio.',
    );
    expect(screen.getByText('Estado de mesa: CLEANING')).toBeTruthy();
  });

  it('permite lectura sin exponer acciones de administración', async () => {
    const repository = new DemoRepository();

    render(
      <EmployeesPanel
        branchId={branchId}
        organizationId={organizationId}
        permissions={new Set<Permission>(['employees.read'])}
        repository={repository}
      />,
    );

    await screen.findByText('Ana Morales');
    expect(
      screen.queryByRole('button', { name: 'Nuevo empleado' }),
    ).toBeNull();
    expect(screen.queryByRole('button', { name: 'Editar' })).toBeNull();
  });
});
