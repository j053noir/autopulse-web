"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Auction } from "@/types";

export function useAuctionQuery(id: string) {
  const {
    data: auction,
    isLoading,
    isError,
    refetch,
    error,
  } = useQuery<Auction, Error>({
    queryKey: ["auction", id],
    queryFn: () => api.auctions.getById(id),
    enabled: !!id,
  });

  return {
    auction,
    isLoading,
    isError,
    error,
    refetch,
  };
}
