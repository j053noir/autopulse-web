import React from "react";
import { CreateAuctionForm } from "@/components/forms/create-auction-form";
import { getDictionary, Locale } from "@/dictionaries";
import Link from "next/link";

interface CreateAuctionPageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function CreateAuctionPage({ params }: CreateAuctionPageProps) {
  const { lang } = await params;
  const dict = (await getDictionary(lang as Locale)) as any;

  const t = dict?.createAuctionPage || {
    title: "Publicar Nueva Subasta",
    subtitle: "Completa los datos técnicos del vehículo y carga su documentación oficial para iniciar la subasta.",
    back: "Volver a Subastas",
  };

  return (
    <main className="min-h-screen bg-brand-dark text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/${lang}/auctions`}
            className="text-sm font-semibold text-brand-muted hover:text-brand-accent transition-colors flex items-center gap-2"
          >
            ← {t.back}
          </Link>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-2 text-sm text-brand-muted">
            {t.subtitle}
          </p>
        </div>

        <div className="bg-brand-surface border border-slate-800 rounded-xl p-6 sm:p-10 shadow-2xl">
          <CreateAuctionForm dict={dict} />
        </div>
      </div>
    </main>
  );
}
