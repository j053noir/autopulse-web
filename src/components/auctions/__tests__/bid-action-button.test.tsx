import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BidActionButton } from '../bid-action-button';

// Mock de Next.js params
vi.mock('next/navigation', () => ({
  useParams: () => ({ lang: 'es' }),
}));

// Mock de useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { userName: 'TestUser' } }),
}));

function renderWithQueryClient(ui: React.ReactElement) {
  const testQueryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={testQueryClient}>{ui}</QueryClientProvider>
  );
}

describe('BidActionButton Component', () => {
  it('Debe renderizar el botón con el label indicado', () => {
    renderWithQueryClient(
      <BidActionButton
        auctionId="auc-1"
        amount={1000}
        currency="USD"
        label="Pujar $1,000 USD"
      />
    );

    const button = screen.getByRole('button', { name: /Pujar \$1,000 USD/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('Debe estar deshabilitado si se le pasa la prop disabled', () => {
    renderWithQueryClient(
      <BidActionButton
        auctionId="auc-1"
        amount={1000}
        currency="USD"
        label="Pujar deshabilitado"
        disabled={true}
      />
    );

    const button = screen.getByRole('button', { name: /Pujar deshabilitado/i });
    expect(button).toBeDisabled();
  });

  it('Debe invocar la mutación y la callback onSuccess al hacer click', async () => {
    const user = userEvent.setup();
    const onSuccessMock = vi.fn();

    renderWithQueryClient(
      <BidActionButton
        auctionId="auc-1"
        amount={1500}
        currency="USD"
        label="Ofertar $1,500 USD"
        onSuccess={onSuccessMock}
      />
    );

    const button = screen.getByRole('button', { name: /Ofertar \$1,500 USD/i });
    await user.click(button);

    // Debe ejecutar onSuccess
    expect(onSuccessMock).toHaveBeenCalled();
  });
});
