import { useEffect, useId, useRef, type ReactNode } from 'react';
import type { SemanticTone } from './types';
import { RestaurantButton } from './primitives';
import { classNames } from './utils';

export interface AlertProps { title: string; children: ReactNode; tone?: SemanticTone; action?: ReactNode }
export function Alert({ title, children, tone = 'neutral', action }: AlertProps) {
  return <aside className={`ros-alert ros-tone--${tone}`} role={tone === 'danger' ? 'alert' : 'status'}><span className="ros-alert__mark" aria-hidden="true">!</span><div><strong>{title}</strong><div>{children}</div></div>{action}</aside>;
}

export interface EmptyStateProps { title: string; description: string; icon?: ReactNode; action?: ReactNode }
export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return <section className="ros-empty"><span className="ros-empty__icon" aria-hidden="true">{icon ?? '○'}</span><h3>{title}</h3><p>{description}</p>{action}</section>;
}

export interface ConnectionStatusProps { state: 'online' | 'offline' | 'reconnecting'; detail?: string }
export function ConnectionStatus({ state, detail }: ConnectionStatusProps) {
  const labels = { online: 'Conectado', offline: 'Sin conexión', reconnecting: 'Reconectando' };
  return <span className={`ros-connection ros-connection--${state}`} role="status"><i aria-hidden="true" />{labels[state]}{detail && <small>{detail}</small>}</span>;
}

export interface LoadingIndicatorProps { label?: string; inline?: boolean }
export function LoadingIndicator({ label = 'Cargando', inline = false }: LoadingIndicatorProps) {
  return <div className={classNames('ros-loading', inline && 'ros-loading--inline')} role="status"><span className="ros-spinner" aria-hidden="true" /><span>{label}</span></div>;
}

export interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function Modal({ open, title, children, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', destructive, pending, onConfirm, onClose }: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (open) dialogRef.current?.focus(); }, [open]);
  if (!open) return null;
  return (
    <div className="ros-modal-backdrop" role="presentation">
      <dialog ref={dialogRef} className="ros-modal" open aria-modal="true" aria-labelledby={titleId} tabIndex={-1} onKeyDown={(event) => { if (event.key === 'Escape' && !pending) onClose(); }}>
        <h2 id={titleId}>{title}</h2>
        <div className="ros-modal__body">{children}</div>
        <footer><RestaurantButton variant="secondary" onClick={onClose} disabled={pending}>{cancelLabel}</RestaurantButton><RestaurantButton variant={destructive ? 'danger' : 'primary'} loading={pending} onClick={onConfirm}>{confirmLabel}</RestaurantButton></footer>
      </dialog>
    </div>
  );
}
