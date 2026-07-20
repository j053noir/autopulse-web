import { useEffect, useRef, useState } from "react";
import { HubConnection, HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";

interface UseAuctionHubProps {
  auctionId: string;
  onBidPlaced: (newPrice: number, bidderName: string) => void;
  onAuctionEnded: (winnerName: string) => void;
}

export function useAuctionHub({
  auctionId,
  onBidPlaced,
  onAuctionEnded,
}: UseAuctionHubProps) {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Guardar callbacks en refs para evitar reconstruir la conexión o disparar efectos cuando cambien
  const onBidPlacedRef = useRef(onBidPlaced);
  const onAuctionEndedRef = useRef(onAuctionEnded);

  useEffect(() => {
    onBidPlacedRef.current = onBidPlaced;
  }, [onBidPlaced]);

  useEffect(() => {
    onAuctionEndedRef.current = onAuctionEnded;
  }, [onAuctionEnded]);

  useEffect(() => {
    if (!auctionId) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const hubUrl = `${baseUrl}/hubs/auctions`;

    // Construir la conexión del Hub de SignalR
    const newConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        withCredentials: true,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Reintentos progresivos: 2s, 5s, 10s, 30s
          const delays = [2000, 5000, 10000, 30000];
          return delays[retryContext.previousRetryCount] ?? null; // null detiene los reintentos
        },
      })
      .build();

    setConnection(newConnection);

    // Registrar escuchadores de eventos
    newConnection.on("OnBidPlaced", (auctionId: string, newPrice: number, bidderName: string) => {
      onBidPlacedRef.current(newPrice, bidderName);
    });

    newConnection.on("OnAuctionEnded", (auctionId: string, winnerName: string) => {
      onAuctionEndedRef.current(winnerName);
    });

    // Iniciar conexión y unirse a la sala
    async function startConnection() {
      try {
        await newConnection.start();
        setIsConnected(true);
        setError(null);
        console.log(`[SignalR] Conectado exitosamente al hub de subastas.`);
        
        // Unirse a la sala de la subasta específica
        await newConnection.invoke("JoinAuctionRoom", auctionId);
        console.log(`[SignalR] Unido a la sala de subasta: ${auctionId}`);
      } catch (err) {
        console.error("[SignalR] Error al conectar o unirse al Hub:", err);
        setError(err instanceof Error ? err : new Error("Unknown SignalR error"));
      }
    }

    startConnection();

    // Limpieza defensiva contra fugas de memoria y sockets fantasmas
    return () => {
      setIsConnected(false);
      
      const cleanUp = async () => {
        if (newConnection.state === HubConnectionState.Connected) {
          try {
            // Invocar método en el servidor para notificar la salida
            await newConnection.invoke("LeaveAuctionRoom", auctionId);
            console.log(`[SignalR] Saliendo de la sala de subasta: ${auctionId}`);
          } catch (err) {
            console.error("[SignalR] Error al invocar LeaveAuctionRoom:", err);
          }
        }
        
        try {
          await newConnection.stop();
          console.log("[SignalR] Conexión detenida limpiamente.");
        } catch (err) {
          console.error("[SignalR] Error al detener la conexión de SignalR:", err);
        }
      };

      cleanUp();
    };
  }, [auctionId]);

  return {
    connection,
    isConnected,
    error,
  };
}
