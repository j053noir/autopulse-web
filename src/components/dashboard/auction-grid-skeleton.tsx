import React from "react";
import { Card } from "@/components/ui/card";

export function AuctionGridSkeleton() {
  // Generamos un array ficticio de 6 elementos para renderizar los esqueletos en el grid
  const skeletonCards = Array.from({ length: 6 });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {skeletonCards.map((_, idx) => (
        <Card key={idx} className="flex flex-col h-full animate-pulse border-gray-800/60">
          {/* Simulación de la Imagen del Vehículo */}
          <div className="w-full h-48 bg-slate-800" />

          {/* Contenido de la Tarjeta */}
          <Card.Content className="flex-1 flex flex-col gap-4">
            {/* Título de la subasta */}
            <div className="h-6 w-3/4 bg-slate-700 rounded-md" />

            {/* Descripción (2 líneas) */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-800 rounded-md" />
              <div className="h-4 w-5/6 bg-slate-800 rounded-md" />
            </div>

            {/* Divisor */}
            <div className="border-t border-gray-800/80 my-1" />

            {/* Info de Precios y Tiempo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-3 w-16 bg-slate-800 rounded-sm" />
                <div className="h-5 w-24 bg-slate-700 rounded-md" />
              </div>
              <div className="space-y-2 flex flex-col items-end">
                <div className="h-3 w-16 bg-slate-800 rounded-sm" />
                <div className="h-5 w-20 bg-slate-700 rounded-md" />
              </div>
            </div>
          </Card.Content>

          {/* Botón de Puja Simulado */}
          <Card.Footer className="bg-black/15">
            <div className="h-10 w-full bg-slate-800 rounded-lg" />
          </Card.Footer>
        </Card>
      ))}
    </div>
  );
}
