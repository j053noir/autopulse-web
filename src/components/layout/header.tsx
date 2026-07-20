"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/hooks/useUIStore";
import { useAuctionActions } from "@/hooks/useAuctionActions";
import { CreateAuctionModal } from "@/components/ui/create-auction-modal";
import { Button } from "@/components/ui/button";
import en from "@/../dictionaries/en.json";
import es from "@/../dictionaries/es.json";

const dictionaries = { en, es };

export function Header() {
  const { user, logout } = useAuth();
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const dict = dictionaries[lang as "en" | "es"] || dictionaries.en;
  
  const isCreateAuctionOpen = useUIStore((state) => state.isCreateAuctionOpen);
  const setCreateAuctionOpen = useUIStore((state) => state.setCreateAuctionOpen);
  const { createAuction, isCreating } = useAuctionActions();

  return (
    <header className="w-full bg-brand-dark/90 backdrop-blur-md border-b border-gray-800/80 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Branding */}
        <Link href={`/${lang}`} className="flex items-center gap-2 group">
          <span className="text-2xl font-black tracking-wider text-white">
            AUTO<span className="text-brand-accent transition-colors group-hover:text-red-500">PULSE</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href={`/${lang}`} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            {lang === "es" ? "Inicio" : "Home"}
          </Link>
          <Link href={`/${lang}/auctions`} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            {lang === "es" ? "Panel Virtual" : "Virtualized Panel"}
          </Link>
          {user?.permissions?.includes("auctions:create") && (
            <button
              onClick={() => setCreateAuctionOpen(true)}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
            >
              {lang === "es" ? "Crear Subasta" : "Create Auction"}
            </button>
          )}
          <Link href={`/${lang}`} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            {lang === "es" ? "Historial" : "History"}
          </Link>
        </nav>

        {/* User / Authentication actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-brand-accent flex items-center justify-center font-bold text-sm text-white select-none">
                  {user.userName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-gray-200">
                  {user.userName}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                {lang === "es" ? "Salir" : "Logout"}
              </Button>
            </div>
          ) : (
            <Link href={`/${lang}/auth/login`}>
              <Button variant="primary" size="sm">
                {lang === "es" ? "Iniciar Sesión" : "Login"}
              </Button>
            </Link>
          )}
        </div>
      </div>

      <CreateAuctionModal
        isOpen={isCreateAuctionOpen}
        onClose={() => setCreateAuctionOpen(false)}
        onCreateAuction={createAuction}
        isSubmitting={isCreating}
        dict={dict}
      />
    </header>
  );
}
