import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  AccountSummary, ConnectionStatus, DataTable, HorizontalNavigation, KdsOrderCard, Modal,
  PaymentOption, RestaurantButton, TableCard, TextField,
} from './index';

describe('Restaurant OS React components', () => {
  it('renders an accessible button and dispatches interaction', () => {
    const onClick = vi.fn();
    render(<RestaurantButton onClick={onClick}>Guardar</RestaurantButton>);
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('blocks a loading button and exposes busy state', () => {
    render(<RestaurantButton loading>Guardar</RestaurantButton>);
    const button = screen.getByRole('button', { name: 'Procesando…' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('associates field errors and invalid state', () => {
    render(<TextField id="product" label="Producto" error="Campo requerido" />);
    const input = screen.getByLabelText('Producto');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Campo requerido');
  });

  it('changes horizontal navigation without acting as business routing', () => {
    const onChange = vi.fn();
    render(<HorizontalNavigation label="Administración" activeId="home" onChange={onChange} items={[{ id: 'home', label: 'Inicio' }, { id: 'tables', label: 'Mesas' }]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Mesas' }));
    expect(onChange).toHaveBeenCalledWith('tables');
  });

  it('renders empty tabular state with its accessible caption', () => {
    render(<DataTable caption="Pedidos" columns={[{ key: 'name', label: 'Nombre' }]} rows={[] as Array<{ id: string; name: string }>} />);
    expect(screen.getByRole('table', { name: 'Pedidos' })).toBeInTheDocument();
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
  });

  it('closes modal with Escape and never confirms implicitly', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(<Modal open title="Confirmar" onClose={onClose} onConfirm={onConfirm}>Contenido</Modal>);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('distinguishes connection state with text, not color only', () => {
    render(<ConnectionStatus state="offline" detail="Mutaciones bloqueadas" />);
    expect(screen.getByRole('status')).toHaveTextContent('Sin conexión');
    expect(screen.getByRole('status')).toHaveTextContent('Mutaciones bloqueadas');
  });

  it('selects tables and payment options through explicit callbacks', () => {
    const onTable = vi.fn();
    const onPayment = vi.fn();
    render(<><TableCard number="04" status="Lista" onSelect={onTable} /><PaymentOption title="Efectivo" description="MVP" onSelect={onPayment} /></>);
    fireEvent.click(screen.getByRole('button', { name: /Mesa 04/ }));
    fireEvent.click(screen.getByRole('button', { name: /Efectivo/ }));
    expect(onTable).toHaveBeenCalledOnce();
    expect(onPayment).toHaveBeenCalledOnce();
  });

  it('shows KDS pending ACK without moving state visually', () => {
    render(<KdsOrderCard ticket="KOT-1" table="Mesa 04" elapsed="4 min" items={[]} status="preparing" pendingAck />);
    expect(screen.getByText(/Pendiente de ACK/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Procesando…' })).toBeDisabled();
  });

  it('labels account total as informative and server-confirmed later', () => {
    render(<AccountSummary table="Mesa 04" lines={[]} subtotal="$0.00" total="$0.00 MXN" />);
    expect(screen.getByText('Total informativo')).toBeInTheDocument();
    expect(screen.getByText(/importe final se confirma en servidor/i)).toBeInTheDocument();
  });
});
