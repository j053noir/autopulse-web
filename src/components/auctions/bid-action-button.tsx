"use client";

import React from "react";
import { usePlaceBidMutation } from "@/hooks/usePlaceBidMutation";

interface BidActionButtonProps {
  auctionId: string;
  amount: number;
  currency: string;
  label: string;
  disabled?: boolean;
  className?: string;
  onSuccess?: () => void;
}

export function BidActionButton({
  auctionId,
  amount,
  currency,
  label,
  disabled = false,
  className = "",
  onSuccess,
}: BidActionButtonProps) {
  const { mutate, isPending } = usePlaceBidMutation();

  const handleBidClick = () => {
    if (disabled || isPending) return;

    mutate(
      {
        auctionId,
        amount,
        currency,
      },
      {
        onSuccess: () => {
          if (onSuccess) {
            onSuccess();
          }
        },
      }
    );
  };

  return (
    <button
      type="button"
      onClick={handleBidClick}
      disabled={disabled || isPending}
      className={`relative w-full overflow-hidden rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-emerald-500 hover:shadow-lg focus:outline-hidden active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600 disabled:hover:shadow-md ${className}`}
    >
      <span className={`transition-all duration-200 ${isPending ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
        {label}
      </span>
      
      {isPending && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg
            className="h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
    </button>
  );
}
