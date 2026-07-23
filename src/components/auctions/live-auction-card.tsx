"use client";

import React, { useState } from "react";
import { useAuctionQuery } from "@/hooks/useAuctionQuery";
import { useAuctionRealTime } from "@/hooks/useAuctionRealTime";
import { usePlaceBidMutation } from "@/hooks/usePlaceBidMutation";
import { BidActionButton } from "@/components/auctions/bid-action-button";
import { useUIStore } from "@/hooks/useUIStore";

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
  const theme = useUIStore((state) => state.theme);

  const currentPrice = auction?.currentBid ?? initialPrice;
  const lastBidder = auction?.lastBidderName ?? initialBidderName ?? (tLive.noOffers || "Sin ofertas");

  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;
  const minIncrement = auction?.minimumBidIncrement ?? config.increment;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handlePlaceBid = (amount: number) => {
    if (amount < currentPrice + minIncrement) {
      const validationError = tAuctions.errors?.higherPrice || "La puja debe ser mayor o igual al mínimo requerido";
      alert(`${tAuctions.errors?.prefix || "Error"}: ${validationError}: ${formatPrice(currentPrice + minIncrement)}`);
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
    <div className={`max-w-md w-full rounded-2xl border p-6 shadow-2xl transition-all duration-300 ${
      theme === "dark" 
        ? "border-slate-800 bg-brand-surface/90 text-white hover:border-slate-700" 
        : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
    }`}>
      {/* Encabezado */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
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
        <h2 className={`mt-2 text-2xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
          {vehicleName}
        </h2>
      </div>

      {/* Visualización del precio con animación por cambio de key (sin useEffects) */}
      <div
        key={currentPrice}
        className={`my-6 rounded-xl p-5 text-center border transition-all duration-500 animate-in fade-in zoom-in-95 duration-300 ${
          theme === "dark" ? "bg-brand-dark border-slate-800" : "bg-slate-100/50 border-slate-200"
        }`}
      >
        <p className={`text-sm font-medium ${theme === "dark" ? "text-brand-muted" : "text-slate-500"}`}>
          {tLive.currentPrice || "Precio Actual"}
        </p>
        <p className="text-4xl font-extrabold tracking-tight text-emerald-400 mt-1">
          {formatPrice(currentPrice)}
        </p>
        <div className={`mt-3 flex items-center justify-center gap-2 text-sm ${theme === "dark" ? "text-brand-muted" : "text-slate-600"}`}>
          <span className="font-semibold">{tLive.lastBidder || "Último postor"}:</span>
          <span className={`px-2 py-0.5 rounded border ${
            theme === "dark" 
              ? "text-emerald-300 bg-brand-dark/40 border-slate-800/80" 
              : "text-emerald-600 bg-emerald-50 border-emerald-200"
          }`}>
            {lastBidder}
          </span>
        </div>
      </div>

      {/* Mensajes de feedback de conexión */}
      {connectionError && (
        <div className={`mb-4 rounded-lg p-3 text-xs text-center animate-pulse border ${
          theme === "dark" ? "bg-amber-950/50 border-amber-900/50 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-800"
        }`}>
          {tLive.connectionError || "Error de conexión en tiempo real."}
        </div>
      )}

      {/* Acciones de Puja */}
      {(() => {
        const isFinished = auction?.isActive === false || (auction?.endTime ? new Date() >= new Date(auction.endTime) : false);
        if (isFinished) {
          return (
            <div className={`rounded-xl border p-5 text-center shadow-inner ${
              theme === "dark" 
                ? "bg-brand-dark/60 border-slate-850 text-rose-450" 
                : "bg-rose-50/50 border-rose-100 text-rose-600"
            }`}>
              <p className="text-sm font-bold uppercase tracking-wider text-rose-400">
                {dict.userBids?.ended || "Finalizado"}
              </p>
              <p className={`text-xs mt-2 leading-relaxed ${theme === "dark" ? "text-brand-muted" : "text-slate-500"}`}>
                {tLive.endedDesc || "Esta subasta ha finalizado y no acepta más ofertas."}
              </p>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            {/* Puja rápida */}
            <BidActionButton
              auctionId={auctionId}
              amount={currentPrice + minIncrement}
              currency={currency}
              label={`${tLive.quickBid || "Pujar"} +${formatPrice(minIncrement)}`}
              disabled={!isConnected}
            />

            {/* Separador */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-neutral-800"></div>
              <span className="flex-shrink mx-4 text-neutral-500 text-xs font-semibold">
                {tLive.or || "O"}
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-neutral-800"></div>
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
                  placeholder={`${tLive.customBidMin || "Mínimo"}: ${(currentPrice + minIncrement).toFixed(0)}`}
                  min={currentPrice + minIncrement}
                  disabled={isSubmitting || !isConnected}
                  className={`w-full rounded-xl border py-3 pl-9 pr-4 text-sm outline-hidden focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all ${
                    theme === "dark" 
                      ? "border-slate-800 bg-brand-dark text-white placeholder-slate-500" 
                      : "border-slate-200 bg-slate-100 text-slate-800 placeholder-slate-400"
                  }`}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !isConnected || !customBid}
                className={`cursor-pointer rounded-xl px-5 text-sm font-semibold transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === "dark" 
                    ? "bg-brand-surface border border-slate-700 text-white hover:bg-slate-700" 
                    : "bg-slate-200 border border-slate-300 text-slate-800 hover:bg-slate-300"
                }`}
              >
                {tLive.send || "Enviar"}
              </button>
            </form>
          </div>
        );
      })()}
    </div>
  );
}
