import { useEffect, useState } from 'react';
import type {
  AdminRepository,
  ApiError,
  DiningTable,
  Permission,
  TableSession,
} from './data';

type TableSessionsPanelProps = {
  repository: AdminRepository;
  organizationId: string;
  branchId: string;
  tableId: string;
  permissions: ReadonlySet<Permission>;
};

function errorMessage(error: unknown, fallback: string): string {
  const apiError = error as Partial<ApiError>;

  if (apiError.status === 409) {
    return apiError.message ?? 'La sesión entró en conflicto.';
  }

  return apiError.message ?? fallback;
}

export function TableSessionsPanel({
  repository,
  organizationId,
  branchId,
  tableId,
  permissions,
}: TableSessionsPanelProps) {
  const [table, setTable] = useState<DiningTable | null>(null);
  const [sessions, setSessions] = useState<TableSession[]>([]);
  const [currentSession, setCurrentSession] = useState<TableSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const canRead = permissions.has('table-sessions.read');
  const canManage = permissions.has('table-sessions.manage');

  const refresh = async () => {
    if (!branchId || !tableId) {
      setTable(null);
      setSessions([]);
      setCurrentSession(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [tables, sessionList, activeSession] = await Promise.all([
        repository.tables(organizationId, branchId),
        repository.tableSessions(organizationId, branchId, tableId),
        repository.currentTableSession(organizationId, branchId, tableId),
      ]);
      const selectedTable = tables.find((candidate) => candidate.id === tableId);

      if (!selectedTable) {
        throw { status: 404, message: 'Mesa no encontrada en la sucursal.' } satisfies ApiError;
      }

      setTable(selectedTable);
      setSessions(sessionList);
      setCurrentSession(activeSession);
    } catch (caughtError) {
      setError(errorMessage(caughtError, 'No fue posible consultar las sesiones.'));
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
  }, [branchId, canRead, organizationId, tableId]);

  const openSession = async () => {
    setPending(true);
    setError('');
    setMessage('');

    try {
      await repository.openTableSession({
        organizationId,
        branchId,
        tableId,
      });
      await refresh();
      setMessage('Sesión estructural abierta tras confirmación del repositorio.');
    } catch (caughtError) {
      setError(errorMessage(caughtError, 'No fue posible abrir la sesión.'));
    } finally {
      setPending(false);
    }
  };

  const closeSession = async () => {
    if (!currentSession) {
      return;
    }

    setPending(true);
    setError('');
    setMessage('');

    try {
      await repository.closeTableSession({
        organizationId,
        branchId,
        tableId,
        sessionId: currentSession.id,
        version: currentSession.version,
      });
      await refresh();
      setMessage('Sesión estructural cerrada tras confirmación del repositorio.');
      setConfirmClose(false);
    } catch (caughtError) {
      setError(errorMessage(caughtError, 'No fue posible cerrar la sesión.'));
    } finally {
      setPending(false);
    }
  };

  if (!canRead) {
    return (
      <section className="empty" role="alert">
        <h2>Permiso insuficiente</h2>
        <p>No tienes `table-sessions.read`.</p>
      </section>
    );
  }

  if (!branchId || !tableId) {
    return (
      <section className="empty">
        <h2>Selecciona una mesa</h2>
        <p>Elige una mesa para consultar sus sesiones estructurales.</p>
      </section>
    );
  }

  return (
    <section className="showcase-panel" aria-labelledby="table-sessions-title">
      <p className="eyebrow">Sesión estructural · demostración</p>
      <h2 id="table-sessions-title">
        {table ? `Mesa ${table.code}` : 'Detalle de mesa'}
      </h2>

      {loading && <p role="status">Cargando sesión de mesa…</p>}
      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && table && (
        <>
          <p>Estado de mesa: {table.status}</p>

          {currentSession ? (
            <section aria-label="Sesión activa">
              <h3>Sesión activa</h3>
              <p>Abierta: {new Date(currentSession.openedAt).toLocaleString()}</p>
              <p>Versión: {currentSession.version}</p>
              {canManage && (
                <button
                  className="sample-action"
                  disabled={pending}
                  onClick={() => setConfirmClose(true)}
                  type="button"
                >
                  Cerrar sesión estructural
                </button>
              )}
            </section>
          ) : (
            <section className="empty">
              <h3>Sin sesión activa</h3>
              <p>No hay una sesión estructural abierta para esta mesa.</p>
              {canManage && table.status === 'AVAILABLE' && (
                <button
                  className="sample-action"
                  disabled={pending}
                  onClick={() => void openSession()}
                  type="button"
                >
                  {pending ? 'Abriendo…' : 'Abrir sesión'}
                </button>
              )}
            </section>
          )}

          <section aria-labelledby="table-session-history-title">
            <h3 id="table-session-history-title">Historial de sesiones</h3>
            {sessions.length === 0 ? (
              <p>No hay sesiones registradas.</p>
            ) : (
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Estado</th>
                      <th>Apertura</th>
                      <th>Cierre</th>
                      <th>Versión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <tr key={session.id}>
                        <td>{session.status}</td>
                        <td>{new Date(session.openedAt).toLocaleString()}</td>
                        <td>
                          {session.closedAt
                            ? new Date(session.closedAt).toLocaleString()
                            : 'Pendiente'}
                        </td>
                        <td>{session.version}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {confirmClose && currentSession && (
        <section aria-modal="true" role="alertdialog">
          <h3>Confirmar cierre estructural</h3>
          <p>
            Se cerrará la sesión versión {currentSession.version} y la mesa
            pasará a CLEANING. No incluye pedidos, pagos ni cierre comercial.
          </p>
          <button
            className="sample-action"
            disabled={pending}
            onClick={() => void closeSession()}
            type="button"
          >
            {pending ? 'Cerrando…' : 'Confirmar cierre'}
          </button>
          <button
            disabled={pending}
            onClick={() => setConfirmClose(false)}
            type="button"
          >
            Volver
          </button>
        </section>
      )}
    </section>
  );
}
