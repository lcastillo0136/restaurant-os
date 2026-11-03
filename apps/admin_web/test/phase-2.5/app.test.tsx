import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from '../../src/App';

describe('App — experiencia administrativa demo', () => {
  it('conserva la navegación horizontal, etiqueta demo y módulos pendientes', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeTruthy();
    expect(screen.getByText('DEMOSTRACIÓN')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Menú' }));
    expect(
      screen.getByRole('heading', {
        name: 'Funcionalidad pendiente de implementación',
      }),
    ).toBeTruthy();
  });

  it('preserva un formulario de sucursal cuando la mutación demo recibe 409', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Ajustes' }));
    await user.selectOptions(
      screen.getByLabelText('Escenario UX demo'),
      'MUTATION_REJECTED',
    );
    await user.type(screen.getByLabelText('Código'), 'ux-branch');
    await user.type(screen.getByLabelText('Nombre'), 'Sucursal UX');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() =>
      expect(screen.getByText('La mutación demo fue rechazada')).toBeTruthy(),
    );
    expect((screen.getByLabelText('Código') as HTMLInputElement).value).toBe(
      'ux-branch',
    );
    expect((screen.getByLabelText('Nombre') as HTMLInputElement).value).toBe(
      'Sucursal UX',
    );
    expect(
      screen.queryByText('Sucursal guardada tras confirmación del repositorio demo.'),
    ).toBeNull();
  });

  it('distingue sesión expirada, permiso insuficiente y recuperación explícita', async () => {
    const user = userEvent.setup();
    render(<App />);

    const scenario = screen.getByLabelText('Escenario UX demo');
    await user.selectOptions(scenario, 'OFFLINE');
    expect(screen.getByText('● Sin conexión demo.')).toBeTruthy();
    await user.click(
      screen.getByRole('button', {
        name: 'Recuperar conexión y actualizar',
      }),
    );
    await waitFor(() =>
      expect(screen.getByText('● Conexión demo disponible.')).toBeTruthy(),
    );

    await user.selectOptions(scenario, 'FORBIDDEN');
    expect(screen.getByText('Sucursal oculta por permiso insuficiente.')).toBeTruthy();

    await user.selectOptions(scenario, 'SESSION_EXPIRED');
    expect(screen.getByRole('heading', { name: 'Sesión expirada' })).toBeTruthy();
    await user.click(
      screen.getByRole('button', { name: 'Volver a la pantalla de acceso' }),
    );
    expect(screen.getByRole('heading', { name: 'Acceso requerido' })).toBeTruthy();
  });
});
