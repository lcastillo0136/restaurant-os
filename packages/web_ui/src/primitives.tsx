import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode, TableHTMLAttributes } from 'react';
import type { IconSlotProps, SemanticTone } from './types';
import { classNames } from './utils';

export interface RestaurantButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, IconSlotProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  fullWidth?: boolean;
}

export function RestaurantButton({
  children,
  className,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  icon,
  iconLabel,
  disabled,
  ...props
}: RestaurantButtonProps) {
  return (
    <button
      className={classNames('ros-button', `ros-button--${variant}`, fullWidth && 'ros-button--full', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <span className="ros-spinner" aria-hidden="true" /> : icon ? <span aria-label={iconLabel}>{icon}</span> : null}
      <span>{loading ? 'Procesando…' : children}</span>
    </button>
  );
}

export interface RestaurantIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: ReactNode;
  selected?: boolean;
}

export function RestaurantIconButton({ label, icon, selected, className, ...props }: RestaurantIconButtonProps) {
  return (
    <button
      type="button"
      className={classNames('ros-icon-button', selected && 'is-selected', className)}
      aria-label={label}
      aria-pressed={selected}
      {...props}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}

export interface RestaurantCardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  elevated?: boolean;
  selected?: boolean;
  as?: 'article' | 'section' | 'div';
}

export function RestaurantCard({ children, elevated, selected, as: Element = 'article', className, ...props }: RestaurantCardProps) {
  return <Element className={classNames('ros-card', elevated && 'ros-card--elevated', selected && 'is-selected', className)} {...props}>{children}</Element>;
}

export interface KpiCardProps {
  label: string;
  value: string;
  detail?: string;
  trend?: string;
  tone?: SemanticTone;
}

export function KpiCard({ label, value, detail, trend, tone = 'neutral' }: KpiCardProps) {
  return (
    <RestaurantCard className="ros-kpi-card">
      <div className="ros-kpi-card__top"><span>{label}</span>{trend && <span className={`ros-badge ros-tone--${tone}`}>{trend}</span>}</div>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </RestaurantCard>
  );
}

export interface DataTableColumn<Row> {
  key: keyof Row;
  label: string;
  numeric?: boolean;
  render?: (value: Row[keyof Row], row: Row) => ReactNode;
}

export interface DataTableProps<Row extends { id: string }> extends Omit<TableHTMLAttributes<HTMLTableElement>, 'children'> {
  caption: string;
  columns: Array<DataTableColumn<Row>>;
  rows: Row[];
  emptyMessage?: string;
}

export function DataTable<Row extends { id: string }>({ caption, columns, rows, emptyMessage = 'Sin resultados', className, ...props }: DataTableProps<Row>) {
  return (
    <div className="ros-table-wrap">
      <table className={classNames('ros-table', className)} {...props}>
        <caption>{caption}</caption>
        <thead><tr>{columns.map((column) => <th key={String(column.key)} scope="col" className={column.numeric ? 'is-numeric' : undefined}>{column.label}</th>)}</tr></thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={columns.length} className="ros-table__empty">{emptyMessage}</td></tr>
            : rows.map((row) => <tr key={row.id}>{columns.map((column) => <td key={String(column.key)} className={column.numeric ? 'is-numeric' : undefined}>{column.render ? column.render(row[column.key], row) : String(row[column.key])}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}
