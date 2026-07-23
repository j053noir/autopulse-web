"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { UserBid } from "@/types";
import { useAuth } from "@/hooks/useAuth";

export function useMyBidsQuery() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const {
    data: bids = [],
    isLoading: isQueryLoading,
    isError,
    refetch,
    error,
  } = useQuery<UserBid[], Error>({
    queryKey: ["auctions", "my-bids"],
    queryFn: () => api.auctions.getMyBids(),
    enabled: isAuthenticated,
    staleTime: 0,
  });

  return {
    bids,
    isLoading: isQueryLoading || isAuthLoading,
    isError: isAuthenticated ? isError : false,
    error,
    refetch,
  };
}
