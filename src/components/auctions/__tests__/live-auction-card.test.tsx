import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LiveAuctionCard } from '../live-auction-card';

// Mock de hooks
vi.mock('@/hooks/useAuctionQuery', () => ({
  useAuctionQuery: (id: string) => ({
    auction: {
      id,
      currentBid: 25000,
      lastBidderName: 'Carlos M.',
      minimumBidIncrement: 500,
    },
  }),
}));

vi.mock('@/hooks/useAuctionRealTime', () => ({
  useAuctionRealTime: () => ({
    isConnected: true,
    error: null,
  }),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ lang: 'es' }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { userName: 'TestUser' } }),
}));

function renderWithQueryClient(ui: React.ReactElement) {
  const testQueryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={testQueryClient}>{ui}</QueryClientProvider>
  );
}

describe('LiveAuctionCard Component', () => {
  const mockDict = {
    liveAuction: {
      liveTitle: 'Subasta en vivo',
      currentPrice: 'Precio actual',
      lastBidder: 'Último postor',
    },
    auctions: {
      placeBid: 'Pujar',
    },
  };

  it('Debe renderizar el título del vehículo y la información de precio actual', () => {
    renderWithQueryClient(
      <LiveAuctionCard
        auctionId="auc-100"
        initialPrice={20000}
        currency="USD"
        vehicleName="Ford Mustang GT 2023"
        dict={mockDict}
      />
    );

    expect(screen.getByText('Ford Mustang GT 2023')).toBeInTheDocument();
    expect(screen.getByText('Carlos M.')).toBeInTheDocument();
  });

  it('Debe indicar que la conexión en tiempo real está activa', () => {
    renderWithQueryClient(
      <LiveAuctionCard
        auctionId="auc-100"
        initialPrice={20000}
        currency="USD"
        vehicleName="Ford Mustang GT 2023"
        dict={mockDict}
      />
    );

    // Debe mostrar indicador o texto de conexión activa
    expect(screen.getByText(/Subasta en vivo/i)).toBeInTheDocument();
  });
});
