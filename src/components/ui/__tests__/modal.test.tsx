import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from '../modal';

describe('Modal Component', () => {
  it('No debe renderizar nada si isOpen es false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Título de prueba">
        <p>Contenido interno</p>
      </Modal>
    );

    expect(screen.queryByRole('heading', { name: 'Título de prueba' })).not.toBeInTheDocument();
  });

  it('Debe renderizar el título y contenido cuando isOpen es true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Título de prueba">
        <p>Contenido interno</p>
      </Modal>
    );

    expect(screen.getByRole('heading', { name: 'Título de prueba' })).toBeInTheDocument();
    expect(screen.getByText('Contenido interno')).toBeInTheDocument();
  });

  it('Debe llamar a onClose cuando se hace click en el botón de cerrar', async () => {
    const user = userEvent.setup();
    const onCloseMock = vi.fn();

    render(
      <Modal isOpen={true} onClose={onCloseMock} title="Título de prueba">
        <p>Contenido interno</p>
      </Modal>
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('Debe llamar a onClose cuando el usuario presiona la tecla Escape', async () => {
    const user = userEvent.setup();
    const onCloseMock = vi.fn();

    render(
      <Modal isOpen={true} onClose={onCloseMock} title="Título de prueba">
        <p>Contenido interno</p>
      </Modal>
    );

    await user.keyboard('{Escape}');

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
