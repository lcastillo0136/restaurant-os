import type { ReactNode } from 'react';
import type { SemanticTone } from './types';
import { RestaurantButton, RestaurantCard } from './primitives';
import { classNames } from './utils';

export interface KdsOrderItem { id: string; quantity: number; name: string }
export interface KdsOrderCardProps {
  ticket: string;
  table: string;
  elapsed: string;
  items: KdsOrderItem[];
  note?: string;
  status: 'pending' | 'preparing' | 'ready';
  pendingAck?: boolean;
  onAction?: () => void;
}

export function KdsOrderCard({ ticket, table, elapsed, items, note, status, pendingAck, onAction }: KdsOrderCardProps) {
  const action = status === 'pending' ? 'Solicitar inicio' : status === 'preparing' ? 'Solicitar listo' : 'Ver entrega';
  return <RestaurantCard className={`ros-kds-card ros-kds-card--${status}`}><header><span>{table}</span><span>{elapsed}</span><h3>{ticket}</h3></header><ul>{items.map((item) => <li key={item.id}>{item.quantity} × {item.name}</li>)}</ul>{note && <p className="ros-kds-card__note">⚠ {note}</p>}<footer><span className="ros-status-label">● {pendingAck ? 'Pendiente de ACK' : status === 'pending' ? 'Pendiente' : status === 'preparing' ? 'Preparando' : 'Listo'}</span><RestaurantButton variant="secondary" loading={pendingAck} onClick={onAction}>{action}</RestaurantButton></footer></RestaurantCard>;
}

export interface KitchenColumnProps { title: string; count: number; tone: 'accent' | 'warning' | 'success'; children: ReactNode }
export function KitchenColumn({ title, count, tone, children }: KitchenColumnProps) {
  return <section className={`ros-kitchen-column ros-tone--${tone}`} aria-label={`${title}, ${count} pedidos`}><header><h2>{title}</h2><span>{count}</span></header><div>{children}</div></section>;
}

export interface TableCardProps { number: string; status: string; detail?: string; tone?: SemanticTone; selected?: boolean; onSelect?: () => void }
export function TableCard({ number, status, detail, tone = 'neutral', selected, onSelect }: TableCardProps) {
  return <button type="button" className={classNames('ros-table-card', `ros-tone--${tone}`, selected && 'is-selected')} aria-pressed={selected} onClick={onSelect}><span>{number}</span><strong>Mesa {number}</strong><small>{status}</small>{detail && <small>{detail}</small>}<b aria-hidden="true">›</b></button>;
}

export interface PaymentOptionProps { title: string; description: string; icon?: ReactNode; selected?: boolean; disabled?: boolean; badge?: string; onSelect?: () => void }
export function PaymentOption({ title, description, icon, selected, disabled, badge, onSelect }: PaymentOptionProps) {
  return <button type="button" className={classNames('ros-payment-option', selected && 'is-selected')} aria-pressed={selected} disabled={disabled} onClick={onSelect}>{icon && <span className="ros-payment-option__icon" aria-hidden="true">{icon}</span>}<strong>{title}</strong><p>{description}</p>{badge && <small>{badge}</small>}<i aria-hidden="true">{selected ? '✓' : ''}</i></button>;
}

export interface AccountLine { id: string; quantity: number; label: string; detail?: string; amount: string }
export interface AccountSummaryProps { table: string; lines: AccountLine[]; subtotal: string; tip?: string; total: string; updatedAt?: string }
export function AccountSummary({ table, lines, subtotal, tip, total, updatedAt }: AccountSummaryProps) {
  return <aside className="ros-account-summary" aria-label={`Resumen de cuenta ${table}`}><header><span>Resumen persistente</span><h2>Consumo actual</h2><strong>{table}</strong>{updatedAt && <small>Actualizado {updatedAt}</small>}</header><ul>{lines.map((line) => <li key={line.id}><b>{line.quantity}×</b><span><strong>{line.label}</strong>{line.detail && <small>{line.detail}</small>}</span><strong>{line.amount}</strong></li>)}</ul><dl><div><dt>Subtotal</dt><dd>{subtotal}</dd></div>{tip && <div><dt>Propina</dt><dd>{tip}</dd></div>}<div className="ros-account-summary__total"><dt>Total informativo</dt><dd>{total}</dd></div></dl><small>El importe final se confirma en servidor.</small></aside>;
}

export interface TipIndicatorProps { value?: string; state: 'unregistered' | 'pending' | 'confirmed'; voluntary?: boolean }
export function TipIndicator({ value = 'Sin registrar', state, voluntary = true }: TipIndicatorProps) {
  const labels = { unregistered: 'Sin registrar', pending: 'Pendiente de ACK', confirmed: 'Confirmada por servidor' };
  return <div className={`ros-tip ros-tip--${state}`} role="status"><span>Propina {voluntary && 'voluntaria'}</span><strong>{value}</strong><small>{labels[state]}</small></div>;
}
