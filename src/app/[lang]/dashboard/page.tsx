import React, { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { AuctionGridSkeleton } from "@/components/dashboard/auction-grid-skeleton";
import { SlowAuctionGrid } from "@/components/dashboard/slow-auction-grid";

// Importación de diccionarios directamente para uso del lado del servidor
import en from "@/../dictionaries/en.json";
import es from "@/../dictionaries/es.json";

const dictionaries = { en, es };

interface DashboardPageProps {
  params: Promise<{ lang: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { lang } = await params;
  const dict = dictionaries[lang as "en" | "es"] || dictionaries.en;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-brand-dark dark:text-white flex flex-col transition-colors duration-300">
      {/* Cabecera de Navegación */}
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Encabezado del Dashboard */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
            Panel de <span className="text-brand-accent">Control</span>
          </h1>
          <p className="text-sm sm:text-base text-brand-muted">
            {lang === "es" 
              ? "Monitoreo en tiempo real del motor de subastas de AutoPulse." 
              : "Real-time monitoring of the AutoPulse auction engine."}
          </p>
        </div>

        {/* Panel Estático de Analíticas y Métricas (Carga Inmediata - 0ms) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Card className="p-5 border-slate-200 dark:border-gray-800/80 bg-white dark:bg-brand-surface/40 shadow-sm dark:shadow-none">
            <span className="block text-xs text-brand-muted uppercase font-bold tracking-wider mb-1">
              {dict.analytics?.bidActivity || "Actividad de Pujas"}
            </span>
            <span className="text-2xl font-black text-slate-800 dark:text-white">
              {dict.analytics?.activityLevel || "Alta"}
            </span>
            <span className="block text-[10px] text-green-500 font-semibold mt-1">
              ↑ 12.4% este ciclo
            </span>
          </Card>

          <Card className="p-5 border-slate-200 dark:border-gray-800/80 bg-white dark:bg-brand-surface/40 shadow-sm dark:shadow-none">
            <span className="block text-xs text-brand-muted uppercase font-bold tracking-wider mb-1">
              {dict.analytics?.averageBid || "Puja Promedio"}
            </span>
            <span className="text-2xl font-black text-brand-accent">
              $34,800 USD
            </span>
            <span className="block text-[10px] text-brand-muted font-semibold mt-1">
              Valor de mercado estimado
            </span>
          </Card>

          <Card className="p-5 border-slate-200 dark:border-gray-800/80 bg-white dark:bg-brand-surface/40 shadow-sm dark:shadow-none">
            <span className="block text-xs text-brand-muted uppercase font-bold tracking-wider mb-1">
              {dict.analytics?.participants || "Postores Activos"}
            </span>
            <span className="text-2xl font-black text-slate-800 dark:text-white">
              {dict.analytics?.activeCount || "84 en vivo"}
            </span>
            <span className="block text-[10px] text-green-500 font-semibold mt-1">
              ● Servidores estables
            </span>
          </Card>

          <Card className="p-5 border-slate-200 dark:border-gray-800/80 bg-white dark:bg-brand-surface/40 shadow-sm dark:shadow-none">
            <span className="block text-xs text-brand-muted uppercase font-bold tracking-wider mb-1">
              Latencia de Carga UI
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-800 dark:text-white">~0ms</span>
              <span className="text-xs text-brand-muted">(Percibido)</span>
            </div>
            <span className="block text-[10px] text-brand-accent font-semibold mt-1 animate-pulse">
              ● Streaming HTML activo
            </span>
          </Card>
        </div>

        {/* Sección de Subastas con Streaming UI y Suspense */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {lang === "es" ? "Subastas Activas" : "Active Auctions"}
              </h2>
              <p className="text-xs sm:text-sm text-brand-muted">
                {lang === "es" 
                  ? "Catálogo de vehículos activos para pujar en tiempo real." 
                  : "Active vehicle catalog available for real-time bidding."}
              </p>
            </div>
          </div>

          {/* Suspense Boundary que renderiza el Skeleton de forma local inmediata en el browser */}
          <Suspense fallback={<AuctionGridSkeleton />}>
            <SlowAuctionGrid />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
