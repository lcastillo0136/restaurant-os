import { FormEvent, useEffect, useMemo, useState } from 'react';
import type {
  AdminRepository,
  ApiError,
  Branch,
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

type BranchDateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

type BranchInstantResult =
  | { instant: string }
  | { error: string };

const datetimeLocalPattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

function branchDateTimeParts(
  instant: number,
  timeZone: string,
): BranchDateTimeParts {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(instant));

  const values = new Map(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]),
  );

  return {
    year: values.get('year') ?? 0,
    month: values.get('month') ?? 0,
    day: values.get('day') ?? 0,
    hour: values.get('hour') ?? 0,
    minute: values.get('minute') ?? 0,
  };
}

function dateTimeLocalValue(parts: BranchDateTimeParts): string {
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}

function sameBranchDateTime(
  left: BranchDateTimeParts,
  right: BranchDateTimeParts,
): boolean {
  return (
    left.year === right.year &&
    left.month === right.month &&
    left.day === right.day &&
    left.hour === right.hour &&
    left.minute === right.minute
  );
}

export function branchDateTimeInputValue(
  instant: string,
  timeZone: string,
): string | null {
  const milliseconds = new Date(instant).getTime();

  if (Number.isNaN(milliseconds)) {
    return null;
  }

  try {
    return dateTimeLocalValue(branchDateTimeParts(milliseconds, timeZone));
  } catch {
    return null;
  }
}

export function branchIsoInstant(
  localDateTime: string,
  timeZone: string,
): BranchInstantResult {
  const match = datetimeLocalPattern.exec(localDateTime);

  if (!match) {
    return { error: 'Indica una fecha y hora válidas para la sucursal.' };
  }

  const target: BranchDateTimeParts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
  };
  const nominal = Date.UTC(
    target.year,
    target.month - 1,
    target.day,
    target.hour,
    target.minute,
  );

  if (
    Number.isNaN(nominal) ||
    target.month < 1 ||
    target.month > 12 ||
    target.day < 1 ||
    target.day > 31 ||
    target.hour > 23 ||
    target.minute > 59
  ) {
    return { error: 'Indica una fecha y hora válidas para la sucursal.' };
  }

  const candidates: number[] = [];

  try {
    for (
      let candidate = nominal - 16 * 60 * 60 * 1000;
      candidate <= nominal + 16 * 60 * 60 * 1000;
      candidate += 60 * 1000
    ) {
      if (sameBranchDateTime(branchDateTimeParts(candidate, timeZone), target)) {
        candidates.push(candidate);
      }
    }
  } catch {
    return { error: 'La zona horaria de la sucursal no es válida.' };
  }

  if (candidates.length === 0) {
    return {
      error:
        'La hora no existe en la zona horaria de la sucursal por cambio de horario.',
    };
  }

  if (candidates.length > 1) {
    return {
      error:
        'La hora es ambigua en la zona horaria de la sucursal por cambio de horario.',
    };
  }

  return { instant: new Date(candidates[0]).toISOString() };
}

export function formatBranchInstant(instant: string, timeZone: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(new Date(instant));
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
  const [branch, setBranch] = useState<Branch | null>(null);
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
      setBranch(null);
      setSelectedShift(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [shiftList, employeeList, branchList] = await Promise.all([
        repository.workShifts(organizationId, branchId),
        repository.employees(organizationId),
        repository.branches(organizationId),
      ]);
      const assignments = await Promise.all(
        employeeList.map((employee) =>
          repository.employeeBranchAssignments(organizationId, employee.id),
        ),
      );

      setShifts(shiftList);
      setEmployees(employeeList);
      setBranchAssignments(assignments.flat());
      setBranch(
        branchList.find((candidate) => candidate.id === branchId) ?? null,
      );
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

    if (!branch) {
      setError('No fue posible obtener la zona horaria de la sucursal.');
      return;
    }

    const startResult = branchIsoInstant(form.scheduledStart, branch.timeZone);
    const endResult = branchIsoInstant(form.scheduledEnd, branch.timeZone);

    if ('error' in startResult) {
      setError(startResult.error);
      return;
    }

    if ('error' in endResult) {
      setError(endResult.error);
      return;
    }

    if (new Date(startResult.instant) >= new Date(endResult.instant)) {
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
          scheduledStart: startResult.instant,
          scheduledEnd: endResult.instant,
        });
      } else {
        await repository.createWorkShift({
          organizationId,
          branchId,
          scheduledStart: startResult.instant,
          scheduledEnd: endResult.instant,
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
    if (!branch) {
      setError('No fue posible obtener la zona horaria de la sucursal.');
      return;
    }

    const scheduledStart = branchDateTimeInputValue(
      shift.scheduledStart,
      branch.timeZone,
    );
    const scheduledEnd = branchDateTimeInputValue(
      shift.scheduledEnd,
      branch.timeZone,
    );

    if (!scheduledStart || !scheduledEnd) {
      setError('No fue posible mostrar el turno en la zona horaria de la sucursal.');
      return;
    }

    setEditing(shift);
    setForm({
      scheduledStart,
      scheduledEnd,
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
      {branch && <p>Zona horaria laboral: {branch.timeZone}</p>}

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
                  <td>
                    {branch
                      ? formatBranchInstant(shift.scheduledStart, branch.timeZone)
                      : 'Zona horaria no disponible'}
                  </td>
                  <td>
                    {branch
                      ? formatBranchInstant(shift.scheduledEnd, branch.timeZone)
                      : 'Zona horaria no disponible'}
                  </td>
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
