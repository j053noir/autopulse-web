import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { SafeHtmlRenderer } from "@/components/ui/safe-html-renderer";
import { LiveAuctionCard } from "@/components/auctions/live-auction-card";
import en from "@/../dictionaries/en.json";
import es from "@/../dictionaries/es.json";

const dictionaries = { en, es };

interface AuctionDetailPageProps {
  params: Promise<{
    lang: string;
    id: string;
  }>;
}

export default async function AuctionDetailPage({ params }: AuctionDetailPageProps) {
  const { lang, id } = await params;
  const dict = dictionaries[lang as "en" | "es"] || dictionaries.en;

  // Datos simulados del vehículo para renderizado estructural
  const mockCar = {
    id,
    title: "2023 Porsche 911 GT3 RS",
    make: "Porsche",
    model: "911 GT3 RS",
    year: 2023,
    color: "Python Green",
    mileage: "1,240 mi",
    engine: "4.0L Flat 6",
    transmission: "Automatic PDK 7-Speed",
    currentBid: 289900,
    endsIn: "2h 45m",
    images: ["https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&auto=format&fit=crop&q=60"],
  };

  // Payload malicioso simulado para evidenciar la mitigación de vectores de ataque XSS
  const simulatedMaliciousPayload = `
    <p class="mb-4 text-emerald-400 font-semibold">
      Vehículo de exhibición en óptimas condiciones, mantenimiento al día en centro oficial Porsche.
    </p>
    
    <!-- Vector de Ataque 1: Script inyectado directamente -->
    <script>
      console.warn("VULNERABILIDAD CRÍTICA EXECUTADA: Script malicioso robando cookies!");
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
      Equipamiento opcional incluido: Paquete Weissach, frenos cerámicos PCCB, jaula antivuelco en fibra de carbono y rines de magnesio forjado.
    </p>
  `;

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark text-white selection:bg-brand-accent selection:text-white">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Link
            href={`/${lang}/auctions`}
            className="text-xs text-brand-muted hover:text-white transition-colors duration-200 uppercase tracking-wider font-mono"
          >
            &larr; {lang === "es" ? "Volver a Subastas" : "Back to Auctions"}
          </Link>
        </div>

        {/* Detalle del Vehículo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Columna Izquierda: Imágenes y Descripción Sanitizada */}
          <div className="lg:col-span-8 space-y-8">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 bg-brand-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mockCar.images[0]}
                alt={mockCar.title}
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-full uppercase tracking-wider animate-pulse">
                {lang === "es" ? "Subasta Activa" : "Live Auction"}
              </div>
            </div>

            {/* Ficha de Especificaciones Técnicas */}
            <div className="bg-brand-surface border border-slate-800/80 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider font-mono border-b border-slate-800 pb-2">
                {lang === "es" ? "Especificaciones Técnicas" : "Technical Specifications"}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div>
                  <span className="text-xs text-brand-muted uppercase block font-mono">{lang === "es" ? "Color" : "Color"}</span>
                  <span className="text-sm font-semibold">{mockCar.color}</span>
                </div>
                <div>
                  <span className="text-xs text-brand-muted uppercase block font-mono">{lang === "es" ? "Kilometraje" : "Mileage"}</span>
                  <span className="text-sm font-semibold">{mockCar.mileage}</span>
                </div>
                <div>
                  <span className="text-xs text-brand-muted uppercase block font-mono">{lang === "es" ? "Motor" : "Engine"}</span>
                  <span className="text-sm font-semibold">{mockCar.engine}</span>
                </div>
                <div>
                  <span className="text-xs text-brand-muted uppercase block font-mono">{lang === "es" ? "Transmisión" : "Transmission"}</span>
                  <span className="text-sm font-semibold">{mockCar.transmission}</span>
                </div>
                <div>
                  <span className="text-xs text-brand-muted uppercase block font-mono">{lang === "es" ? "Año" : "Year"}</span>
                  <span className="text-sm font-semibold">{mockCar.year}</span>
                </div>
                <div>
                  <span className="text-xs text-brand-muted uppercase block font-mono">ID</span>
                  <span className="text-sm font-mono text-brand-accent">{mockCar.id}</span>
                </div>
              </div>
            </div>

            {/* Panel de Sanitización Demostrativo (Laboratorio de Seguridad) */}
            <div className="bg-slate-950/80 border-2 border-dashed border-red-900/60 rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-900 pb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
                <h3 className="text-base font-black text-red-500 tracking-wider uppercase font-mono">
                  {lang === "es" ? "Laboratorio de Mitigación XSS (OWASP A03:2021)" : "XSS Mitigation Lab (OWASP A03:2021)"}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lado A: Payload Entrada Maliciosa Cruda */}
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-red-400 block uppercase">
                    [❌] {lang === "es" ? "Payload Malicioso de Entrada" : "Raw Malicious Input"}
                  </span>
                  <pre className="text-[10px] leading-relaxed p-4 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto text-red-200 font-mono select-all h-60">
                    {simulatedMaliciousPayload.trim()}
                  </pre>
                </div>

                {/* Lado B: Renderizado Sanitizado Seguro */}
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 block uppercase">
                    [🛡️] {lang === "es" ? "Resultado Sanitizado (SafeHtmlRenderer)" : "Sanitized Output (SafeHtmlRenderer)"}
                  </span>
                  <div className="p-4 bg-brand-surface border border-slate-800 rounded-xl text-sm leading-relaxed h-60 overflow-y-auto">
                    <SafeHtmlRenderer htmlContent={simulatedMaliciousPayload} className="prose prose-invert prose-emerald max-w-none" />
                  </div>
                </div>
              </div>

              <div className="text-xs bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-brand-muted">
                <strong>{lang === "es" ? "Nota de Seguridad:" : "Security Note:"}</strong>{" "}
                {lang === "es"
                  ? "DOMPurify ha removido quirúrgicamente la etiqueta <script>, ha bloqueado la inyección de javascript en el href del enlace, y ha desarmado el evento onerror de la imagen. La UI renderiza el contenido enriquecido legítimo sin comprometer la seguridad del usuario final."
                  : "DOMPurify has surgically removed the <script> tag, blocked the javascript scheme execution in the link href, and disarmed the image onerror payload. The UI displays the rich text layout safely."}
              </div>
            </div>

          </div>

          {/* Columna Derecha: Tarjeta de Puja Activa */}
          <div className="lg:col-span-4 space-y-6">
            <LiveAuctionCard
              auctionId={mockCar.id}
              initialPrice={mockCar.currentBid}
              initialBidderName={dict.liveAuction.noOffers || "Sin ofertas"}
              currency="USD"
              vehicleName={mockCar.title}
              dict={dict}
            />

            <div className="bg-brand-surface/40 border border-slate-800 rounded-2xl p-6 space-y-3">
              <span className="text-xs font-mono font-bold text-white uppercase block">🛡️ {lang === "es" ? "Portales Seguros AutoPulse" : "AutoPulse Security Portal"}</span>
              <p className="text-xs text-brand-muted leading-relaxed">
                {lang === "es"
                  ? "Esta página cuenta con protección de X-Frame-Options: DENY contra secuestros de click (Clickjacking) y CSP estricta perimetral para neutralizar la inyección de código de terceros."
                  : "This portal enforces strict X-Frame-Options: DENY to protect against Clickjacking attacks, and strict perimeter CSP to neutralize remote code injections."}
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
