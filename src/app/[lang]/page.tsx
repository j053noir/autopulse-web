import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { getDictionary, Locale } from "@/dictionaries";
import { Auction } from "@/types";

// Mock de subastas para el renderizado inicial y demostración funcional
const mockAuctions: Auction[] = [
  {
    id: "1",
    title: "Porsche 911 GT3 RS",
    description: "Modelo 2023 con paquete Weissach, solo 1,200 km. Estado impecable listo para pista.",
    basePrice: 220000,
    currentBid: 245000,
    endTime: "2026-07-20T23:59:59Z",
    imageUrl: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "2",
    title: "Ferrari F8 Tributo",
    description: "Motor V8 Twin-Turbo de 720 HP, color Rosso Corsa. Historial completo de mantenimiento.",
    basePrice: 280000,
    currentBid: 295000,
    endTime: "2026-07-22T18:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "3",
    title: "Lamborghini Huracán Evo",
    description: "Tracción integral, color Verde Mantis. Sistema de telemetría y elevación de eje delantero.",
    basePrice: 240000,
    currentBid: 255000,
    endTime: "2026-07-18T15:30:00Z",
    imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800",
  },
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <>
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-brand-dark">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
            {dict.home.title.split("AutoPulse")[0]}
            <span className="text-brand-accent">AutoPulse</span>
            {dict.home.title.split("AutoPulse")[1] || ""}
          </h1>
          <p className="text-lg text-gray-400">
            {dict.home.subtitle}
          </p>
        </div>

        {/* Dynamic Navigation & Tabs View */}
        <Tabs defaultValue="subastas" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="subastas">{dict.home.tabs.activeAuctions}</TabsTrigger>
              <TabsTrigger value="historial">{lang === "es" ? "Tus Ofertas" : "Your Bids"}</TabsTrigger>
              <TabsTrigger value="reglas">{dict.home.tabs.gameRules}</TabsTrigger>
            </TabsList>
          </div>

          {/* Active Auctions Grid */}
          <TabsContent value="subastas">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockAuctions.map((auction) => (
                <Card key={auction.id} className="flex flex-col h-full">
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={auction.imageUrl}
                      alt={auction.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 bg-brand-accent text-white text-xs font-bold px-2 py-1 rounded shadow-md">
                      {lang === "es" ? "EN VIVO" : "LIVE"}
                    </div>
                  </div>

                  <Card.Header>
                    <h3 className="text-lg font-bold text-white line-clamp-1">{auction.title}</h3>
                  </Card.Header>

                  <Card.Content className="flex-1">
                    <p className="text-sm text-gray-400 line-clamp-3 mb-4">{auction.description}</p>
                    <div className="flex justify-between items-center text-sm bg-black/20 p-3 rounded-lg border border-gray-800">
                      <div>
                        <span className="block text-xs text-gray-500 font-medium">
                          {lang === "es" ? "Oferta Inicial" : "Base Price"}
                        </span>
                        <span className="text-white font-bold">${auction.basePrice.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-xs text-brand-accent font-semibold">
                          {lang === "es" ? "Última Puja" : "Current Bid"}
                        </span>
                        <span className="text-brand-accent font-extrabold text-base">
                          ${auction.currentBid.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Card.Content>

                  <Card.Footer className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Termina: {new Date(auction.endTime).toLocaleDateString()}
                    </span>
                    <Button size="sm" variant="primary">
                      {lang === "es" ? "Ofertar Ahora" : "Bid Now"}
                    </Button>
                  </Card.Footer>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* User Active Bids (Empty state representation) */}
          <TabsContent value="historial">
            <Card className="max-w-md mx-auto text-center p-8 border border-gray-800 bg-brand-surface">
              <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-gray-500">📥</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {lang === "es" ? "Sin ofertas activas" : "No active bids"}
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                {lang === "es" 
                  ? "Aún no has realizado ninguna oferta. ¡Explora las subastas activas para comenzar!"
                  : "You haven't placed any bids yet. Explore active auctions to get started!"
                }
              </p>
              <Button variant="secondary">
                {lang === "es" ? "Ver Vehículos Disponibles" : "View Available Vehicles"}
              </Button>
            </Card>
          </TabsContent>

          {/* Game Rules / terms */}
          <TabsContent value="reglas" className="bg-brand-surface p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-bold text-white mb-3">{dict.home.tabs.portalTerms}</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              {dict.home.tabs.portalTermsDesc}
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-400 space-y-2">
              <li>{lang === "es" ? "Cada puja aumenta el precio mínimo establecido." : "Each bid increases the minimum price established."}</li>
              <li>{lang === "es" ? "Una vez realizada la oferta, esta no puede ser cancelada." : "Once placed, bids cannot be cancelled."}</li>
              <li>{lang === "es" ? "El postor más alto al finalizar el cronómetro se adjudica la subasta." : "The highest bidder at end of time wins the auction."}</li>
            </ul>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}