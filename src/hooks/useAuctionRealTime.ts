"use client";

import { useEffect, useState } from "react";
import { HubConnection, HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { Auction } from "@/types";

interface UseAuctionRealTimeProps {
  auctionId: string;
}

export function useAuctionRealTime({ auctionId }: UseAuctionRealTimeProps) {
  const queryClient = useQueryClient();
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!auctionId) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const hubUrl = `${baseUrl}/hubs/auctions`;

    const newConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        withCredentials: true,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          const delays = [2000, 5000, 10000, 30000];
          return delays[retryContext.previousRetryCount] ?? null;
        },
      })
      .build();

    setConnection(newConnection);

    // Estrategia de Mutación Directa de la Caché (Cero-Latencia)
    newConnection.on("OnBidPlaced", (receivedAuctionId: string, newPrice: number, bidderName: string) => {
      if (receivedAuctionId === auctionId) {
        queryClient.setQueryData<Auction>(["auction", auctionId], (old) => {
          if (!old) return old;
          return {
            ...old,
            currentBid: newPrice,
            lastBidderName: bidderName,
          };
        });
      }
    });

    newConnection.on("OnAuctionEnded", (receivedAuctionId: string, winnerName: string) => {
      if (receivedAuctionId === auctionId) {
        queryClient.setQueryData<Auction>(["auction", auctionId], (old) => {
          if (!old) return old;
          return {
            ...old,
            lastBidderName: winnerName,
          };
        });
      }
    });

    // Resiliencia de Red: Invalida y sincroniza con PostgreSQL al reconectar
    newConnection.onreconnected(() => {
      setIsConnected(true);
      setError(null);
      console.log(`[SignalR] Conexión restablecida. Sincronizando caché de la subasta ${auctionId}...`);
      queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
      queryClient.invalidateQueries({ queryKey: ["auctions", "active"] });
    });

    newConnection.onreconnecting((err) => {
      setIsConnected(false);
      console.warn("[SignalR] Conexión perdida. Intentando reconectar...", err);
    });

    newConnection.onclose((err) => {
      setIsConnected(false);
      if (err) {
        console.error("[SignalR] Conexión cerrada con error:", err);
        setError(err);
      }
    });

    async function startConnection() {
      try {
        await newConnection.start();
        setIsConnected(true);
        setError(null);
        console.log(`[SignalR] Conectado exitosamente.`);
        await newConnection.invoke("JoinAuctionRoom", auctionId);
      } catch (err) {
        console.error("[SignalR] Error al conectar o unirse al Hub:", err);
        setError(err instanceof Error ? err : new Error("SignalR connection error"));
      }
    }

    startConnection();

    // Limpieza absoluta contra Memory Leaks
    return () => {
      setIsConnected(false);
      const cleanUp = async () => {
        if (newConnection.state === HubConnectionState.Connected) {
          try {
            await newConnection.invoke("LeaveAuctionRoom", auctionId);
          } catch (err) {
            console.error("[SignalR] Error al salir de la sala de subasta:", err);
          }
        }
        try {
          await newConnection.stop();
          console.log("[SignalR] Conexión WebSocket cerrada limpiamente.");
        } catch (err) {
          console.error("[SignalR] Error al detener SignalR:", err);
        }
      };
      cleanUp();
    };
  }, [auctionId, queryClient]);

  return {
    connection,
    isConnected,
    error,
  };
}
