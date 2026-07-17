"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCarImages, CarsXEImageParams } from "@/services/carsxe";

// 1 month in milliseconds (30 days)
const DEV_CACHE_DURATION = 1000 * 60 * 60 * 24 * 30;

// Standard cache duration for production (24 hours)
const PROD_CACHE_DURATION = 1000 * 60 * 60 * 24;

export function useCarsXEImages(params: CarsXEImageParams, enabled = true) {
  const isDev = process.env.NODE_ENV === "development";
  const cacheTime = isDev ? DEV_CACHE_DURATION : PROD_CACHE_DURATION;

  console.log("retrieving images from Cars XE for: ", params);

  return useQuery({
    queryKey: ["carsxe", "images", params],
    queryFn: () => fetchCarImages(params),
    staleTime: cacheTime,
    gcTime: cacheTime,
    enabled: enabled && !!params.make && !!params.model,
  });
}
