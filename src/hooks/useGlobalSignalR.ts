"use client";

import { useEffect } from "react";
import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import toast from "react-hot-toast";

export function useGlobalSignalR() {
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const hubUrl = `${baseUrl}/hubs/auctions`;

    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    // Listen for OnAuctionCreated event
    connection.on("OnAuctionCreated", (auctionId: string, title: string, basePrice: number) => {
      toast.success(
        `📢 Nueva Subasta Creada: "${title}" con precio base de $${basePrice.toLocaleString()}`,
        {
          duration: 6000,
          icon: "🚀",
        }
      );
    });

    async function start() {
      try {
        await connection.start();
        console.log("[SignalR Global] Conectado para recibir alertas de creación.");
      } catch (err) {
        console.error("[SignalR Global] Error al iniciar conexión global:", err);
      }
    }

    start();

    return () => {
      const stopConnection = async () => {
        if (connection.state === HubConnectionState.Connected) {
          try {
            await connection.stop();
            console.log("[SignalR Global] Conexión global detenida.");
          } catch (e) {
            console.error("[SignalR Global] Error al detener conexión:", e);
          }
        }
      };
      stopConnection();
    };
  }, []);
}
