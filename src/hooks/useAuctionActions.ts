"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { api } from "@/services/api";

import { useParams } from "next/navigation";
import en from "@/../dictionaries/en.json";
import es from "@/../dictionaries/es.json";

const dictionaries = { en, es };

export function useAuctionActions() {
  const queryClient = useQueryClient();
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const dict = dictionaries[lang as "en" | "es"] || dictionaries.en;

  const bidMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const idempotencyKey = typeof window !== "undefined" ? window.crypto.randomUUID() : "server-side-key";
      return api.auctions.placeBid(id, {
        amount,
        idempotencyKey,
      });
    },
    onSuccess: () => {
      // Invalidate the auctions query to trigger background refetch
      queryClient.invalidateQueries({ queryKey: ["auctions", "active"] });
      if (typeof window !== "undefined") {
        alert(dict.auctions.bidSuccess);
      }
    },
    onError: (error: any) => {
      if (typeof window !== "undefined") {
        let msg = error.message;

        // Custom translations for auth status codes or backend errors
        if (msg.includes("HTTP 401") || msg.includes("Unauthorized")) {
          msg = dict.auctions.errors.unauthorized;
        } else if (msg.includes("HTTP 403") || msg.includes("Forbidden")) {
          msg = dict.auctions.errors.forbidden;
        } else {
          // Translate common backend domain error messages
          if (msg.includes("higher than the current price")) {
            msg = dict.auctions.errors.higherPrice;
          } else if (msg.includes("closed or expired")) {
            msg = dict.auctions.errors.closedOrExpired;
          } else {
            msg = `${dict.auctions.errors.generic} (${msg})`;
          }
        }

        alert(`${dict.auctions.errors.prefix}: ${msg}`);
      }
    },
  });

  // Strict useCallback wrapping to guarantee stable references and preserve React.memo benefits
  const placeBid = useCallback(
    (id: string, amount: number) => {
      bidMutation.mutate({ id, amount });
    },
    [bidMutation]
  );

  return {
    placeBid,
    isBidding: bidMutation.isPending,
    error: bidMutation.error,
  };
}
