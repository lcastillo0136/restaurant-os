import { FormEvent, useEffect, useState } from 'react';
import { EmployeeAssignmentsPanel } from './EmployeeAssignmentsPanel';
import { WorkShiftsPanel } from './WorkShiftsPanel';
import type { AdminRepository, Employee, Permission } from './data';

type EmployeesPanelProps = {
  repository: AdminRepository;
  organizationId: string;
  branchId: string;
  permissions: ReadonlySet<Permission>;
};

type EmployeeForm = {
  employeeCode: string;
  displayName: string;
  status: Employee['status'];
};

const emptyForm: EmployeeForm = {
  employeeCode: '',
  displayName: '',
  status: 'ACTIVE',
};

function errorMessage(error: unknown, fallback: string): string {
  const value = error as { status?: number; message?: string };

  if (value.status === 409) {
    return 'Código laboral duplicado.';
  }

  return value.message ?? fallback;
}

export function EmployeesPanel({
  repository,
  organizationId,
  branchId,
  permissions,
}: EmployeesPanelProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState<EmployeeForm>(emptyForm);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const canRead = permissions.has('employees.read');
  const canManage = permissions.has('employees.manage');

  const refresh = async () => {
    setLoading(true);
    setError('');

    try {
      const employeeList = await repository.employees(organizationId);
      setEmployees(employeeList);
      setSelectedEmployee((current) =>
        current
          ? employeeList.find((employee) => employee.id === current.id) ?? null
          : null,
      );
    } catch (caughtError) {
      setError(errorMessage(caughtError, 'No fue posible consultar empleados.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canRead) {
      void refresh();
      return;
    }

    setLoading(false);
  }, [canRead, organizationId]);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (
      !/^[a-z0-9][a-z0-9-]{1,63}$/.test(form.employeeCode) ||
      !form.displayName.trim()
    ) {
      setError('Código laboral o nombre inválido.');
      return;
    }

    setPending(true);
    try {
      if (editing) {
        await repository.updateEmployee(editing.id, {
          displayName: form.displayName,
        });
      } else {
        await repository.createEmployee({
          organizationId,
          employeeCode: form.employeeCode,
          displayName: form.displayName,
          status: form.status,
        });
      }

      await refresh();
      setMessage('Empleado guardado tras confirmación del repositorio.');
      setEditing(null);
      setForm(emptyForm);
    } catch (caughtError) {
      setError(errorMessage(caughtError, 'No fue posible guardar.'));
    } finally {
      setPending(false);
    }
  };

  const beginCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setMessage('');
  };

  const beginEdit = (employee: Employee) => {
    setEditing(employee);
    setForm({
      employeeCode: employee.employeeCode,
      displayName: employee.displayName,
      status: employee.status,
    });
    setError('');
    setMessage('');
  };

  if (!canRead) {
    return (
      <section className="empty" role="alert">
        <h2>Permiso insuficiente</h2>
        <p>No tienes `employees.read`.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="employees-title">
      <p className="eyebrow">Personal · demostración</p>
      <h1 id="employees-title">Empleados</h1>

      {canManage && (
        <button className="sample-action" onClick={beginCreate} type="button">
          Nuevo empleado
        </button>
      )}

      {loading && <p role="status">Cargando empleados…</p>}
      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && employees.length === 0 && (
        <section className="empty">
          <h2>Sin empleados</h2>
          <p>No hay empleados en esta organización demo.</p>
        </section>
      )}

      {!loading && employees.length > 0 && (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Código laboral</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.employeeCode}</td>
                  <td>{employee.displayName}</td>
                  <td>{employee.status}</td>
                  <td>
                    <button
                      onClick={() => setSelectedEmployee(employee)}
                      type="button"
                    >
                      Asignaciones
                    </button>
                    {canManage && (
                      <button onClick={() => beginEdit(employee)} type="button">
                        Editar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canManage && (
        <form className="showcase-panel" onSubmit={save}>
          <h2>{editing ? 'Editar empleado' : 'Nuevo empleado'}</h2>
          <label>
            Código laboral
            <input
              disabled={Boolean(editing) || pending}
              onChange={(event) =>
                setForm({ ...form, employeeCode: event.target.value })
              }
              value={form.employeeCode}
            />
          </label>
          <label>
            Nombre
            <input
              disabled={pending}
              onChange={(event) =>
                setForm({ ...form, displayName: event.target.value })
              }
              value={form.displayName}
            />
          </label>
          <button className="sample-action" disabled={pending} type="submit">
            {pending ? 'Guardando…' : 'Guardar'}
          </button>
          <button
            disabled={pending}
            onClick={beginCreate}
            type="button"
          >
            Cancelar
          </button>
        </form>
      )}

      {selectedEmployee && (
        <EmployeeAssignmentsPanel
          employee={selectedEmployee}
          organizationId={organizationId}
          permissions={permissions}
          repository={repository}
        />
      )}

      <WorkShiftsPanel
        branchId={branchId}
        organizationId={organizationId}
        permissions={permissions}
        repository={repository}
      />
    </section>
  );
}
