import type { DemoSimulationMode } from './data';

type ConnectionBannerProps = {
  mode: DemoSimulationMode;
  onRecover: () => void;
  onRefresh: () => void;
};

export function ConnectionBanner({
  mode,
  onRecover,
  onRefresh,
}: ConnectionBannerProps) {
  if (mode === 'ONLINE') {
    return (
      <aside aria-live="polite" className="ux-banner ux-banner-success" role="status">
        <strong>● Conexión demo disponible.</strong>
        <span>Las confirmaciones se muestran sólo después del ACK del repositorio.</span>
        <button onClick={onRefresh} type="button">
          Actualizar datos
        </button>
      </aside>
    );
  }

  if (mode === 'SESSION_EXPIRED') {
    return (
      <aside aria-live="assertive" className="ux-banner ux-banner-danger" role="alert">
        <strong>● Sesión demo expirada.</strong>
        <span>Las mutaciones están bloqueadas y los datos de la vista se ocultan.</span>
      </aside>
    );
  }

  if (mode === 'FORBIDDEN') {
    return (
      <aside aria-live="assertive" className="ux-banner ux-banner-danger" role="alert">
        <strong>● Permiso insuficiente.</strong>
        <span>La navegación se conserva, pero no se muestran recursos ni acciones no autorizadas.</span>
      </aside>
    );
  }

  const copy: Record<
    Exclude<DemoSimulationMode, 'ONLINE' | 'SESSION_EXPIRED' | 'FORBIDDEN'>,
    { title: string; detail: string }
  > = {
    OFFLINE: {
      title: '● Sin conexión demo.',
      detail: 'No se confirma ninguna mutación mientras la conexión esté caída.',
    },
    READ_ERROR: {
      title: '● Error de lectura simulado.',
      detail: 'Conserva el formulario y recupera el snapshot cuando el recurso vuelva a estar disponible.',
    },
    MUTATION_REJECTED: {
      title: '● Mutación rechazada.',
      detail: 'No se aplicó ningún cambio; actualiza el snapshot y declara una nueva intención.',
    },
  };

  return (
    <aside aria-live="assertive" className="ux-banner ux-banner-warning" role="alert">
      <strong>{copy[mode].title}</strong>
      <span>{copy[mode].detail}</span>
      <button onClick={onRecover} type="button">
        Recuperar conexión y actualizar
      </button>
    </aside>
  );
}

type SessionExpiredScreenProps = {
  accessScreen: boolean;
  onReturnToAccess: () => void;
};

export function SessionExpiredScreen({
  accessScreen,
  onReturnToAccess,
}: SessionExpiredScreenProps) {
  return (
    <section className="empty" role="alert">
      <h1>{accessScreen ? 'Acceso requerido' : 'Sesión expirada'}</h1>
      <p>
        {accessScreen
          ? 'La autenticación real no forma parte de esta demostración. Los datos protegidos permanecen ocultos.'
          : 'Esta demostración no conserva datos sensibles ni permite nuevas mutaciones después de una respuesta 401.'}
      </p>
      {!accessScreen && (
        <button className="sample-action" onClick={onReturnToAccess} type="button">
          Volver a la pantalla de acceso
        </button>
      )}
    </section>
  );
}

type PermissionNoticeProps = {
  permission: string;
};

export function PermissionNotice({ permission }: PermissionNoticeProps) {
  return (
    <section className="empty" role="alert">
      <h2>Permiso insuficiente</h2>
      <p>Esta acción requiere `{permission}`. Los controles visuales no sustituyen RBAC del backend.</p>
    </section>
  );
}
