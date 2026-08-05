import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { BidModal } from '../bid-modal';

describe('BidModal Component', () => {
  const mockAuction = {
    id: 'auc-1',
    title: 'Porsche 911 GT3 RS 2023',
    currentBid: 150000,
    currency: 'USD',
  };

  const mockDict = {
    modals: {
      placeBid: {
        title: 'Realizar una Puja',
        currentBid: 'Puja Actual',
        yourBid: 'Monto de tu Puja',
        submit: 'Confirmar Oferta',
        errorLabel: 'La puja debe ser mayor a la puja actual',
      },
      close: 'Cancelar',
    },
  };

  it('No renderiza contenido si isOpen es false', () => {
    render(
      <BidModal
        isOpen={false}
        onClose={vi.fn()}
        auction={mockAuction}
        onPlaceBid={vi.fn()}
        isSubmitting={false}
        dict={mockDict}
      />
    );

    expect(screen.queryByRole('heading', { name: /Realizar una Puja/i })).not.toBeInTheDocument();
  });

  it('Renderiza el modal con la puja sugerida cuando isOpen es true', () => {
    render(
      <BidModal
        isOpen={true}
        onClose={vi.fn()}
        auction={mockAuction}
        onPlaceBid={vi.fn()}
        isSubmitting={false}
        dict={mockDict}
      />
    );

    expect(screen.getByRole('heading', { name: /Realizar una Puja/i })).toBeInTheDocument();
    expect(screen.getByText('Porsche 911 GT3 RS 2023')).toBeInTheDocument();

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue(150500); // currentBid (150000) + 500
  });

  it('Muestra un mensaje de error si el monto ingresado es menor o igual al precio actual', async () => {
    const user = userEvent.setup();
    const onPlaceBidMock = vi.fn();

    render(
      <BidModal
        isOpen={true}
        onClose={vi.fn()}
        auction={mockAuction}
        onPlaceBid={onPlaceBidMock}
        isSubmitting={false}
        dict={mockDict}
      />
    );

    // Modal se renderiza vía React Portal en document.body
    const form = document.querySelector('form') as HTMLFormElement;
    form.setAttribute('noValidate', 'true');

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '100000'); // Menor a 150000

    const submitBtn = screen.getByRole('button', { name: /Confirmar Oferta/i });
    await user.click(submitBtn);

    expect(screen.getByText('La puja debe ser mayor a la puja actual')).toBeInTheDocument();
    expect(onPlaceBidMock).not.toHaveBeenCalled();
  });

  it('Invoca onPlaceBid y onClose al ingresar un monto válido y enviar', async () => {
    const user = userEvent.setup();
    const onPlaceBidMock = vi.fn();
    const onCloseMock = vi.fn();

    render(
      <BidModal
        isOpen={true}
        onClose={onCloseMock}
        auction={mockAuction}
        onPlaceBid={onPlaceBidMock}
        isSubmitting={false}
        dict={mockDict}
      />
    );

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '160000');

    const submitBtn = screen.getByRole('button', { name: /Confirmar Oferta/i });
    await user.click(submitBtn);

    expect(onPlaceBidMock).toHaveBeenCalledWith('auc-1', 160000, 'USD');
    expect(onCloseMock).toHaveBeenCalled();
  });
});
