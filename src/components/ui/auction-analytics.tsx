"use client";

import { useParams } from "next/navigation";
import en from "@/../dictionaries/en.json";
import es from "@/../dictionaries/es.json";

const dictionaries = { en, es };

export default function AuctionAnalytics() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const dict = dictionaries[lang as "en" | "es"] || dictionaries.en;

  return (
    <div className="p-6 bg-brand-surface border border-slate-800 rounded-xl mb-8">
      <h3 className="text-lg font-bold text-white mb-4">{dict.analytics.title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-brand-dark/50 p-4 rounded-lg border border-slate-800">
          <span className="block text-xs text-brand-muted uppercase font-bold tracking-wider">{dict.analytics.bidActivity}</span>
          <span className="text-xl font-extrabold text-white">{dict.analytics.activityLevel}</span>
        </div>
        <div className="bg-brand-dark/50 p-4 rounded-lg border border-slate-800">
          <span className="block text-xs text-brand-muted uppercase font-bold tracking-wider">{dict.analytics.averageBid}</span>
          <span className="text-xl font-extrabold text-brand-accent">$34,800 USD</span>
        </div>
        <div className="bg-brand-dark/50 p-4 rounded-lg border border-slate-800">
          <span className="block text-xs text-brand-muted uppercase font-bold tracking-wider">{dict.analytics.participants}</span>
          <span className="text-xl font-extrabold text-white">{dict.analytics.activeCount}</span>
        </div>
      </div>
    </div>
  );
}
