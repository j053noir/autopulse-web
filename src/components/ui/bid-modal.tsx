"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "./modal";
import { Button } from "./button";

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  auction: { id: string; title: string; currentBid: number; currency: string } | null;
  onPlaceBid: (id: string, amount: number, currency: string) => void;
  isSubmitting: boolean;
  dict: any;
}

export function BidModal({
  isOpen,
  onClose,
  auction,
  onPlaceBid,
  isSubmitting,
  dict,
}: BidModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const currentBid = auction?.currentBid ?? 0;
  const currency = auction?.currency ?? "USD";
  const mDict = dict?.modals?.placeBid ?? {};

  // Reset input and error on open
  useEffect(() => {
    if (isOpen && auction) {
      // Suggest next logical bid (current + 500)
      setAmount((auction.currentBid + 500).toString());
      setError(null);
    }
  }, [isOpen, auction]);

  if (!auction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= currentBid) {
      setError(mDict.errorLabel || "Bid must be higher than the current bid");
      return;
    }

    setError(null);
    onPlaceBid(auction.id, parsedAmount, currency);
    onClose();
  };

  const handleAmountChange = (val: string) => {
    setAmount(val);
    if (error) setError(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mDict.title || "Place a Bid"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-brand-muted mb-1">
            {auction.title}
          </h3>
          <div className="flex items-baseline gap-2 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
            <span className="text-xs text-brand-muted uppercase font-bold tracking-wider">
              {mDict.currentBid || "Current Bid"}:
            </span>
            <span className="text-2xl font-black text-brand-accent">
              {currency} ${currentBid.toLocaleString()}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
            {mDict.yourBid || "Your Bid Amount"} ({currency})
          </label>
          <div className="relative rounded-lg shadow-sm">
            <input
              type="number"
              required
              min={currentBid + 1}
              step="any"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 p-3 text-white placeholder-slate-600 focus:border-brand-accent focus:outline-none text-lg font-bold"
              placeholder={mDict.placeholder || "Enter bid amount"}
            />
          </div>
          {error ? (
            <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>
          ) : (
            <p className="mt-2 text-xs text-brand-muted">
              {mDict.minAmount?.replace("{min}", `${currency} $${currentBid.toLocaleString()}`) ||
                `Must be greater than ${currency} $${currentBid.toLocaleString()}`}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            {dict?.modals?.close || "Close"}
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {mDict.submit || "Place Bid"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
