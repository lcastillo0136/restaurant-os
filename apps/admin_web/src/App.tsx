import { Building2, LayoutDashboard, Table2, Users } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import {
  ConnectionBanner,
  PermissionNotice,
  SessionExpiredScreen,
} from './AdminUxFeedback';
import { AreasPanel } from './AreasPanel';
import { EmployeesPanel } from './EmployeesPanel';
import { TableSessionsPanel } from './TableSessionsPanel';
import { TablesPanel } from './TablesPanel';
import {
  ApiError,
  Branch,
  DemoRepository,
  DemoSimulationMode,
  Permission,
} from './data';

type View =
  | 'dashboard'
  | 'mesas'
  | 'pedidos'
  | 'menu'
  | 'personal'
  | 'cajas'
  | 'reportes'
  | 'ajustes';

type BranchForm = {
  code: string;
  displayName: string;
  timeZone: string;
  status: Branch['status'];
};

const repository = new DemoRepository();
const demoOrganizationId = 'organization-demo';
const demoPermissions: ReadonlySet<Permission> = new Set([
  'organizations.read',
  'organizations.manage',
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

const navigation = [
  ['dashboard', 'Resumen', LayoutDashboard],
  ['mesas', 'Mesas', Table2],
  ['pedidos', 'Pedidos', Building2],
  ['menu', 'Menú', Building2],
  ['personal', 'Personal', Users],
  ['cajas', 'Cajas', Building2],
  ['reportes', 'Reportes', Building2],
  ['ajustes', 'Ajustes', Building2],
] as const;

const routeByView: Record<View, string> = {
  dashboard: '/dashboard',
  mesas: '/mesas',
  pedidos: '/pedidos',
  menu: '/menu',
  personal: '/personal',
  cajas: '/cajas',
  reportes: '/reportes',
  ajustes: '/ajustes',
};

const pendingViewLabels: Partial<Record<View, string>> = {
  pedidos: 'Pedidos',
  menu: 'Menú',
  cajas: 'Cajas',
  reportes: 'Reportes',
};

function viewFromPath(pathname: string): View {
  const match = (Object.entries(routeByView) as [View, string][]).find(
    ([, route]) => route === pathname,
  );

  return match?.[0] ?? 'dashboard';
}

const emptyBranchForm: BranchForm = {
  code: '',
  displayName: '',
  timeZone: 'America/Mexico_City',
  status: 'ACTIVE',
};

export function App() {
  const [view, setView] = useState<View>(() => viewFromPath(window.location.pathname));
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedTableId, setSelectedTableId] = useState('');
  const [simulationMode, setSimulationMode] =
    useState<DemoSimulationMode>('ONLINE');
  const [recoveryVersion, setRecoveryVersion] = useState(0);
  const [accessScreen, setAccessScreen] = useState(false);
  const [branchError, setBranchError] = useState<ApiError | null>(null);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchForm, setBranchForm] = useState<BranchForm>(emptyBranchForm);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const activePermissions: ReadonlySet<Permission> =
    simulationMode === 'FORBIDDEN' ||
    simulationMode === 'SESSION_EXPIRED' ||
    accessScreen
      ? new Set<Permission>()
      : demoPermissions;
  const canReadBranches = activePermissions.has('branches.read');
  const canManageBranches = activePermissions.has('branches.manage');

  const refreshBranches = async () => {
    try {
      const branchList = await repository.branches();
      setBranches(branchList);
      setBranchError(null);
      setSelectedBranchId((current) => current || branchList[0]?.id || '');
    } catch (caughtError) {
      setBranchError(caughtError as ApiError);
    }
  };

  useEffect(() => {
    void refreshBranches();
  }, []);

  useEffect(() => {
    const synchronizeView = () => setView(viewFromPath(window.location.pathname));

    window.addEventListener('popstate', synchronizeView);
    return () => window.removeEventListener('popstate', synchronizeView);
  }, []);

  const navigateTo = (nextView: View) => {
    window.history.pushState({}, '', routeByView[nextView]);
    setView(nextView);
  };

  const setDemoMode = (mode: DemoSimulationMode) => {
    repository.setSimulationMode(mode);
    setSimulationMode(mode);
    setSelectedTableId('');
    setRecoveryVersion((version) => version + 1);

    if (mode === 'ONLINE') {
      setAccessScreen(false);
      void refreshBranches();
    }
  };

  const recoverConnection = () => {
    setDemoMode('ONLINE');
  };

  const returnToAccess = () => {
    setAccessScreen(true);
    setSelectedTableId('');
    navigateTo('dashboard');
  };

  const saveBranch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (
      !/^[a-z0-9][a-z0-9-]{1,63}$/.test(branchForm.code) ||
      !branchForm.displayName.trim() ||
      !branchForm.timeZone.trim()
    ) {
      setError('Revisa código, nombre y zona horaria.');
      return;
    }

    setPending(true);
    try {
      if (editingBranch) {
        await repository.updateBranch(editingBranch.id, {
          displayName: branchForm.displayName,
          timeZone: branchForm.timeZone,
        });
      } else {
        await repository.createBranch(branchForm);
      }

      await refreshBranches();
      setNotice('Sucursal guardada tras confirmación del repositorio demo.');
      setEditingBranch(null);
      setBranchForm(emptyBranchForm);
    } catch (caughtError) {
      setError(
        (caughtError as { message?: string }).message ??
          'No fue posible guardar.',
      );
    } finally {
      setPending(false);
    }
  };

  const beginCreateBranch = () => {
    setEditingBranch(null);
    setBranchForm(emptyBranchForm);
    setError('');
    setNotice('');
  };

  const beginEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    setBranchForm({
      code: branch.code,
      displayName: branch.displayName,
      timeZone: branch.timeZone,
      status: branch.status,
    });
    setError('');
    setNotice('');
  };

  return (
    <main className="admin-shell" data-theme="admin-light">
      <header className="admin-nav">
        <b className="brand">
          <i className="brand-mark" />
          Restaurant OS
        </b>
        <nav className="top-navigation" aria-label="Navegación principal">
          {navigation.map(([id, label, Icon]) => (
            <button
              className={
                view === id ? 'nav-item nav-item-active' : 'nav-item'
              }
              key={id}
              onClick={() => navigateTo(id)}
              type="button"
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
        <span className="phase-chip">DEMOSTRACIÓN</span>
      </header>

      <ConnectionBanner
        mode={simulationMode}
        onRecover={recoverConnection}
        onRefresh={() => {
          setRecoveryVersion((version) => version + 1);
          void refreshBranches();
        }}
      />

      <section className="admin-context">
        {canReadBranches ? (
          <label>
            Sucursal
            <select
              disabled={simulationMode === 'SESSION_EXPIRED'}
              onChange={(event) => {
                setSelectedBranchId(event.target.value);
                setSelectedTableId('');
              }}
              value={selectedBranchId}
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.displayName}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <span role="alert">Sucursal oculta por permiso insuficiente.</span>
        )}
        <label>
          Escenario UX demo
          <select
            onChange={(event) =>
              setDemoMode(event.target.value as DemoSimulationMode)
            }
            value={simulationMode}
          >
            <option value="ONLINE">Conectado</option>
            <option value="OFFLINE">Sin conexión</option>
            <option value="READ_ERROR">Error de lectura</option>
            <option value="MUTATION_REJECTED">Mutación rechazada</option>
            <option value="SESSION_EXPIRED">Sesión expirada</option>
            <option value="FORBIDDEN">Permiso insuficiente</option>
          </select>
        </label>
        <span>Datos y permisos ficticios · sin red ni autenticación real</span>
      </section>

      {branchError && (
        <aside aria-live="assertive" className="ux-banner ux-banner-danger" role="alert">
          <strong>Error al consultar sucursales.</strong>
          <span>{branchError.message}</span>
          <button onClick={() => void refreshBranches()} type="button">
            Reintentar lectura
          </button>
        </aside>
      )}

      <section className="page">
        {accessScreen || simulationMode === 'SESSION_EXPIRED' ? (
          <SessionExpiredScreen
            accessScreen={accessScreen}
            onReturnToAccess={returnToAccess}
          />
        ) : view === 'personal' ? (
          <EmployeesPanel
            branchId={selectedBranchId}
            organizationId={demoOrganizationId}
            key={`personal-${recoveryVersion}`}
            permissions={activePermissions}
            repository={repository}
          />
        ) : view === 'mesas' ? (
          <>
            <p className="eyebrow">Salón · modo demostración</p>
            <h1>Áreas y mesas</h1>
            <AreasPanel
              branchId={selectedBranchId}
              organizationId={demoOrganizationId}
              key={`areas-${selectedBranchId}-${recoveryVersion}`}
              permissions={activePermissions}
              repository={repository}
            />
            <TablesPanel
              branchId={selectedBranchId}
              key={`tables-${selectedBranchId}-${recoveryVersion}`}
              onSelectTable={(table) => setSelectedTableId(table.id)}
              organizationId={demoOrganizationId}
              permissions={activePermissions}
              repository={repository}
            />
            {selectedTableId && (
              <TableSessionsPanel
                branchId={selectedBranchId}
                key={`sessions-${selectedTableId}-${recoveryVersion}`}
                organizationId={demoOrganizationId}
                permissions={activePermissions}
                repository={repository}
                tableId={selectedTableId}
              />
            )}
          </>
        ) : view === 'ajustes' ? (
          canReadBranches ? (
          <>
            <p className="eyebrow">Organización ficticia</p>
            <h1>Sucursales</h1>
            {canManageBranches && (
              <button
                className="sample-action"
                onClick={beginCreateBranch}
                type="button"
              >
                Nueva sucursal
              </button>
            )}
            {notice && <p role="status">{notice}</p>}
            {error && <p role="alert">{error}</p>}

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Zona horaria</th>
                    <th>Estado</th>
                    {canManageBranches && <th>Acción</th>}
                  </tr>
                </thead>
                <tbody>
                  {branches.map((branch) => (
                    <tr key={branch.id}>
                      <td>{branch.code}</td>
                      <td>{branch.displayName}</td>
                      <td>{branch.timeZone}</td>
                      <td>{branch.status}</td>
                      {canManageBranches && (
                        <td>
                          <button
                            onClick={() => beginEditBranch(branch)}
                            type="button"
                          >
                            Editar
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {canManageBranches && (
            <form className="showcase-panel" onSubmit={saveBranch}>
              <h2>{editingBranch ? 'Editar sucursal' : 'Nueva sucursal'}</h2>
              <label>
                Código
                <input
                  disabled={Boolean(editingBranch) || pending}
                  onChange={(event) =>
                    setBranchForm({ ...branchForm, code: event.target.value })
                  }
                  value={branchForm.code}
                />
              </label>
              <label>
                Nombre
                <input
                  disabled={pending}
                  onChange={(event) =>
                    setBranchForm({
                      ...branchForm,
                      displayName: event.target.value,
                    })
                  }
                  value={branchForm.displayName}
                />
              </label>
              <label>
                Zona horaria
                <input
                  disabled={pending}
                  onChange={(event) =>
                    setBranchForm({ ...branchForm, timeZone: event.target.value })
                  }
                  value={branchForm.timeZone}
                />
              </label>
              <label>
                Estado
                <select
                  disabled={pending}
                  onChange={(event) =>
                    setBranchForm({
                      ...branchForm,
                      status: event.target.value as Branch['status'],
                    })
                  }
                  value={branchForm.status}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </label>
              <button className="sample-action" disabled={pending} type="submit">
                {pending ? 'Guardando…' : 'Guardar'}
              </button>
              <button
                disabled={pending}
                onClick={beginCreateBranch}
                type="button"
              >
                Cancelar
              </button>
            </form>
            )}
          </>
          ) : (
            <PermissionNotice permission="branches.read" />
          )
        ) : pendingViewLabels[view] ? (
          <>
            <p className="eyebrow">
              {branches.find((branch) => branch.id === selectedBranchId)
                ?.displayName ?? 'Sucursal'}{' '}
              · modo demostración
            </p>
            <h1>Funcionalidad pendiente de implementación</h1>
            <p>
              {pendingViewLabels[view]} aún no está implementado. Esta pantalla
              demo no ofrece operaciones comerciales ni confirma datos reales.
            </p>
          </>
        ) : (
          <>
            <p className="eyebrow">
              {branches.find((branch) => branch.id === selectedBranchId)
                ?.displayName ?? 'Sucursal'}{' '}
              · modo demostración
            </p>
            <h1>Resumen administrativo</h1>
            <p>
              Esta vista conserva datos ficticios y no confirma operaciones
              comerciales.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
