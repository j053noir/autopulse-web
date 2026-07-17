"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { CreateAuctionCommand } from "@/types";

interface CreateAuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAuction: (command: Omit<CreateAuctionCommand, "idempotencyKey">) => Promise<any>;
  isSubmitting: boolean;
  dict: any;
}

export function CreateAuctionModal({
  isOpen,
  onClose,
  onCreateAuction,
  isSubmitting,
  dict,
}: CreateAuctionModalProps) {
  const [vin, setVin] = useState("");
  const [marquee, setMarquee] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [mileage, setMileage] = useState(0);
  const [startingPrice, setStartingPrice] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [endTime, setEndTime] = useState("");

  const mDict = dict?.modals?.createAuction ?? {};

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setVin("");
      setMarquee("");
      setModel("");
      setYear(new Date().getFullYear());
      setMileage(0);
      setStartingPrice(0);
      setCurrency("USD");
      
      // Default to 7 days from now
      const defaultEndDate = new Date();
      defaultEndDate.setDate(defaultEndDate.getDate() + 7);
      // Format as YYYY-MM-DDTHH:MM for datetime-local
      const offset = defaultEndDate.getTimezoneOffset();
      const localDate = new Date(defaultEndDate.getTime() - (offset * 60 * 1000));
      setEndTime(localDate.toISOString().slice(0, 16));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formattedEndTime = new Date(endTime).toISOString();
      await onCreateAuction({
        vin,
        marquee,
        model,
        year: Number(year),
        mileage: Number(mileage),
        startingPrice: Number(startingPrice),
        currency,
        endTime: formattedEndTime,
      });
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mDict.title || "Create New Auction"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
              {mDict.vin || "VIN"}
            </label>
            <input
              type="text"
              required
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              placeholder="e.g. 1HGCR2F8XHA..."
              className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-sm text-white placeholder-slate-600 focus:border-brand-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
              {mDict.marquee || "Marque / Brand"}
            </label>
            <input
              type="text"
              required
              value={marquee}
              onChange={(e) => setMarquee(e.target.value)}
              placeholder="e.g. Honda"
              className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-sm text-white placeholder-slate-600 focus:border-brand-accent focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
              {mDict.model || "Model"}
            </label>
            <input
              type="text"
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. Accord"
              className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-sm text-white placeholder-slate-600 focus:border-brand-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
              {mDict.year || "Year"}
            </label>
            <input
              type="number"
              required
              min={1900}
              max={new Date().getFullYear() + 2}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-sm text-white focus:border-brand-accent focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
              {mDict.mileage || "Mileage (miles)"}
            </label>
            <input
              type="number"
              required
              min={0}
              value={mileage}
              onChange={(e) => setMileage(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-sm text-white focus:border-brand-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
              {mDict.startingPrice || "Starting Price"}
            </label>
            <input
              type="number"
              required
              min={1}
              value={startingPrice}
              onChange={(e) => setStartingPrice(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-sm text-white focus:border-brand-accent focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
              {mDict.currency || "Currency"}
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-sm text-white focus:border-brand-accent focus:outline-none cursor-pointer"
            >
              <option value="USD">USD ($)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="COP">COP (COL$)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
              {mDict.endTime || "End Date & Time"}
            </label>
            <input
              type="datetime-local"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-sm text-white focus:border-brand-accent focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            {dict?.modals?.close || "Close"}
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {mDict.submit || "Create Auction"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
