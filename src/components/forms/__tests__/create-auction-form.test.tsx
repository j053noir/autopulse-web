import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CreateAuctionForm } from '../create-auction-form';

describe('CreateAuctionForm Component', () => {
  it('Debe renderizar todos los campos de entrada de texto y el botón de envío', () => {
    render(<CreateAuctionForm />);

    // Textboxes principales por rol
    const textboxes = screen.getAllByRole('textbox');
    expect(textboxes.length).toBeGreaterThanOrEqual(2);

    // Botón de envío
    const submitButton = screen.getByRole('button', { name: /crear subasta/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('Al escribir un VIN inválido y hacer clic en enviar, debe mostrar el mensaje de error de accesibilidad devuelto por Zod de forma asíncrona sin enviar la petición HTTP', async () => {
    const user = userEvent.setup();
    const onSuccessMock = vi.fn();

    render(<CreateAuctionForm onSuccess={onSuccessMock} />);

    // Escribir un VIN inválido (menos de 17 caracteres)
    const vinInput = screen.getByPlaceholderText(/17 caracteres/i);
    await user.type(vinInput, 'INVALID_VIN');

    // Intentar enviar el formulario
    const submitButton = screen.getByRole('button', { name: /crear subasta/i });
    await user.click(submitButton);

    // Debe aparecer el mensaje de validación de Zod
    const errorMessage = await screen.findByText(/17 caracteres/i);
    expect(errorMessage).toBeInTheDocument();

    // No debe haber llamado la callback de éxito
    expect(onSuccessMock).not.toHaveBeenCalled();
  });

  it('Al completar el formulario correctamente con userEvent.type(), debe simular el flujo de envío exitoso', async () => {
    const user = userEvent.setup();
    const onSuccessMock = vi.fn();

    const { container } = render(<CreateAuctionForm onSuccess={onSuccessMock} />);

    // Rellenar campos requeridos de texto
    const titleInput = screen.getByPlaceholderText(/ej. Mazda CX-5/i);
    await user.type(titleInput, 'Toyota Supra MK4 1998');

    const vinInput = screen.getByPlaceholderText(/17 caracteres/i);
    await user.type(vinInput, '1FA6P8CF0H5123456');

    const marqueeInput = container.querySelector('input[name="marquee"]') as HTMLInputElement;
    await user.type(marqueeInput, 'Toyota');

    const modelInput = container.querySelector('input[name="model"]') as HTMLInputElement;
    await user.type(modelInput, 'Supra');

    const basePriceInput = container.querySelector('input[name="basePrice"]') as HTMLInputElement;
    await user.clear(basePriceInput);
    await user.type(basePriceInput, '55000');

    // Fecha futura válida (> 24 horas)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const dateStr = futureDate.toISOString().slice(0, 16);

    const endTimeInput = container.querySelector('input[name="endTime"]') as HTMLInputElement;
    await user.type(endTimeInput, dateStr);

    // Simular la selección/subida del documento obligatoria
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['dummy content'], 'vehiculo.pdf', { type: 'application/pdf' });
    await user.upload(fileInput, file);

    // Esperar a que el archivo sea subido mockeado vía MSW
    await screen.findByText(/✓ Documento subido y asociado con éxito/i);

    // Enviar el formulario
    const submitButton = screen.getByRole('button', { name: /crear subasta/i });
    await user.click(submitButton);

    // Esperar a que se procese la creación exitosa
    await waitFor(() => {
      expect(onSuccessMock).toHaveBeenCalledWith('auction-guid-12345');
    }, { timeout: 3000 });
  });
});
