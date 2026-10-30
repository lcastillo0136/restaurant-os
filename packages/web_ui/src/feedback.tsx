import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
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
  const bodyId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    const initialFocus = dialog.querySelector<HTMLElement>('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])');
    (initialFocus ?? dialog).focus();
    return () => {
      if (dialog.open && typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
      openerRef.current?.focus();
      openerRef.current = null;
    };
  }, [open]);
  if (!open) return null;
  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (!pending) onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'));
    if (focusable.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  return (
    <div className="ros-modal-backdrop" role="presentation">
      <dialog ref={dialogRef} className="ros-modal" aria-modal="true" aria-labelledby={titleId} aria-describedby={bodyId} tabIndex={-1} onCancel={(event) => { event.preventDefault(); if (!pending) onClose(); }} onKeyDown={handleKeyDown}>
        <h2 id={titleId}>{title}</h2>
        <div id={bodyId} className="ros-modal__body">{children}</div>
        <footer><RestaurantButton variant="secondary" onClick={onClose} disabled={pending}>{cancelLabel}</RestaurantButton><RestaurantButton variant={destructive ? 'danger' : 'primary'} loading={pending} onClick={onConfirm}>{confirmLabel}</RestaurantButton></footer>
      </dialog>
    </div>
  );
}
