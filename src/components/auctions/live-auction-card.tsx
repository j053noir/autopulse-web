"use client";

import React, { useState, useEffect } from "react";
import { useAuctionHub } from "@/hooks/useAuctionHub";
import { api } from "@/services/api";

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

  const defaultBidderName = initialBidderName || tLive.noOffers || "Sin ofertas";

  const [currentPrice, setCurrentPrice] = useState<number>(initialPrice);
  const [lastBidder, setLastBidder] = useState<string>(defaultBidderName);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);
  const [customBid, setCustomBid] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { isConnected, error: connectionError } = useAuctionHub({
    auctionId,
    onBidPlaced: (newPrice, bidderName) => {
      setCurrentPrice(newPrice);
      setLastBidder(bidderName);
      setIsFlashActive(true);
    },
    onAuctionEnded: (winnerName) => {
      setLastBidder(winnerName);
      setSuccessMsg(`${dict?.home?.tabs?.gameRules || "Finalizada"} - Ganador: ${winnerName}`);
    },
  });

  useEffect(() => {
    if (!isFlashActive) return;
    const timer = setTimeout(() => setIsFlashActive(false), 800);
    return () => clearTimeout(timer);
  }, [isFlashActive]);

  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handlePlaceBid = async (amount: number) => {
    if (amount <= currentPrice) {
      const validationError = tAuctions.errors?.higherPrice || "La puja debe ser mayor al precio actual";
      setErrorMsg(`${validationError}: ${formatPrice(currentPrice)}`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const idempotencyKey = typeof crypto !== "undefined" && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36);

      await api.auctions.placeBid(auctionId, { 
        amount, 
        currency, 
        idempotencyKey 
      });
      setCustomBid("");
      setSuccessMsg(tAuctions.bidSuccess || "¡Puja enviada con éxito!");
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err instanceof Error 
          ? err.message 
          : (tLive.errorGeneric || "Ocurrió un error al enviar tu puja.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickBid = () => {
    const increment = config.increment;
    const newBidAmount = currentPrice + increment;
    handlePlaceBid(newBidAmount);
  };

  const handleCustomBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(customBid);
    if (isNaN(amount) || amount <= 0) {
      setErrorMsg(tLive.numericWarning || "Por favor, introduce un valor numérico válido.");
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

      {/* Visualización del precio */}
      <div
        className={`my-6 rounded-xl p-5 text-center transition-all duration-500 ${
          isFlashActive
            ? "bg-emerald-950/80 border-2 border-emerald-500 scale-102 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            : "bg-neutral-950 border border-neutral-800"
        }`}
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

      {/* Mensajes de feedback */}
      {errorMsg && (
        <div className="mb-4 rounded-lg bg-rose-950/50 border border-rose-900/50 p-3 text-xs text-rose-300 text-center">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 rounded-lg bg-emerald-950/50 border border-emerald-900/50 p-3 text-xs text-emerald-300 text-center">
          {successMsg}
        </div>
      )}
      {connectionError && (
        <div className="mb-4 rounded-lg bg-amber-950/50 border border-amber-900/50 p-3 text-xs text-amber-300 text-center">
          {tLive.connectionError || "Error de conexión en tiempo real."}
        </div>
      )}

      {/* Acciones de Puja */}
      <div className="space-y-4">
        {/* Puja rápida */}
        <button
          type="button"
          onClick={handleQuickBid}
          disabled={isSubmitting || !isConnected}
          className="w-full cursor-pointer rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-md hover:bg-emerald-500 focus:outline-hidden active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting 
            ? (dict?.modals?.placeBid?.submitting || "Procesando...") 
            : `${tLive.quickBid || "Pujar"} +${formatPrice(config.increment)}`}
        </button>

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
