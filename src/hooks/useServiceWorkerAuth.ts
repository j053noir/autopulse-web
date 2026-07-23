"use client";

import { useEffect } from "react";

export const syncTokenWithWorker = (token: string | null) => {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    const controller = navigator.serviceWorker.controller;
    if (controller) {
      controller.postMessage({
        type: token ? "SET_TOKEN" : "CLEAR_TOKEN",
        token,
      });
    } else {
      // Fallback si el controlador no está activo todavía
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          registration.active.postMessage({
            type: token ? "SET_TOKEN" : "CLEAR_TOKEN",
            token,
          });
        }
      });
    }
  }
};

export const syncConfigWithWorker = (apiUrl: string) => {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    const controller = navigator.serviceWorker.controller;
    if (controller) {
      controller.postMessage({
        type: "INIT_CONFIG",
        apiUrl,
      });
    } else {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          registration.active.postMessage({
            type: "INIT_CONFIG",
            apiUrl,
          });
        }
      });
    }
  }
};

export function useServiceWorkerAuth() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("[Service Worker] Registered successfully. Scope:", registration.scope);
          
          // Propagar la variable de entorno NEXT_PUBLIC_API_URL dinámicamente al Service Worker
          const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          syncConfigWithWorker(`${backendUrl}/api`);
        })
        .catch((error) => {
          console.error("[Service Worker] Registration error:", error);
        });
    }
  }, []);

  return { syncTokenWithWorker };
}
