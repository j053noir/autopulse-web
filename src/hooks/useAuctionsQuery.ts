"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Auction } from "@/types";

export function useAuctionsQuery() {
  const {
    data: auctions = [],
    isLoading,
    isError,
    refetch,
    error,
  } = useQuery<Auction[], Error>({
    queryKey: ["auctions", "active"],
    queryFn: () => api.auctions.getActive(),
  });

  return {
    auctions,
    isLoading,
    isError,
    error,
    refetch,
  };
}
