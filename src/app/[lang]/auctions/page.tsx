"use client";

import React, { useCallback, use } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/header";
import { useUIStore } from "@/hooks/useUIStore";
import { useAuctionsQuery } from "@/hooks/useAuctionsQuery";
import { useAuctionActions } from "@/hooks/useAuctionActions";
import { VirtualizedAuctionList } from "@/components/ui/virtualized-auction-list";
import en from "@/../dictionaries/en.json";
import es from "@/../dictionaries/es.json";

const dictionaries = { en, es };

// Lazy loading the heavy analytical component to optimize initial bundle size and page interactive readiness
const AuctionAnalytics = dynamic(
  () => import("@/components/ui/auction-analytics"),
  {
    loading: () => (
      <div className="h-[120px] w-full bg-brand-surface animate-pulse rounded-xl mb-8 border border-slate-800 flex items-center justify-center">
        <span className="text-sm text-brand-muted">Cargando...</span>
      </div>
    ),
    ssr: false,
  }
);

export default function AuctionsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const dict = dictionaries[lang as "en" | "es"] || dictionaries.en;
  const theme = useUIStore((state) => state.theme);
  const { auctions, isLoading, isError, refetch } = useAuctionsQuery();
  const { placeBid } = useAuctionActions();

  // Stable callback handler for the individual rows
  const handleBid = useCallback(
    (id: string) => {
      const auction = auctions.find((a) => a.id === id);
      if (auction) {
        // Quick interactive action: increase the current bid by $500
        const bidIncrement = 500;
        const newBidAmount = auction.currentBid + bidIncrement;
        placeBid(id, newBidAmount);
      }
    },
    [auctions, placeBid]
  );

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        theme === "dark" ? "bg-brand-dark text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">
            {dict.virtualPanel.title}
          </h1>
          <p className="text-sm text-brand-muted">
            {dict.virtualPanel.subtitle}
          </p>
        </div>

        {/* Dynamic component loaded lazily */}
        <AuctionAnalytics />

        {isLoading ? (
          <div className="h-[400px] w-full bg-brand-surface/50 border border-slate-800 rounded-xl flex items-center justify-center animate-pulse">
            <span className="text-brand-muted text-sm">
              {dict.virtualPanel.loading}
            </span>
          </div>
        ) : isError ? (
          <div className="p-8 text-center bg-brand-surface border border-slate-800 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-2">
              {dict.virtualPanel.error}
            </h3>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-brand-accent text-white font-bold rounded hover:opacity-90 transition-opacity"
            >
              {dict.virtualPanel.retry}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-xs text-brand-muted font-mono">
                {dict.virtualPanel.renderedItems}: {auctions.length.toLocaleString()} {dict.virtualPanel.activeCount}
              </span>
            </div>
            {/* High-Performance Virtualized List */}
            <VirtualizedAuctionList auctions={auctions} onBid={handleBid} dict={dict} />
          </div>
        )}
      </main>
    </div>
  );
}
