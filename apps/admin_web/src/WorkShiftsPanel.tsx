import { FormEvent, useEffect, useMemo, useState } from 'react';
import type {
  AdminRepository,
  ApiError,
  Employee,
  EmployeeBranchAssignment,
  Permission,
  WorkShift,
  WorkShiftAssignment,
  WorkShiftAssignmentStatus,
} from './data';

type WorkShiftsPanelProps = {
  repository: AdminRepository;
  organizationId: string;
  branchId: string;
  permissions: ReadonlySet<Permission>;
};

type WorkShiftForm = {
  scheduledStart: string;
  scheduledEnd: string;
};

type PendingAssignmentStatusChange = {
  employeeId: string;
  status: Exclude<WorkShiftAssignmentStatus, 'ACTIVE'>;
};

function errorMessage(error: unknown, fallback: string): string {
  const apiError = error as Partial<ApiError>;

  if (apiError.status === 409) {
    return apiError.message ?? 'La operación entró en conflicto.';
  }

  return apiError.message ?? fallback;
}

function localValue(instant: string): string {
  const date = new Date(instant);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);

  return localDate.toISOString().slice(0, 16);
}

function utcInstant(localDateTime: string): string | null {
  if (!localDateTime) {
    return null;
  }

  const date = new Date(localDateTime);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

const emptyForm: WorkShiftForm = {
  scheduledStart: '',
  scheduledEnd: '',
};

export function WorkShiftsPanel({
  repository,
  organizationId,
  branchId,
  permissions,
}: WorkShiftsPanelProps) {
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branchAssignments, setBranchAssignments] = useState<
    EmployeeBranchAssignment[]
  >([]);
  const [selectedShift, setSelectedShift] = useState<WorkShift | null>(null);
  const [shiftAssignments, setShiftAssignments] = useState<WorkShiftAssignment[]>(
    [],
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [form, setForm] = useState<WorkShiftForm>(emptyForm);
  const [editing, setEditing] = useState<WorkShift | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pendingCancel, setPendingCancel] = useState<WorkShift | null>(null);
  const [pendingAssignmentStatusChange, setPendingAssignmentStatusChange] =
    useState<PendingAssignmentStatusChange | null>(null);

  const canRead = permissions.has('work-shifts.read');
  const canManage = permissions.has('work-shifts.manage');

  const employeeById = useMemo(
    () => new Map(employees.map((employee) => [employee.id, employee])),
    [employees],
  );

  const eligibleEmployees = useMemo(
    () =>
      employees.filter(
        (employee) =>
          employee.status === 'ACTIVE' &&
          branchAssignments.some(
            (assignment) =>
              assignment.employeeId === employee.id &&
              assignment.branchId === branchId &&
              assignment.status === 'ACTIVE',
          ) &&
          !shiftAssignments.some(
            (assignment) =>
              assignment.employeeId === employee.id && assignment.status === 'ACTIVE',
          ),
      ),
    [branchAssignments, branchId, employees, shiftAssignments],
  );

  const refreshShifts = async () => {
    if (!branchId) {
      setShifts([]);
      setSelectedShift(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [shiftList, employeeList] = await Promise.all([
        repository.workShifts(organizationId, branchId),
        repository.employees(organizationId),
      ]);
      const assignments = await Promise.all(
        employeeList.map((employee) =>
          repository.employeeBranchAssignments(organizationId, employee.id),
        ),
      );

      setShifts(shiftList);
      setEmployees(employeeList);
      setBranchAssignments(assignments.flat());
      setSelectedShift((current) =>
        current
          ? shiftList.find((shift) => shift.id === current.id) ?? null
          : null,
      );
    } catch (caughtError) {
      setError(errorMessage(caughtError, 'No fue posible consultar los turnos.'));
    } finally {
      setLoading(false);
    }
  };

  const refreshShiftAssignments = async (shift: WorkShift) => {
    setAssignmentsLoading(true);
    setError('');

    try {
      const assignments = await repository.workShiftAssignments(
        organizationId,
        branchId,
        shift.id,
      );
      setShiftAssignments(assignments);
      setSelectedEmployeeId((current) =>
        assignments.some(
          (assignment) =>
            assignment.employeeId === current && assignment.status === 'ACTIVE',
        )
          ? ''
          : current,
      );
    } catch (caughtError) {
      setError(errorMessage(caughtError, 'No fue posible consultar el personal del turno.'));
    } finally {
      setAssignmentsLoading(false);
    }
  };

  useEffect(() => {
    if (canRead) {
      void refreshShifts();
      return;
    }

    setLoading(false);
  }, [branchId, canRead, organizationId]);

  useEffect(() => {
    if (selectedShift) {
      void refreshShiftAssignments(selectedShift);
      return;
    }

    setShiftAssignments([]);
  }, [branchId, selectedShift?.id]);

  const saveShift = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const scheduledStart = utcInstant(form.scheduledStart);
    const scheduledEnd = utcInstant(form.scheduledEnd);

    if (!scheduledStart || !scheduledEnd) {
      setError('Indica horarios válidos para el turno.');
      return;
    }

    if (new Date(scheduledStart) >= new Date(scheduledEnd)) {
      setError('El fin debe ser posterior al inicio.');
      return;
    }

    setPending(true);
    try {
      if (editing) {
        await repository.updateWorkShift({
          organizationId,
          branchId,
          id: editing.id,
          scheduledStart,
          scheduledEnd,
        });
      } else {
        await repository.createWorkShift({
          organizationId,
          branchId,
          scheduledStart,
          scheduledEnd,
        });
      }

      await refreshShifts();
      setMessage('Turno guardado tras confirmación del repositorio.');
      setEditing(null);
      setForm(emptyForm);
    } catch (caughtError) {
      setError(errorMessage(caughtError, 'No fue posible guardar el turno.'));
    } finally {
      setPending(false);
    }
  };

  const confirmCancel = async () => {
    if (!pendingCancel) {
      return;
    }

    setPending(true);
    setError('');
    setMessage('');

    try {
      await repository.cancelWorkShift({
        organizationId,
        branchId,
        id: pendingCancel.id,
      });
      await refreshShifts();
      setMessage('Turno cancelado tras confirmación del repositorio.');
      setPendingCancel(null);
    } catch (caughtError) {
      setError(errorMessage(caughtError, 'No fue posible cancelar el turno.'));
    } finally {
      setPending(false);
    }
  };

  const assignEmployee = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!selectedShift || !selectedEmployeeId) {
      setError('Selecciona un empleado elegible.');
      return;
    }

    setPending(true);
    try {
      await repository.assignEmployeeToWorkShift({
        organizationId,
        branchId,
        id: selectedShift.id,
        employeeId: selectedEmployeeId,
      });
      await refreshShiftAssignments(selectedShift);
      setSelectedEmployeeId('');
      setMessage('Empleado asignado tras confirmación del repositorio.');
    } catch (caughtError) {
      setError(errorMessage(caughtError, 'No fue posible asignar el empleado.'));
    } finally {
      setPending(false);
    }
  };

  const confirmAssignmentStatusChange = async () => {
    if (!selectedShift || !pendingAssignmentStatusChange) {
      return;
    }

    setPending(true);
    setError('');
    setMessage('');

    try {
      await repository.updateWorkShiftAssignmentStatus({
        organizationId,
        branchId,
        id: selectedShift.id,
        employeeId: pendingAssignmentStatusChange.employeeId,
        status: pendingAssignmentStatusChange.status,
      });
      await refreshShiftAssignments(selectedShift);
      setMessage('Asignación de turno actualizada tras confirmación del repositorio.');
      setPendingAssignmentStatusChange(null);
    } catch (caughtError) {
      setError(errorMessage(caughtError, 'No fue posible actualizar la asignación.'));
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

  const beginEdit = (shift: WorkShift) => {
    setEditing(shift);
    setForm({
      scheduledStart: localValue(shift.scheduledStart),
      scheduledEnd: localValue(shift.scheduledEnd),
    });
    setError('');
    setMessage('');
  };

  if (!canRead) {
    return (
      <section className="empty" role="alert">
        <h2>Permiso insuficiente</h2>
        <p>No tienes `work-shifts.read`.</p>
      </section>
    );
  }

  if (!branchId) {
    return (
      <section className="empty">
        <h2>Selecciona una sucursal</h2>
        <p>Elige una sucursal para administrar sus turnos demo.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="work-shifts-title">
      <p className="eyebrow">Turnos laborales · demostración</p>
      <h2 id="work-shifts-title">Turnos de la sucursal seleccionada</h2>

      {canManage && (
        <button className="sample-action" onClick={beginCreate} type="button">
          Nuevo turno
        </button>
      )}

      {loading && <p role="status">Cargando turnos…</p>}
      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && shifts.length === 0 && (
        <section className="empty">
          <h3>Sin turnos</h3>
          <p>No hay turnos registrados para esta sucursal demo.</p>
        </section>
      )}

      {!loading && shifts.length > 0 && (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift) => (
                <tr key={shift.id}>
                  <td>{new Date(shift.scheduledStart).toLocaleString()}</td>
                  <td>{new Date(shift.scheduledEnd).toLocaleString()}</td>
                  <td>{shift.status}</td>
                  <td>
                    <button onClick={() => setSelectedShift(shift)} type="button">
                      Personal
                    </button>
                    {canManage && shift.status === 'SCHEDULED' && (
                      <>
                        <button onClick={() => beginEdit(shift)} type="button">
                          Editar
                        </button>
                        <button
                          onClick={() => setPendingCancel(shift)}
                          type="button"
                        >
                          Cancelar turno
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canManage && (
        <form className="showcase-panel" onSubmit={saveShift}>
          <h3>{editing ? 'Editar turno' : 'Nuevo turno'}</h3>
          <label>
            Inicio
            <input
              disabled={pending}
              onChange={(event) =>
                setForm({ ...form, scheduledStart: event.target.value })
              }
              required
              type="datetime-local"
              value={form.scheduledStart}
            />
          </label>
          <label>
            Fin
            <input
              disabled={pending}
              onChange={(event) =>
                setForm({ ...form, scheduledEnd: event.target.value })
              }
              required
              type="datetime-local"
              value={form.scheduledEnd}
            />
          </label>
          <button className="sample-action" disabled={pending} type="submit">
            {pending ? 'Guardando…' : 'Guardar turno'}
          </button>
          <button disabled={pending} onClick={beginCreate} type="button">
            Cancelar
          </button>
        </form>
      )}

      {selectedShift && (
        <section className="showcase-panel" aria-labelledby="shift-assignments-title">
          <h3 id="shift-assignments-title">Personal del turno seleccionado</h3>
          {assignmentsLoading && <p role="status">Cargando personal…</p>}
          {!assignmentsLoading && shiftAssignments.length === 0 && (
            <p>No hay empleados asignados.</p>
          )}
          {!assignmentsLoading && shiftAssignments.length > 0 && (
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Estado</th>
                    {canManage && <th>Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {shiftAssignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td>
                        {employeeById.get(assignment.employeeId)?.displayName ??
                          'Empleado no disponible'}
                      </td>
                      <td>{assignment.status}</td>
                      {canManage && (
                        <td>
                          {assignment.status === 'ACTIVE' && (
                            <>
                              <button
                                disabled={pending}
                                onClick={() =>
                                  setPendingAssignmentStatusChange({
                                    employeeId: assignment.employeeId,
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
                                  setPendingAssignmentStatusChange({
                                    employeeId: assignment.employeeId,
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
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {canManage && selectedShift.status === 'SCHEDULED' && (
            <form onSubmit={assignEmployee}>
              <label>
                Empleado elegible
                <select
                  disabled={pending || assignmentsLoading}
                  onChange={(event) => setSelectedEmployeeId(event.target.value)}
                  value={selectedEmployeeId}
                >
                  <option value="">Selecciona un empleado</option>
                  {eligibleEmployees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.displayName} · {employee.employeeCode}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="sample-action"
                disabled={
                  pending || assignmentsLoading || eligibleEmployees.length === 0
                }
                type="submit"
              >
                {pending ? 'Guardando…' : 'Asignar empleado'}
              </button>
            </form>
          )}
        </section>
      )}

      {pendingCancel && (
        <section aria-modal="true" role="alertdialog">
          <h3>Confirmar cancelación</h3>
          <p>¿Deseas cancelar este turno programado?</p>
          <button
            className="sample-action"
            disabled={pending}
            onClick={() => void confirmCancel()}
            type="button"
          >
            {pending ? 'Guardando…' : 'Confirmar'}
          </button>
          <button
            disabled={pending}
            onClick={() => setPendingCancel(null)}
            type="button"
          >
            Volver
          </button>
        </section>
      )}

      {pendingAssignmentStatusChange && (
        <section aria-modal="true" role="alertdialog">
          <h3>Confirmar cambio de asignación</h3>
          <p>
            {pendingAssignmentStatusChange.status === 'INACTIVE'
              ? '¿Deseas desactivar esta asignación de turno?'
              : '¿Deseas cancelar esta asignación de turno?'}
          </p>
          <button
            className="sample-action"
            disabled={pending}
            onClick={() => void confirmAssignmentStatusChange()}
            type="button"
          >
            {pending ? 'Guardando…' : 'Confirmar'}
          </button>
          <button
            disabled={pending}
            onClick={() => setPendingAssignmentStatusChange(null)}
            type="button"
          >
            Volver
          </button>
        </section>
      )}
    </section>
  );
}
