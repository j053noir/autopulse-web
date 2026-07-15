"use client";

import React from "react";
import { Button } from "./button";

export interface AuctionListItemProps {
  id: string;
  title: string;
  currentBid: number;
  endTime: string;
  imageUrl: string;
  onBid: (id: string) => void;
  dict: {
    ends: string;
    lastBid: string;
    bidButton: string;
  };
}

// Memoized Auction Row component to avoid re-renders during virtualization/scrolls
export const AuctionListItem: React.FC<AuctionListItemProps> = React.memo(
  ({ id, title, currentBid, endTime, imageUrl, onBid, dict }) => {
    const formattedEndTime = new Date(endTime).toLocaleDateString();

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-brand-surface border border-slate-800 rounded-lg hover:border-brand-accent/50 transition-all duration-300 gap-4 w-full h-[120px] box-border">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="h-16 w-24 rounded overflow-hidden bg-slate-900 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-white truncate">{title}</h3>
            <p className="text-xs text-brand-muted mt-1">
              {dict.ends}: {formattedEndTime}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 justify-between sm:justify-end w-full sm:w-auto">
          <div className="text-right">
            <span className="block text-[10px] text-brand-muted uppercase font-bold tracking-wider">
              {dict.lastBid}
            </span>
            <span className="text-brand-accent font-extrabold text-lg">
              ${currentBid.toLocaleString()}
            </span>
          </div>

          <Button
            size="sm"
            variant="primary"
            className="hover:scale-105 transition-transform duration-200"
            onClick={() => onBid(id)}
          >
            {dict.bidButton}
          </Button>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if the ID, title, current bid, end time, image, or dict translations changed
    return (
      prevProps.id === nextProps.id &&
      prevProps.title === nextProps.title &&
      prevProps.currentBid === nextProps.currentBid &&
      prevProps.endTime === nextProps.endTime &&
      prevProps.imageUrl === nextProps.imageUrl &&
      prevProps.dict.ends === nextProps.dict.ends &&
      prevProps.dict.lastBid === nextProps.dict.lastBid &&
      prevProps.dict.bidButton === nextProps.dict.bidButton
    );
  }
);

AuctionListItem.displayName = "AuctionListItem";
