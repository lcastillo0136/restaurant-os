import { FormEvent, useEffect, useMemo, useState } from 'react';
import type {
  AdminRepository,
  ApiError,
  Area,
  DiningTable,
  DiningTableStatus,
  Permission,
} from './data';

type TablesPanelProps = {
  repository: AdminRepository;
  organizationId: string;
  branchId: string;
  permissions: ReadonlySet<Permission>;
  onSelectTable: (table: DiningTable) => void;
};

type TableForm = {
  code: string;
  areaId: string;
  capacity: string;
};

type PendingStatusChange = {
  table: DiningTable;
  status: Exclude<DiningTableStatus, 'OCCUPIED'>;
};

const emptyForm: TableForm = {
  code: '',
  areaId: '',
  capacity: '1',
};

const administrativeStatuses: Exclude<DiningTableStatus, 'OCCUPIED'>[] = [
  'AVAILABLE',
  'CLEANING',
  'RESERVED',
  'BLOCKED',
  'OUT_OF_SERVICE',
];

function errorMessage(error: unknown, fallback: string): string {
  const apiError = error as Partial<ApiError>;

  if (apiError.status === 409) {
    return apiError.message ?? 'La operación entró en conflicto.';
  }

  return apiError.message ?? fallback;
}

export function TablesPanel({
  repository,
  organizationId,
  branchId,
  permissions,
  onSelectTable,
}: TablesPanelProps) {
  const [areas, setAreas] = useState<Area[]>([]);
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [areaFilter, setAreaFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState<TableForm>(emptyForm);
  const [editing, setEditing] = useState<DiningTable | null>(null);
  const [statusTargets, setStatusTargets] = useState<Record<string, string>>({});
  const [pendingStatusChange, setPendingStatusChange] =
    useState<PendingStatusChange | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const canRead = permissions.has('tables.read');
  const canManage = permissions.has('tables.manage');

  const areaById = useMemo(
    () => new Map(areas.map((area) => [area.id, area])),
    [areas],
  );

  const activeAreas = useMemo(
    () => areas.filter((area) => area.status === 'ACTIVE'),
    [areas],
  );

  const filteredTables = useMemo(
    () =>
      tables.filter(
        (table) =>
          (areaFilter === '' || table.areaId === areaFilter) &&
          (statusFilter === '' || table.status === statusFilter),
      ),
    [areaFilter, statusFilter, tables],
  );

  const refresh = async () => {
    if (!branchId) {
      setAreas([]);
      setTables([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [areaList, tableList] = await Promise.all([
        repository.areas(organizationId, branchId),
        repository.tables(organizationId, branchId),
      ]);
      setAreas(areaList);
      setTables(tableList);
    } catch (caughtError) {
      setError(errorMessage(caughtError, 'No fue posible consultar las mesas.'));
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
  }, [branchId, canRead, organizationId]);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const capacity = Number(form.capacity);
    if (
      !/^[a-z0-9][a-z0-9-]{1,63}$/.test(form.code) ||
      !form.areaId ||
      !Number.isInteger(capacity) ||
      capacity < 1 ||
      capacity > 1000
    ) {
      setError('Código, área o capacidad inválidos.');
      return;
    }

    setPending(true);
    try {
      if (editing) {
        await repository.updateTable({
          organizationId,
          branchId,
          id: editing.id,
          areaId: form.areaId,
          capacity,
        });
      } else {
        await repository.createTable({
          organizationId,
          branchId,
          code: form.code,
          areaId: form.areaId,
          capacity,
        });
      }

      await refresh();
      setMessage('Mesa guardada tras confirmación del repositorio.');
      setEditing(null);
      setForm(emptyForm);
    } catch (caughtError) {
      setError(errorMessage(caughtError, 'No fue posible guardar la mesa.'));
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
      await repository.updateTableStatus({
        organizationId,
        branchId,
        id: pendingStatusChange.table.id,
        status: pendingStatusChange.status,
      });
      await refresh();
      setMessage('Estado de mesa actualizado tras confirmación del repositorio.');
      setPendingStatusChange(null);
    } catch (caughtError) {
      setError(errorMessage(caughtError, 'No fue posible cambiar el estado.'));
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

  const beginEdit = (table: DiningTable) => {
    setEditing(table);
    setForm({
      code: table.code,
      areaId: table.areaId,
      capacity: String(table.capacity),
    });
    setError('');
    setMessage('');
  };

  const requestStatusChange = (table: DiningTable) => {
    const status = statusTargets[table.id] as
      | Exclude<DiningTableStatus, 'OCCUPIED'>
      | undefined;

    if (!status) {
      setError('Selecciona un estado administrativo.');
      return;
    }

    setPendingStatusChange({ table, status });
  };

  if (!canRead) {
    return (
      <section className="empty" role="alert">
        <h2>Permiso insuficiente</h2>
        <p>No tienes `tables.read`.</p>
      </section>
    );
  }

  if (!branchId) {
    return (
      <section className="empty">
        <h2>Selecciona una sucursal</h2>
        <p>Elige una sucursal para administrar sus mesas demo.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="tables-title">
      <p className="eyebrow">Mesas · demostración</p>
      <h2 id="tables-title">Mesas de la sucursal seleccionada</h2>

      {canManage && (
        <button className="sample-action" onClick={beginCreate} type="button">
          Nueva mesa
        </button>
      )}

      <section className="showcase-panel" aria-label="Filtros de mesas">
        <label>
          Área
          <select
            onChange={(event) => setAreaFilter(event.target.value)}
            value={areaFilter}
          >
            <option value="">Todas las áreas</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.displayName}
              </option>
            ))}
          </select>
        </label>
        <label>
          Estado
          <select
            onChange={(event) => setStatusFilter(event.target.value)}
            value={statusFilter}
          >
            <option value="">Todos los estados</option>
            {administrativeStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
            <option value="OCCUPIED">OCCUPIED</option>
          </select>
        </label>
      </section>

      {loading && <p role="status">Cargando mesas…</p>}
      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && filteredTables.length === 0 && (
        <section className="empty">
          <h3>Sin mesas</h3>
          <p>No hay mesas que coincidan con los filtros.</p>
        </section>
      )}

      {!loading && filteredTables.length > 0 && (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Capacidad</th>
                <th>Área</th>
                <th>Estado</th>
                <th>Detalle</th>
                {canManage && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filteredTables.map((table) => (
                <tr key={table.id}>
                  <td>{table.code}</td>
                  <td>{table.capacity}</td>
                  <td>{areaById.get(table.areaId)?.displayName ?? 'Área no disponible'}</td>
                  <td>{table.status}</td>
                  <td>
                    <button onClick={() => onSelectTable(table)} type="button">
                      Sesión
                    </button>
                  </td>
                  {canManage && (
                    <td>
                      <button onClick={() => beginEdit(table)} type="button">
                        Editar
                      </button>
                      {table.status !== 'OCCUPIED' && (
                        <>
                          <select
                            disabled={pending}
                            onChange={(event) =>
                              setStatusTargets({
                                ...statusTargets,
                                [table.id]: event.target.value,
                              })
                            }
                            value={statusTargets[table.id] ?? ''}
                          >
                            <option value="">Cambiar estado…</option>
                            {administrativeStatuses
                              .filter((status) => status !== table.status)
                              .map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                          </select>
                          <button
                            disabled={pending}
                            onClick={() => requestStatusChange(table)}
                            type="button"
                          >
                            Aplicar estado
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

      {canManage && (
        <form className="showcase-panel" onSubmit={save}>
          <h3>{editing ? 'Editar mesa' : 'Nueva mesa'}</h3>
          <label>
            Código
            <input
              disabled={Boolean(editing) || pending}
              onChange={(event) =>
                setForm({ ...form, code: event.target.value })
              }
              value={form.code}
            />
          </label>
          <label>
            Capacidad
            <input
              disabled={pending}
              min="1"
              onChange={(event) =>
                setForm({ ...form, capacity: event.target.value })
              }
              type="number"
              value={form.capacity}
            />
          </label>
          <label>
            Área
            <select
              disabled={pending}
              onChange={(event) =>
                setForm({ ...form, areaId: event.target.value })
              }
              value={form.areaId}
            >
              <option value="">Selecciona un área activa</option>
              {activeAreas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.displayName}
                </option>
              ))}
            </select>
          </label>
          <button className="sample-action" disabled={pending} type="submit">
            {pending ? 'Guardando…' : 'Guardar mesa'}
          </button>
          <button disabled={pending} onClick={beginCreate} type="button">
            Cancelar
          </button>
        </form>
      )}

      {pendingStatusChange && (
        <section aria-modal="true" role="alertdialog">
          <h3>Confirmar cambio de estado</h3>
          <p>
            ¿Deseas cambiar la mesa {pendingStatusChange.table.code} a{' '}
            {pendingStatusChange.status}?
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
