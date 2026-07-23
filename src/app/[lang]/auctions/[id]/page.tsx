import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { SafeHtmlRenderer } from "@/components/ui/safe-html-renderer";
import { LiveAuctionCard } from "@/components/auctions/live-auction-card";
import { api } from "@/services/api";
import en from "@/../dictionaries/en.json";
import es from "@/../dictionaries/es.json";

const dictionaries = { en, es };

type CurrencyType = "USD" | "CAD" | "COP";

interface AuctionDetailPageProps {
  params: Promise<{
    lang: string;
    id: string;
  }>;
}

export default async function AuctionDetailPage({ params }: AuctionDetailPageProps) {
  const { lang, id } = await params;
  const dict = dictionaries[lang as "en" | "es"] || dictionaries.en;
  const tDetail = dict.auctionDetail || {};

  // Obtener perfil en servidor usando propagación de cookies segura
  let user = null;
  try {
    user = await api.auth.getProfile();
  } catch (e) {
    // Usuario no autenticado
  }

  const showSecurityLab = user?.email === "admin@autopulse.ocm" || user?.email === "admin@autopulse.com";

  // Obtener la subasta real desde el backend
  let auction = null;
  try {
    auction = await api.auctions.getById(id);
  } catch (e) {
    console.error("Error al obtener detalles de la subasta:", e);
  }

  if (!auction) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-dark text-white">
        <Header />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-20 text-center">
          <h2 className="text-xl font-bold text-rose-500">
            {tDetail.notFound || "Subasta no encontrada"}
          </h2>
          <p className="text-brand-muted mt-2 text-sm">
            {tDetail.notFoundDesc || "No se pudo cargar la información de la subasta desde el backend."}
          </p>
          <Link 
            href={`/${lang}/auctions`} 
            className="mt-6 inline-block rounded-xl bg-neutral-800 border border-neutral-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 transition-all"
          >
            {tDetail.backToAuctions || "Volver a Subastas"}
          </Link>
        </main>
      </div>
    );
  }

  // Payload malicioso simulado para evidenciar la mitigación de vectores de ataque XSS
  const simulatedMaliciousPayload = `
    <p class="mb-4 text-emerald-400 font-semibold">
      Vehículo en óptimas condiciones mecánicas, historial de mantenimiento al día y verificado por AutoPulse.
    </p>
    
    <!-- Vector de Ataque 1: Script inyectado directamente -->
    <script>
      console.warn("VULNERABILIDAD CRÍTICA EJECUTADA: Script malicioso robando cookies!");
      alert("XSS ejecutado mediante tag script: " + document.cookie);
    </script>
    
    <!-- Vector de Ataque 2: Payload en atributo onerror de imagen inválida -->
    <img src="x" onerror="alert('XSS ejecutado mediante onerror en etiqueta img!'); console.error('Ataque Exitoso en onerror');" class="hidden" />
    
    <!-- Vector de Ataque 3: Enlace con protocolo javascript ejecutable -->
    <p class="mt-4">
      <a href="javascript:alert('XSS ejecutado desde enlace javascript!')" class="underline text-red-500 hover:text-red-400">
        ¡Haga clic aquí para reclamar un bono de descuento en la subasta!
      </a>
    </p>

    <!-- HTML Seguro que sí debe mantenerse -->
    <p class="mt-4 text-slate-300">
      Equipamiento verificado: Transmisión y suspensión certificadas, rines originales y pintura en excelente estado sin reclamaciones vigentes.
    </p>
  `;

  const currency: CurrencyType = ["USD", "CAD", "COP"].includes(auction.currency)
    ? (auction.currency as CurrencyType)
    : "USD";

  const isFinished = auction.isActive === false || new Date() >= new Date(auction.endTime);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-brand-dark dark:text-white selection:bg-brand-accent selection:text-white transition-colors duration-300">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Link
            href={`/${lang}/auctions`}
            className="text-xs text-brand-muted hover:text-slate-900 dark:hover:text-white transition-colors duration-200 uppercase tracking-wider font-mono"
          >
            &larr; {tDetail.backToAuctions || "Volver a Subastas"}
          </Link>
        </div>

        {/* Detalle del Vehículo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Columna Izquierda: Imágenes y Descripción Sanitizada */}
          <div className="lg:col-span-8 space-y-8">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-brand-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={auction.imageUrl}
                alt={auction.title}
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className={`absolute top-4 left-4 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${isFinished ? "bg-neutral-700" : "bg-red-600 animate-pulse"}`}>
                {isFinished 
                  ? (dict.userBids?.ended || "Finalizado") 
                  : (tDetail.liveAuction || "Subasta Activa")}
              </div>
            </div>

            {/* Ficha de Especificaciones Técnicas */}
            <div className="bg-white dark:bg-brand-surface border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider font-mono border-b border-slate-200 dark:border-slate-800 pb-2">
                {tDetail.technicalSpecs || "Especificaciones Técnicas"}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div>
                  <span className="text-xs text-brand-muted uppercase block font-mono">
                    {tDetail.brand || "Marca"}
                  </span>
                  <span className="text-sm font-semibold">{auction.marquee || "N/A"}</span>
                </div>
                <div>
                  <span className="text-xs text-brand-muted uppercase block font-mono">
                    {tDetail.model || "Modelo"}
                  </span>
                  <span className="text-sm font-semibold">{auction.model || "N/A"}</span>
                </div>
                <div>
                  <span className="text-xs text-brand-muted uppercase block font-mono">
                    {tDetail.mileage || "Kilometraje"}
                  </span>
                  <span className="text-sm font-semibold">
                    {auction.mileage ? `${auction.mileage.toLocaleString()} mi` : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-brand-muted uppercase block font-mono">
                    {tDetail.year || "Año"}
                  </span>
                  <span className="text-sm font-semibold">{auction.year || "N/A"}</span>
                </div>
                <div>
                  <span className="text-xs text-brand-muted uppercase block font-mono">VIN</span>
                  <span className="text-sm font-mono text-emerald-400 break-all">{auction.vin || "N/A"}</span>
                </div>
                <div>
                  <span className="text-xs text-brand-muted uppercase block font-mono">ID</span>
                  <span className="text-sm font-mono text-brand-accent break-all">{auction.id}</span>
                </div>
                <div>
                  <span className="text-xs text-brand-muted uppercase block font-mono">
                    {lang === "es" ? "Categoría" : "Category"}
                  </span>
                  <span className="text-sm font-semibold capitalize">{auction.category || "N/A"}</span>
                </div>
                <div>
                  <span className="text-xs text-brand-muted uppercase block font-mono">
                    {lang === "es" ? "Incremento Mínimo" : "Min Increment"}
                  </span>
                  <span className="text-sm font-semibold text-emerald-400">
                    {auction.minimumBidIncrement 
                      ? new Intl.NumberFormat(lang === "es" ? "es-CO" : "en-US", { style: "currency", currency: auction.currency, minimumFractionDigits: 0 }).format(auction.minimumBidIncrement) 
                      : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-brand-muted uppercase block font-mono">
                    {lang === "es" ? "Documentación" : "Documentation"}
                  </span>
                  {auction.documentStorageKey ? (
                    <a
                      href={`/api/documents/${auction.documentStorageKey}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-brand-accent hover:underline flex items-center gap-1 mt-0.5"
                    >
                      📄 {lang === "es" ? "Ver Documento" : "View Document"}
                    </a>
                  ) : (
                    <span className="text-sm font-semibold text-neutral-500">N/A</span>
                  )}
                </div>
              </div>
            </div>

            {/* Panel de Sanitización Demostrativo (Laboratorio de Seguridad) */}
            {showSecurityLab && (
              <div className="bg-slate-50 dark:bg-slate-950/80 border-2 border-dashed border-red-200 dark:border-red-900/60 rounded-2xl p-6 space-y-6 text-slate-800 dark:text-white">
                <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-900 pb-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
                  <h3 className="text-base font-black text-red-500 tracking-wider uppercase font-mono">
                    {tDetail.securityLabTitle || "Laboratorio de Mitigación XSS (OWASP A03:2021)"}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Lado A: Payload Entrada Maliciosa Cruda */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold text-red-400 block uppercase">
                      {tDetail.rawPayloadLabel || "[❌] Payload Malicioso de Entrada"}
                    </span>
                    <pre className="text-[10px] leading-relaxed p-4 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto text-red-200 font-mono select-all h-60">
                      {simulatedMaliciousPayload.trim()}
                    </pre>
                  </div>

                  {/* Lado B: Renderizado Sanitizado Seguro */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 block uppercase">
                      {tDetail.sanitizedOutputLabel || "[🛡️] Resultado Sanitizado (SafeHtmlRenderer)"}
                    </span>
                    <div className="p-4 bg-white dark:bg-brand-surface border border-slate-200 dark:border-slate-800 rounded-xl text-sm leading-relaxed h-60 overflow-y-auto">
                      <SafeHtmlRenderer htmlContent={simulatedMaliciousPayload} className="prose prose-invert prose-emerald max-w-none" />
                    </div>
                  </div>
                </div>

                <div className="text-xs bg-slate-100 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-brand-muted">
                  <strong>{tDetail.securityNoteLabel || "Nota de Seguridad"}:</strong>{" "}
                  {tDetail.securityNoteDesc || "DOMPurify ha removido quirúrgicamente la etiqueta <script>, ha bloqueado la inyección de javascript en el href del enlace, y ha desarmado el evento onerror de la imagen."}
                </div>
              </div>
            )}

          </div>

          {/* Columna Derecha: Tarjeta de Puja Activa */}
          <div className="lg:col-span-4 space-y-6">
            <LiveAuctionCard
              auctionId={auction.id}
              initialPrice={auction.currentBid || auction.basePrice}
              initialBidderName={auction.lastBidderName || dict.liveAuction.noOffers || "Sin ofertas"}
              currency={currency}
              vehicleName={auction.vehicleTitle || auction.title}
              dict={dict}
            />

            <div className="bg-white dark:bg-brand-surface/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3 shadow-sm dark:shadow-none">
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-white uppercase block">
                🛡️ {tDetail.securityPortalTitle || "Portales Seguros AutoPulse"}
              </span>
              <p className="text-xs text-brand-muted leading-relaxed">
                {tDetail.securityPortalDesc || "Esta página cuenta con protección de seguridad activa."}
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
