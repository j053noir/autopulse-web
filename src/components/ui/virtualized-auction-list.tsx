"use client";

import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Auction } from "@/types";
import { AuctionListItem } from "./auction-list-item";

interface VirtualizedAuctionListProps {
  auctions: Auction[];
  onBid: (id: string) => void;
  dict: any;
}

export const VirtualizedAuctionList: React.FC<VirtualizedAuctionListProps> = ({
  auctions,
  onBid,
  dict,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // TanStack Virtualizer configuration
  const rowVirtualizer = useVirtualizer({
    count: auctions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // matching the item height of 120px
    overscan: 5, // overscan of 5 elements to ensure smooth scroll
  });

  return (
    <div
      ref={parentRef}
      className="w-full h-[600px] overflow-auto border border-slate-800 rounded-xl bg-brand-dark/50 p-2 scrollbar-thin scrollbar-thumb-slate-800"
    >
      <div
        className="w-full relative"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const auction = auctions[virtualRow.index];
          if (!auction) return null;

          return (
            <div
              key={virtualRow.key}
              className="absolute top-0 left-0 w-full"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                paddingBottom: "8px", // spacing between rows
              }}
            >
              <AuctionListItem
                id={auction.id}
                title={auction.title}
                currentBid={auction.currentBid}
                endTime={auction.endTime}
                imageUrl={auction.imageUrl}
                onBid={onBid}
                dict={dict.item}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

VirtualizedAuctionList.displayName = "VirtualizedAuctionList";
