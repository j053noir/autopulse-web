"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Auction } from "@/types";
import { useAuth } from "@/hooks/useAuth";

export function useAuctionsQuery() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const {
    data: auctions = [],
    isLoading: isQueryLoading,
    isError,
    refetch,
    error,
  } = useQuery<Auction[], Error>({
    queryKey: ["auctions", "active"],
    queryFn: () => api.auctions.getActive(),
    enabled: isAuthenticated,
  });

  return {
    auctions,
    isLoading: isQueryLoading || isAuthLoading,
    isError: isAuthenticated ? isError : false,
    error,
    refetch,
  };
}
