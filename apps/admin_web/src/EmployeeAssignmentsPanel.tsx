import { FormEvent, useEffect, useMemo, useState } from 'react';
import type {
  AdminRepository,
  ApiError,
  Branch,
  Employee,
  EmployeeBranchAssignment,
  EmployeeBranchAssignmentStatus,
  Permission,
} from './data';

type EmployeeAssignmentsPanelProps = {
  repository: AdminRepository;
  organizationId: string;
  employee: Employee;
  permissions: ReadonlySet<Permission>;
};

type PendingStatusChange = {
  branchId: string;
  status: Exclude<EmployeeBranchAssignmentStatus, 'ACTIVE'>;
};

function errorMessage(error: unknown, fallback: string): string {
  const apiError = error as Partial<ApiError>;

  if (apiError.status === 409) {
    return apiError.message ?? 'La asignación entró en conflicto.';
  }

  return apiError.message ?? fallback;
}

export function EmployeeAssignmentsPanel({
  repository,
  organizationId,
  employee,
  permissions,
}: EmployeeAssignmentsPanelProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [assignments, setAssignments] = useState<EmployeeBranchAssignment[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pendingStatusChange, setPendingStatusChange] =
    useState<PendingStatusChange | null>(null);

  const canRead = permissions.has('employees.read');
  const canManage = permissions.has('employees.manage');

  const branchById = useMemo(
    () => new Map(branches.map((branch) => [branch.id, branch])),
    [branches],
  );

  const availableBranches = useMemo(
    () =>
      branches.filter(
        (branch) =>
          branch.status === 'ACTIVE' &&
          !assignments.some(
            (assignment) =>
              assignment.branchId === branch.id && assignment.status === 'ACTIVE',
          ),
      ),
    [assignments, branches],
  );

  const refresh = async () => {
    setLoading(true);
    setError('');

    try {
      const [branchList, assignmentList] = await Promise.all([
        repository.branches(organizationId),
        repository.employeeBranchAssignments(organizationId, employee.id),
      ]);
      setBranches(branchList);
      setAssignments(assignmentList);
      setSelectedBranchId((current) =>
        branchList.some((branch) => branch.id === current) ? current : '',
      );
    } catch (caughtError) {
      setError(errorMessage(caughtError, 'No fue posible consultar las asignaciones.'));
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
  }, [canRead, employee.id, organizationId]);

  const assignBranch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!selectedBranchId) {
      setError('Selecciona una sucursal activa.');
      return;
    }

    setPending(true);
    try {
      await repository.assignEmployeeToBranch({
        organizationId,
        employeeId: employee.id,
        branchId: selectedBranchId,
      });
      await refresh();
      setSelectedBranchId('');
      setMessage('Sucursal asignada tras confirmación del repositorio.');
    } catch (caughtError) {
      setError(errorMessage(caughtError, 'No fue posible asignar la sucursal.'));
    } finally {
      setPending(false);
    }
  };

  const confirmStatusChange = async () => {
    if (!pendingStatusChange) {
      return;
    }

    setPending(true);
    setError('');
    setMessage('');

    try {
      await repository.updateEmployeeBranchAssignmentStatus({
        organizationId,
        employeeId: employee.id,
        branchId: pendingStatusChange.branchId,
        status: pendingStatusChange.status,
      });
      await refresh();
      setMessage('Estado de asignación actualizado tras confirmación del repositorio.');
      setPendingStatusChange(null);
    } catch (caughtError) {
      setError(errorMessage(caughtError, 'No fue posible actualizar la asignación.'));
    } finally {
      setPending(false);
    }
  };

  if (!canRead) {
    return (
      <section className="empty" role="alert">
        <h2>Permiso insuficiente</h2>
        <p>No tienes `employees.read` para consultar asignaciones.</p>
      </section>
    );
  }

  return (
    <section className="showcase-panel" aria-labelledby="employee-assignments-title">
      <p className="eyebrow">Asignaciones demo</p>
      <h2 id="employee-assignments-title">Sucursales de {employee.displayName}</h2>

      {loading && <p role="status">Cargando asignaciones…</p>}
      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && assignments.length === 0 && (
        <p>No hay sucursales asignadas a este empleado.</p>
      )}

      {!loading && assignments.length > 0 && (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Sucursal</th>
                <th>Estado</th>
                {canManage && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => {
                const branch = branchById.get(assignment.branchId);
                const canChangeStatus = assignment.status === 'ACTIVE';

                return (
                  <tr key={assignment.id}>
                    <td>{branch?.displayName ?? 'Sucursal no disponible'}</td>
                    <td>{assignment.status}</td>
                    {canManage && (
                      <td>
                        {canChangeStatus && (
                          <>
                            <button
                              disabled={pending}
                              onClick={() =>
                                setPendingStatusChange({
                                  branchId: assignment.branchId,
                                  status: 'INACTIVE',
                                })
                              }
                              type="button"
                            >
                              Desactivar
                            </button>
                            <button
                              disabled={pending}
                              onClick={() =>
                                setPendingStatusChange({
                                  branchId: assignment.branchId,
                                  status: 'CANCELED',
                                })
                              }
                              type="button"
                            >
                              Cancelar asignación
                            </button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {canManage && (
        <form onSubmit={assignBranch}>
          <label>
            Sucursal
            <select
              disabled={pending || loading}
              onChange={(event) => setSelectedBranchId(event.target.value)}
              value={selectedBranchId}
            >
              <option value="">Selecciona una sucursal</option>
              {availableBranches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.displayName}
                </option>
              ))}
            </select>
          </label>
          <button
            className="sample-action"
            disabled={pending || loading || availableBranches.length === 0}
            type="submit"
          >
            {pending ? 'Guardando…' : 'Asignar sucursal'}
          </button>
        </form>
      )}

      {pendingStatusChange && (
        <section aria-modal="true" role="alertdialog">
          <h3>Confirmar cambio de asignación</h3>
          <p>
            {pendingStatusChange.status === 'INACTIVE'
              ? '¿Deseas desactivar esta asignación?'
              : '¿Deseas cancelar esta asignación?'}
          </p>
          <button
            className="sample-action"
            disabled={pending}
            onClick={() => void confirmStatusChange()}
            type="button"
          >
            {pending ? 'Guardando…' : 'Confirmar'}
          </button>
          <button
            disabled={pending}
            onClick={() => setPendingStatusChange(null)}
            type="button"
          >
            Volver
          </button>
        </section>
      )}
    </section>
  );
}
