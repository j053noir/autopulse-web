"use client";

import React, { use } from "react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { useUIStore } from "@/hooks/useUIStore";
import { useAuctionsQuery } from "@/hooks/useAuctionsQuery";
import { useMyBidsQuery } from "@/hooks/useMyBidsQuery";
import { useAuth } from "@/hooks/useAuth";
import { AuctionCard } from "@/components/ui/auction-card";

// Importación de diccionarios directamente para uso del lado del cliente
import en from "@/../dictionaries/en.json";
import es from "@/../dictionaries/es.json";

const dictionaries = { en, es };

export default function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const dict = dictionaries[lang as "en" | "es"] || dictionaries.en;

  // Zustand State
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const lastViewedAuctionId = useUIStore((state) => state.lastViewedAuctionId);
  const setLastViewedAuctionId = useUIStore((state) => state.setLastViewedAuctionId);

  // TanStack Query
  const { auctions, isLoading, isError, refetch } = useAuctionsQuery();
  const { bids, isLoading: isBidsLoading } = useMyBidsQuery();
  const { isAuthenticated } = useAuth();

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        theme === "dark" 
          ? "bg-brand-dark text-white" 
          : "bg-slate-50 text-slate-900"
      }`}
    >
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Barra superior de configuración de UI (Client State en Zustand) */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            {lastViewedAuctionId && (
              <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {lang === "es" ? "Última subasta visualizada (ID): " : "Last viewed auction (ID): "}
                <span className="font-mono font-bold text-brand-accent">{lastViewedAuctionId}</span>
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`flex items-center gap-2 border transition-all ${
                theme === "dark"
                  ? "!border-gray-800 !text-gray-300 hover:!text-white hover:bg-slate-800"
                  : "!border-slate-300 !text-slate-700 hover:!text-slate-950 hover:bg-slate-100"
              }`}
            >
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className={`text-4xl sm:text-5xl font-black tracking-tight mb-4 ${
            theme === "dark" ? "text-white" : "text-slate-900"
          }`}>
            {dict.home.title.split("AutoPulse")[0]}
            <span className="text-brand-accent">AutoPulse</span>
            {dict.home.title.split("AutoPulse")[1] || ""}
          </h1>
          <p className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            {dict.home.subtitle}
          </p>
        </div>

        {/* Navigation & Tabs */}
        <Tabs defaultValue="subastas" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className={theme === "light" ? "bg-slate-200 border-slate-300 text-slate-800" : ""}>
              <TabsTrigger value="subastas">{dict.home.tabs.activeAuctions}</TabsTrigger>
              <TabsTrigger value="historial">{lang === "es" ? "Tus Ofertas" : "Your Bids"}</TabsTrigger>
              <TabsTrigger value="reglas">{dict.home.tabs.gameRules}</TabsTrigger>
            </TabsList>
          </div>

          {/* Active Auctions Grid */}
          <TabsContent value="subastas">
            {isLoading ? (
              // Skeletons de Carga Reales
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((index) => (
                  <Card key={index} className={`flex flex-col h-full animate-pulse ${
                    theme === "dark" ? "border-gray-800" : "border-slate-200"
                  }`}>
                    <div className={`h-48 w-full ${theme === "dark" ? "bg-slate-800" : "bg-slate-200"}`} />
                    <Card.Header>
                      <div className={`h-6 rounded w-3/4 ${theme === "dark" ? "bg-slate-800" : "bg-slate-200"}`} />
                    </Card.Header>
                    <Card.Content className="flex-1">
                      <div className="space-y-2 mb-4">
                        <div className={`h-4 rounded ${theme === "dark" ? "bg-slate-800" : "bg-slate-200"}`} />
                        <div className={`h-4 rounded w-5/6 ${theme === "dark" ? "bg-slate-800" : "bg-slate-200"}`} />
                      </div>
                      <div className={`h-16 rounded-lg ${theme === "dark" ? "bg-slate-800/50" : "bg-slate-200/50"}`} />
                    </Card.Content>
                    <Card.Footer className="flex items-center justify-between">
                      <div className={`h-4 rounded w-1/3 ${theme === "dark" ? "bg-slate-800" : "bg-slate-200"}`} />
                      <div className={`h-8 rounded w-24 ${theme === "dark" ? "bg-slate-800" : "bg-slate-200"}`} />
                    </Card.Footer>
                  </Card>
                ))}
              </div>
            ) : isError ? (
              // Estado de Error
              <div className={`max-w-md mx-auto text-center p-8 border rounded-xl shadow-md ${
                theme === "dark"
                  ? "bg-brand-surface border-red-900/50 text-white"
                  : "bg-white border-red-200 text-slate-900"
              }`}>
                <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-red-500">⚠️</span>
                </div>
                <h3 className="text-lg font-bold mb-2">
                  {lang === "es" ? "Error al obtener subastas" : "Error fetching auctions"}
                </h3>
                <p className={`text-sm mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {lang === "es" 
                    ? "Hubo un problema de conexión con el servidor de subastas. Por favor, reintenta."
                    : "There was a connection issue with the auction server. Please retry."
                  }
                </p>
                <Button variant="primary" onClick={() => refetch()}>
                  {lang === "es" ? "Reintentar" : "Retry"}
                </Button>
              </div>
            ) : auctions.length === 0 ? (
              // Sin Subastas Activas
              <Card className={`max-w-md mx-auto text-center p-8 border ${
                theme === "dark" ? "border-gray-800 bg-brand-surface" : "border-slate-200 bg-white"
              }`}>
                <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-500">🏁</span>
                </div>
                <h3 className="text-lg font-bold mb-2">
                  {lang === "es" ? "No hay subastas en vivo" : "No live auctions"}
                </h3>
                <p className={`text-sm mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {lang === "es" 
                    ? "Vuelve más tarde para descubrir nuevos vehículos disponibles."
                    : "Check back later to discover new available vehicles."
                  }
                </p>
              </Card>
            ) : (
              // Listado de Subastas
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {auctions.map((auction) => (
                  <AuctionCard
                    key={auction.id}
                    auction={auction}
                    theme={theme}
                    lang={lang}
                    onBidClick={(id) => setLastViewedAuctionId(id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* User Active Bids */}
          <TabsContent value="historial">
            {!isAuthenticated ? (
              // No autenticado
              <Card className={`max-w-md mx-auto text-center p-8 border ${
                theme === "dark" ? "border-gray-800 bg-brand-surface text-white" : "border-slate-200 bg-white text-slate-900"
              }`}>
                <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-500">🔒</span>
                </div>
                <h3 className="text-lg font-bold mb-2">
                  {dict.userBids.loginPrompt}
                </h3>
                <p className={`text-sm mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {dict.userBids.loginRequiredDesc}
                </p>
              </Card>
            ) : isBidsLoading ? (
              // Cargando ofertas
              <div className="space-y-4 max-w-2xl mx-auto">
                {[1, 2].map((i) => (
                  <div key={i} className={`p-4 rounded-xl border animate-pulse flex justify-between items-center ${
                    theme === "dark" ? "border-gray-800 bg-brand-surface" : "border-slate-200 bg-white"
                  }`}>
                    <div className="space-y-2">
                      <div className={`h-5 w-40 rounded ${theme === "dark" ? "bg-slate-800" : "bg-slate-200"}`} />
                      <div className={`h-4 w-24 rounded ${theme === "dark" ? "bg-slate-800" : "bg-slate-200"}`} />
                    </div>
                    <div className={`h-8 w-24 rounded ${theme === "dark" ? "bg-slate-800" : "bg-slate-200"}`} />
                  </div>
                ))}
              </div>
            ) : bids.length === 0 ? (
              // Sin ofertas
              <Card className={`max-w-md mx-auto text-center p-8 border ${
                theme === "dark" ? "border-gray-800 bg-brand-surface" : "border-slate-200 bg-white"
              }`}>
                <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-500">📥</span>
                </div>
                <h3 className="text-lg font-bold mb-2">
                  {dict.userBids.noBids}
                </h3>
                <p className={`text-sm mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {dict.userBids.noBidsDesc}
                </p>
              </Card>
            ) : (
              // Listado de ofertas
              <div className="space-y-4 max-w-3xl mx-auto">
                {bids.map((bid) => {
                  const isOutbid = bid.bidAmount < bid.currentAuctionPrice;
                  return (
                    <div
                      key={bid.bidId}
                      className={`p-5 rounded-2xl border flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all duration-300 ${
                        theme === "dark"
                          ? "bg-brand-surface border-gray-800/80 text-white hover:border-gray-700"
                          : "bg-white border-slate-200 text-slate-900 hover:border-slate-300"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-lg">{bid.vehicleName}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            bid.isAuctionActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse"
                              : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                          }`}>
                            {bid.isAuctionActive 
                              ? dict.userBids.live
                              : dict.userBids.ended}
                          </span>
                        </div>
                        <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          {dict.userBids.placedOn}{" "}
                          {new Date(bid.bidDate).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-6">
                        <div className="text-right">
                          <span className="block text-xs text-gray-500">
                            {dict.userBids.yourBid}
                          </span>
                          <span className="font-extrabold text-lg text-emerald-400">
                            ${bid.bidAmount.toLocaleString()}
                          </span>
                          {bid.isAuctionActive && (
                            <span className={`block text-[10px] font-bold ${
                              isOutbid ? "text-rose-400" : "text-emerald-500 animate-pulse"
                            }`}>
                              {isOutbid 
                                ? dict.userBids.outbid 
                                : dict.userBids.winning}
                            </span>
                          )}
                        </div>

                        <Link href={`/${lang}/auctions/${bid.auctionId}`}>
                          <Button variant="outline" size="sm">
                            {dict.userBids.viewDetails}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Game Rules */}
          <TabsContent value="reglas" className={`p-6 rounded-xl border ${
            theme === "dark" ? "bg-brand-surface border-gray-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <h3 className="text-lg font-bold mb-3">{dict.home.tabs.portalTerms}</h3>
            <p className={`text-sm leading-relaxed mb-4 ${theme === "dark" ? "text-gray-300" : "text-slate-700"}`}>
              {dict.home.tabs.portalTermsDesc}
            </p>
            <ul className={`list-disc pl-5 text-sm space-y-2 ${theme === "dark" ? "text-gray-400" : "text-slate-600"}`}>
              <li>{dict.home.rules.rule1}</li>
              <li>{dict.home.rules.rule2}</li>
              <li>{dict.home.rules.rule3}</li>
            </ul>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}