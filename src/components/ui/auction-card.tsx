"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SafeDateRenderer } from "@/components/ui/safe-date-renderer";
import { Auction } from "@/types";
import { useCarsXEImages } from "@/hooks/useCarsXEImages";
import { useUIStore } from "@/hooks/useUIStore";

interface AuctionCardProps {
  auction: Auction;
  theme?: "light" | "dark";
  lang: string;
  onBidClick?: (id: string) => void;
}

export function AuctionCard({ auction, theme: propTheme, lang, onBidClick }: AuctionCardProps) {
  const theme = useUIStore((state) => state.theme);
  // Parse the title which is formatted as "Year Make Model" (e.g. "2019 Jaguar F-Pace")
  const titleParts = auction.title.split(" ");
  const hasYear = titleParts.length > 0 && /^\d{4}$/.test(titleParts[0]);
  const carYear = hasYear ? titleParts[0] : undefined;
  const carMake = hasYear ? titleParts[1] : titleParts[0];
  const carModel = hasYear ? titleParts.slice(2).join(" ") : titleParts.slice(1).join(" ");

  console.log("titleParts: ", titleParts);
  console.log("hasYear: ", hasYear);
  console.log("carYear: ", carYear);
  console.log("carMake: ", carMake);
  console.log("carModel: ", carModel);

  // Call the query hook to resolve the image from CarsXE API
  const { data: carsxeData } = useCarsXEImages(
    {
      make: carMake || "",
      model: carModel || "",
      year: carYear,
    },
    !!carMake && !!carModel
  );

  // Fallback chain: CarsXE image -> Backend default image placeholder
  const carsxeImage = carsxeData?.images?.[0]?.link;
  const displayImageUrl = carsxeImage || auction.imageUrl || "/placeholder-car.jpg";

  return (
    <Card
      className={`flex flex-col h-full transition-all hover:shadow-2xl hover:shadow-brand-accent/5 hover:-translate-y-1 duration-300 ${theme === "dark"
          ? "bg-brand-surface border-gray-800 text-white"
          : "bg-white border-slate-200 text-slate-900"
        }`}
    >
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayImageUrl}
          alt={auction.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 right-3 bg-brand-accent text-white text-xs font-bold px-2 py-1 rounded shadow-md">
          {lang === "es" ? "EN VIVO" : "LIVE"}
        </div>
      </div>

      <Card.Header className={theme === "light" ? "border-slate-100" : ""}>
        <h3 className="text-lg font-bold line-clamp-1">{auction.title}</h3>
      </Card.Header>

      <Card.Content className="flex-1 flex flex-col gap-4">
        <p
          className={`text-sm line-clamp-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
        >
          {auction.description}
        </p>

        <div className="border-t border-gray-800/80 my-1" />

        <div
          className={`flex justify-between items-center text-sm p-3 rounded-lg border ${theme === "dark"
              ? "bg-black/20 border-gray-800"
              : "bg-slate-100/50 border-slate-200"
            }`}
        >
          <div>
            <span className="block text-xs font-medium text-gray-500">
              {lang === "es" ? "Oferta Inicial" : "Base Price"}
            </span>
            <span className="font-bold">${auction.basePrice.toLocaleString()}</span>
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

      <Card.Footer
        className={`flex items-center justify-between ${theme === "light" ? "border-slate-100 bg-slate-50/50" : ""
          }`}
      >
        <span className="text-xs text-gray-500">
          {lang === "es" ? "Termina: " : "Ends: "}
          <SafeDateRenderer dateString={auction.endTime} className="inline text-gray-500" />
        </span>
        <Link href={`/${lang}/auctions/${auction.id}`}>
          <Button size="sm" variant="primary" onClick={() => onBidClick?.(auction.id)}>
            {lang === "es" ? "Ofertar Ahora" : "Bid Now"}
          </Button>
        </Link>
      </Card.Footer>
    </Card>
  );
}
