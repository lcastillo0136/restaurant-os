import { FormEvent, useEffect, useState } from 'react';
import type { AdminRepository, ApiError, Area, Permission } from './data';

type AreasPanelProps = {
  repository: AdminRepository;
  organizationId: string;
  branchId: string;
  permissions: ReadonlySet<Permission>;
};

type AreaForm = {
  code: string;
  displayName: string;
};

const emptyForm: AreaForm = {
  code: '',
  displayName: '',
};

function errorMessage(error: unknown, fallback: string): string {
  const apiError = error as Partial<ApiError>;

  if (apiError.status === 409) {
    return apiError.message ?? 'La operación entró en conflicto.';
  }

  return apiError.message ?? fallback;
}

export function AreasPanel({
  repository,
  organizationId,
  branchId,
  permissions,
}: AreasPanelProps) {
  const [areas, setAreas] = useState<Area[]>([]);
  const [form, setForm] = useState<AreaForm>(emptyForm);
  const [editing, setEditing] = useState<Area | null>(null);
  const [pendingStatusArea, setPendingStatusArea] = useState<Area | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const canRead = permissions.has('areas.read');
  const canManage = permissions.has('areas.manage');

  const refresh = async () => {
    if (!branchId) {
      setAreas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      setAreas(await repository.areas(organizationId, branchId));
    } catch (caughtError) {
      setError(errorMessage(caughtError, 'No fue posible consultar las áreas.'));
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

    if (
      !/^[a-z0-9][a-z0-9-]{1,63}$/.test(form.code) ||
      !form.displayName.trim()
    ) {
      setError('Código o nombre de área inválido.');
      return;
    }

    setPending(true);
    try {
      if (editing) {
        await repository.updateArea({
          organizationId,
          branchId,
          id: editing.id,
          displayName: form.displayName,
        });
      } else {
        await repository.createArea({
          organizationId,
          branchId,
          code: form.code,
          displayName: form.displayName,
        });
      }

      await refresh();
      setMessage('Área guardada tras confirmación del repositorio.');
      setEditing(null);
      setForm(emptyForm);
    } catch (caughtError) {
      setError(errorMessage(caughtError, 'No fue posible guardar el área.'));
    } finally {
      setPending(false);
    }
  };

  const confirmStatusChange = async () => {
    if (!pendingStatusArea) {
      return;
    }

    const nextStatus =
      pendingStatusArea.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    setPending(true);
    setError('');
    setMessage('');

    try {
      await repository.updateAreaStatus({
        organizationId,
        branchId,
        id: pendingStatusArea.id,
        status: nextStatus,
      });
      await refresh();
      setMessage('Estado del área actualizado tras confirmación del repositorio.');
      setPendingStatusArea(null);
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

  const beginEdit = (area: Area) => {
    setEditing(area);
    setForm({ code: area.code, displayName: area.displayName });
    setError('');
    setMessage('');
  };

  if (!canRead) {
    return (
      <section className="empty" role="alert">
        <h2>Permiso insuficiente</h2>
        <p>No tienes `areas.read`.</p>
      </section>
    );
  }

  if (!branchId) {
    return (
      <section className="empty">
        <h2>Selecciona una sucursal</h2>
        <p>Elige una sucursal para administrar sus áreas demo.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="areas-title">
      <p className="eyebrow">Áreas · demostración</p>
      <h2 id="areas-title">Áreas de la sucursal seleccionada</h2>

      {canManage && (
        <button className="sample-action" onClick={beginCreate} type="button">
          Nueva área
        </button>
      )}

      {loading && <p role="status">Cargando áreas…</p>}
      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && areas.length === 0 && (
        <section className="empty">
          <h3>Sin áreas</h3>
          <p>No hay áreas registradas para esta sucursal demo.</p>
        </section>
      )}

      {!loading && areas.length > 0 && (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Estado</th>
                {canManage && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {areas.map((area) => (
                <tr key={area.id}>
                  <td>{area.code}</td>
                  <td>{area.displayName}</td>
                  <td>{area.status}</td>
                  {canManage && (
                    <td>
                      <button onClick={() => beginEdit(area)} type="button">
                        Editar
                      </button>
                      <button
                        disabled={pending}
                        onClick={() => setPendingStatusArea(area)}
                        type="button"
                      >
                        {area.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                      </button>
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
          <h3>{editing ? 'Editar área' : 'Nueva área'}</h3>
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
            {pending ? 'Guardando…' : 'Guardar área'}
          </button>
          <button disabled={pending} onClick={beginCreate} type="button">
            Cancelar
          </button>
        </form>
      )}

      {pendingStatusArea && (
        <section aria-modal="true" role="alertdialog">
          <h3>Confirmar cambio de estado</h3>
          <p>
            {pendingStatusArea.status === 'ACTIVE'
              ? '¿Deseas desactivar esta área? Las áreas con mesas no pueden desactivarse.'
              : '¿Deseas activar esta área?'}
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
            onClick={() => setPendingStatusArea(null)}
            type="button"
          >
            Volver
          </button>
        </section>
      )}
    </section>
  );
}
