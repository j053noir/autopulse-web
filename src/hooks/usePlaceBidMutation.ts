"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Auction } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useParams } from "next/navigation";
import en from "@/../dictionaries/en.json";
import es from "@/../dictionaries/es.json";

const dictionaries = { en, es };

interface PlaceBidParams {
  auctionId: string;
  amount: number;
  currency: string;
}

export function usePlaceBidMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const dict = dictionaries[lang as "en" | "es"] || dictionaries.en;

  return useMutation({
    mutationFn: async ({ auctionId, amount, currency }: PlaceBidParams) => {
      const idempotencyKey = typeof window !== "undefined" ? window.crypto.randomUUID() : "server-side-key";
      return api.auctions.placeBid(auctionId, {
        amount,
        currency,
        idempotencyKey,
      });
    },
    // Paso 1: onMutate - Cancelar queries salientes y realizar la actualización optimista
    onMutate: async ({ auctionId, amount }) => {
      // Cancelar cualquier refetch en curso para que no sobrescriba nuestro estado optimista
      await queryClient.cancelQueries({ queryKey: ["auction", auctionId] });

      // Capturar el snapshot del estado previo
      const previousAuction = queryClient.getQueryData<Auction>(["auction", auctionId]);

      // Actualizar el cache de forma optimista con el nuevo precio y postor
      if (previousAuction) {
        queryClient.setQueryData<Auction>(["auction", auctionId], {
          ...previousAuction,
          currentBid: amount,
          lastBidderName: user?.userName || (lang === "es" ? "Tú (optimista)" : "You (optimistic)"),
        });
      }

      // Retornar el contexto con el snapshot previo para el rollback defensivo
      return { previousAuction, auctionId };
    },
    // Paso 2: onError - Ejecutar rollback restaurando el snapshot previo
    onError: (error: any, _variables, context) => {
      if (context?.previousAuction) {
        queryClient.setQueryData(
          ["auction", context.auctionId],
          context.previousAuction
        );
      }

      // Notificación de error localizada para mejorar UX
      if (typeof window !== "undefined") {
        let msg = error.message || "";
        const tAuctions = dict.auctions || {};

        if (msg.includes("HTTP 401") || msg.includes("Unauthorized")) {
          msg = tAuctions.errors?.unauthorized || "Inicia sesión para pujar";
        } else if (msg.includes("HTTP 403") || msg.includes("Forbidden")) {
          msg = tAuctions.errors?.forbidden || "No tienes permiso para pujar";
        } else if (msg.includes("higher than the current price")) {
          msg = tAuctions.errors?.higherPrice || "La puja debe ser mayor al precio actual";
        } else if (msg.includes("closed or expired")) {
          msg = tAuctions.errors?.closedOrExpired || "La subasta está cerrada";
        } else {
          msg = `${tAuctions.errors?.generic || "Error al enviar la puja"} (${msg})`;
        }

        alert(`${tAuctions.errors?.prefix || "Error"}: ${msg}`);
      }
    },
    // Paso 3: onSettled - Invalidar queries para sincronizar con PostgreSQL
    onSettled: (_data, _error, variables) => {
      const id = variables.auctionId;
      queryClient.invalidateQueries({ queryKey: ["auction", id] });
      queryClient.invalidateQueries({ queryKey: ["auctions", "active"] });
    },
  });
}
