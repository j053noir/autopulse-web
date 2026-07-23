"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useServiceWorkerAuth } from "@/hooks/useServiceWorkerAuth";
import { useAuth } from "@/hooks/useAuth";
import en from "../../../dictionaries/en.json";
import es from "../../../dictionaries/es.json";

export function SWAuthProvider({ children }: { children: React.ReactNode }) {
  // Registrar el Service Worker y obtener el helper de sincronización
  useServiceWorkerAuth();

  const { checkSession, isLoading } = useAuth();
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const dict = lang === "es" ? es : en;

  useEffect(() => {
    // Intento Silencioso de Refresco al arrancar en el navegador
    checkSession();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090d16] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-accent border-t-transparent"></div>
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-500">
            {dict.auth.establishingConnection}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
