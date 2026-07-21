"use client";

import React, { useState } from "react";
import { useAuctionQuery } from "@/hooks/useAuctionQuery";
import { useAuctionRealTime } from "@/hooks/useAuctionRealTime";
import { usePlaceBidMutation } from "@/hooks/usePlaceBidMutation";
import { BidActionButton } from "@/components/auctions/bid-action-button";

type CurrencyType = "USD" | "CAD" | "COP";

interface LiveAuctionCardProps {
  auctionId: string;
  initialPrice: number;
  initialBidderName?: string;
  currency: CurrencyType;
  vehicleName: string;
  dict: any;
}

const CURRENCY_CONFIG: Record<CurrencyType, { symbol: string; increment: number; locale: string }> = {
  USD: { symbol: "$", increment: 250, locale: "en-US" },
  CAD: { symbol: "C$", increment: 300, locale: "en-CA" },
  COP: { symbol: "Col$", increment: 1000000, locale: "es-CO" },
};

export function LiveAuctionCard({
  auctionId,
  initialPrice,
  initialBidderName,
  currency,
  vehicleName,
  dict,
}: LiveAuctionCardProps) {
  const tLive = dict?.liveAuction || {};
  const tAuctions = dict?.auctions || {};

  const [customBid, setCustomBid] = useState<string>("");

  // Carga del estado desde la caché global de React Query (o HTTP si está vacío)
  const { auction } = useAuctionQuery(auctionId);

  // Escucha activa de SignalR vinculada al socket y caché
  const { isConnected, error: connectionError } = useAuctionRealTime({ auctionId });

  // Mutación optimista para enviar ofertas con rollback
  const { mutate: placeBid, isPending: isSubmitting } = usePlaceBidMutation();

  const currentPrice = auction?.currentBid ?? initialPrice;
  const lastBidder = auction?.lastBidderName ?? initialBidderName ?? (tLive.noOffers || "Sin ofertas");

  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handlePlaceBid = (amount: number) => {
    if (amount <= currentPrice) {
      const validationError = tAuctions.errors?.higherPrice || "La puja debe ser mayor al precio actual";
      alert(`${tAuctions.errors?.prefix || "Error"}: ${validationError}: ${formatPrice(currentPrice)}`);
      return;
    }

    placeBid({
      auctionId,
      amount,
      currency,
    });
    setCustomBid("");
  };


  const handleCustomBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(customBid);
    if (isNaN(amount) || amount <= 0) {
      alert(tLive.numericWarning || "Por favor, introduce un valor numérico válido.");
      return;
    }
    handlePlaceBid(amount);
  };

  return (
    <div className="max-w-md w-full rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 text-white shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-neutral-700">
      {/* Encabezado */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            {tLive.title || "Subasta en Vivo"}
          </span>
          <span className="flex items-center gap-1.5 text-xs">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
              }`}
            />
            {isConnected ? (tLive.connected || "Conectado") : (tLive.disconnected || "Desconectado")}
          </span>
        </div>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
          {vehicleName}
        </h2>
      </div>

      {/* Visualización del precio con animación por cambio de key (sin useEffects) */}
      <div
        key={currentPrice}
        className="my-6 rounded-xl p-5 text-center bg-neutral-950 border border-neutral-800 transition-all duration-500 animate-in fade-in zoom-in-95 duration-300"
      >
        <p className="text-sm font-medium text-neutral-400">
          {tLive.currentPrice || "Precio Actual"}
        </p>
        <p className="text-4xl font-extrabold tracking-tight text-emerald-400 mt-1">
          {formatPrice(currentPrice)}
        </p>
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-neutral-300">
          <span className="font-semibold">{tLive.lastBidder || "Último postor"}:</span>
          <span className="text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">
            {lastBidder}
          </span>
        </div>
      </div>

      {/* Mensajes de feedback de conexión */}
      {connectionError && (
        <div className="mb-4 rounded-lg bg-amber-950/50 border border-amber-900/50 p-3 text-xs text-amber-300 text-center animate-pulse">
          {tLive.connectionError || "Error de conexión en tiempo real."}
        </div>
      )}

      {/* Acciones de Puja */}
      <div className="space-y-4">
        {/* Puja rápida */}
        <BidActionButton
          auctionId={auctionId}
          amount={currentPrice + config.increment}
          currency={currency}
          label={`${tLive.quickBid || "Pujar"} +${formatPrice(config.increment)}`}
          disabled={!isConnected}
        />

        {/* Separador */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-neutral-800"></div>
          <span className="flex-shrink mx-4 text-neutral-500 text-xs font-semibold">
            {tLive.or || "O"}
          </span>
          <div className="flex-grow border-t border-neutral-800"></div>
        </div>

        {/* Puja personalizada */}
        <form onSubmit={handleCustomBidSubmit} className="flex gap-2">
          <div className="relative flex-grow">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-neutral-500 font-semibold">
              {config.symbol}
            </span>
            <input
              type="number"
              value={customBid}
              onChange={(e) => setCustomBid(e.target.value)}
              placeholder={`${tLive.customBidMin || "Mínimo"}: ${(currentPrice + 1).toFixed(0)}`}
              min={currentPrice + 1}
              disabled={isSubmitting || !isConnected}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 py-3 pl-9 pr-4 text-sm text-white placeholder-neutral-600 outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !isConnected || !customBid}
            className="cursor-pointer rounded-xl bg-neutral-800 border border-neutral-700 px-5 text-sm font-semibold text-white hover:bg-neutral-700 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {tLive.send || "Enviar"}
          </button>
        </form>
      </div>
    </div>
  );
}
