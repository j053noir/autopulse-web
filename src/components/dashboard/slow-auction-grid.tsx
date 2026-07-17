import React from "react";
import { Auction } from "@/types";
import { AuctionCard } from "@/components/ui/auction-card";

export async function SlowAuctionGrid() {
  let auctions: Auction[] = [];
  let errorOccurred = false;

  try {
    // Retraso artificial controlado únicamente en desarrollo para demostración visual de Streaming
    if (process.env.NODE_ENV === "development") {
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }

    // Fetch directo al backend de AutoPulse sin caché para obtener data en tiempo real
    const response = await fetch("http://localhost:5000/api/auctions/active", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    auctions = await response.json();
  } catch (err) {
    console.error("Error fetching active auctions:", err);
    errorOccurred = true;
  }

  // Si ocurre un error, renderizamos una UI refinada indicando el fallo sin tumbar la aplicación
  if (errorOccurred || auctions.length === 0) {
    return (
      <div className="col-span-full py-12 px-4 text-center border border-dashed border-gray-800 rounded-2xl bg-brand-surface/30">
        <div className="w-12 h-12 rounded-full bg-brand-accent/10 text-brand-accent flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">
          {errorOccurred ? "No se pudieron cargar las subastas" : "No hay subastas activas en este momento"}
        </h3>
        <p className="text-sm text-brand-muted max-w-md mx-auto mb-6">
          {errorOccurred 
            ? "Tuvimos un inconveniente al conectar con el servidor de subastas. Por favor, inténtalo de nuevo más tarde." 
            : "Vuelve pronto para ser el primero en pujar por los nuevos vehículos que ingresen al catálogo."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {auctions.map((auction) => (
        <AuctionCard key={auction.id} auction={auction} theme="dark" lang="es" />
      ))}
    </div>
  );
}
