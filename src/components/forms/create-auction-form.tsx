"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAuctionSchema, CreateAuctionInput, CATEGORIES, CURRENCIES } from "@/lib/schemas/auction.schema";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";

interface CreateAuctionFormProps {
  onSuccess?: (id: string) => void;
  dict?: any;
}

export function CreateAuctionForm({ onSuccess, dict }: CreateAuctionFormProps) {
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = dict?.createAuctionForm || {
    title: "Título de la Subasta",
    vin: "Número VIN (17 caracteres)",
    basePrice: "Precio Base",
    minimumBidIncrement: "Incremento Mínimo de Oferta",
    endTime: "Fecha de Finalización",
    category: "Categoría",
    document: "Documento del Vehículo (PDF, PNG, JPG - Max 5MB)",
    submit: "Crear Subasta",
    uploadingDoc: "Subiendo documento al storage...",
    creatingAuction: "Creando subasta en .NET...",
    docUploadSuccess: "✓ Documento subido y asociado con éxito.",
    docUploadError: "Error al subir el documento.",
    submitError: "Ocurrió un error al procesar el registro.",
    vinPlaceholder: "17 caracteres",
    titlePlaceholder: "ej. Mazda CX-5 Grand Touring 2022",
    currency: "Moneda"
  };

  const getErrorMessage = (errorObj: any) => {
    if (!errorObj || !errorObj.message) return "";
    const msg = errorObj.message;
    if (msg.startsWith("validation.")) {
      const key = msg.replace("validation.", "");
      return dict?.validation?.[key] || msg;
    }
    return msg;
  };

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<CreateAuctionInput>({
    resolver: zodResolver(createAuctionSchema),
    defaultValues: {
      title: "",
      vin: "",
      marquee: "",
      model: "",
      year: new Date().getFullYear(),
      mileage: 0,
      basePrice: 0,
      currency: "USD",
      minimumBidIncrement: 50,
      endTime: "",
      category: "Sedan",
      documentStorageKey: "",
    },
  });

  const documentStorageKey = watch("documentStorageKey");

  // Step 1: Upload file to storage on select/upload change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Set file in RHF for validation
    setValue("documentFile", file);
    setUploadState("uploading");
    setErrorMessage(null);

    try {
      // 1. Get pre-signed URL from .NET
      const { uploadUrl, storageKey } = await api.auctions.getUploadUrl(file.name, file.type);

      // 2. Direct upload to Azure Storage
      await api.auctions.uploadFileToStorage(uploadUrl, file);

      // 3. Keep storage key in form state
      setValue("documentStorageKey", storageKey);
      setUploadState("success");
    } catch (err: any) {
      console.error(err);
      setUploadState("error");
      setErrorMessage(err.message || t.docUploadError);
      setValue("documentStorageKey", "");
    }
  };

  // Step 2: Submit final form data
  const onSubmitForm = async (data: CreateAuctionInput) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const idempotencyKey = window.crypto.randomUUID();
      const command = {
        vin: data.vin,
        marquee: data.marquee,
        model: data.model,
        year: Number(data.year),
        mileage: Number(data.mileage),
        title: data.title,
        basePrice: data.basePrice,
        minimumBidIncrement: data.minimumBidIncrement,
        category: data.category,
        documentStorageKey: data.documentStorageKey,
        startingPrice: data.basePrice,
        currency: data.currency,
        endTime: new Date(data.endTime).toISOString(),
        idempotencyKey,
      };

      const result = await api.auctions.create(command);
      if (onSuccess) {
        onSuccess(result.id);
      }
    } catch (err: any) {
      console.error(err);
      
      // If there are structured validation errors from FluentValidation
      if (err.errors) {
        Object.keys(err.errors).forEach((key) => {
          // Normalize back-end key naming (e.g., Title -> title)
          const fieldName = (key.charAt(0).toLowerCase() + key.slice(1)) as keyof CreateAuctionInput;
          const messages = err.errors[key];
          if (fieldName && messages && messages.length > 0) {
            setError(fieldName, {
              type: "server",
              message: messages[0],
            });
          }
        });
      } else {
        setErrorMessage(err.message || t.submitError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {errorMessage && (
        <div className="p-4 rounded-lg bg-red-900/30 border border-red-800 text-red-400 text-sm">
          {errorMessage}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
          {t.title}
        </label>
        <input
          type="text"
          {...register("title")}
          className={`w-full rounded-lg border bg-brand-dark p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent ${
            errors.title ? "border-red-500" : "border-slate-800"
          }`}
          placeholder={t.titlePlaceholder}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-500">{getErrorMessage(errors.title)}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
            {t.vin}
          </label>
          <input
            type="text"
            {...register("vin")}
            onChange={(e) => {
              e.target.value = e.target.value.toUpperCase();
              register("vin").onChange(e);
            }}
            className={`w-full rounded-lg border bg-brand-dark p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent ${
              errors.vin ? "border-red-500" : "border-slate-800"
            }`}
            placeholder={t.vinPlaceholder}
          />
          {errors.vin && (
            <p className="mt-1 text-xs text-red-500">{getErrorMessage(errors.vin)}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
            {t.category}
          </label>
          <select
            {...register("category")}
            className="w-full rounded-lg border border-slate-800 bg-brand-dark p-3 text-sm text-white focus:outline-none focus:border-brand-accent cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-xs text-red-500">{getErrorMessage(errors.category)}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
            {t.marquee}
          </label>
          <input
            type="text"
            {...register("marquee")}
            className={`w-full rounded-lg border bg-brand-dark p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent ${
              errors.marquee ? "border-red-500" : "border-slate-800"
            }`}
            placeholder={t.marqueePlaceholder}
          />
          {errors.marquee && (
            <p className="mt-1 text-xs text-red-500">{getErrorMessage(errors.marquee)}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
            {t.model}
          </label>
          <input
            type="text"
            {...register("model")}
            className={`w-full rounded-lg border bg-brand-dark p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent ${
              errors.model ? "border-red-500" : "border-slate-800"
            }`}
            placeholder={t.modelPlaceholder}
          />
          {errors.model && (
            <p className="mt-1 text-xs text-red-500">{getErrorMessage(errors.model)}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
            {t.year}
          </label>
          <input
            type="number"
            {...register("year", { valueAsNumber: true })}
            className={`w-full rounded-lg border bg-brand-dark p-3 text-sm text-white focus:outline-none focus:border-brand-accent ${
              errors.year ? "border-red-500" : "border-slate-800"
            }`}
          />
          {errors.year && (
            <p className="mt-1 text-xs text-red-500">{getErrorMessage(errors.year)}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
            {t.mileage}
          </label>
          <input
            type="number"
            {...register("mileage", { valueAsNumber: true })}
            className={`w-full rounded-lg border bg-brand-dark p-3 text-sm text-white focus:outline-none focus:border-brand-accent ${
              errors.mileage ? "border-red-500" : "border-slate-800"
            }`}
          />
          {errors.mileage && (
            <p className="mt-1 text-xs text-red-500">{getErrorMessage(errors.mileage)}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
            {t.basePrice}
          </label>
          <input
            type="number"
            step="any"
            {...register("basePrice", { valueAsNumber: true })}
            className={`w-full rounded-lg border bg-brand-dark p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent ${
              errors.basePrice ? "border-red-500" : "border-slate-800"
            }`}
          />
          {errors.basePrice && (
            <p className="mt-1 text-xs text-red-500">{getErrorMessage(errors.basePrice)}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
            {t.minimumBidIncrement}
          </label>
          <input
            type="number"
            {...register("minimumBidIncrement", { valueAsNumber: true })}
            className={`w-full rounded-lg border bg-brand-dark p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-accent ${
              errors.minimumBidIncrement ? "border-red-500" : "border-slate-800"
            }`}
          />
          {errors.minimumBidIncrement && (
            <p className="mt-1 text-xs text-red-500">{getErrorMessage(errors.minimumBidIncrement)}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
            {t.currency}
          </label>
          <select
            {...register("currency")}
            className="w-full rounded-lg border border-slate-800 bg-brand-dark p-3 text-sm text-white focus:outline-none focus:border-brand-accent cursor-pointer"
          >
            {CURRENCIES.map((cur) => (
              <option key={cur} value={cur}>
                {cur}
              </option>
            ))}
          </select>
          {errors.currency && (
            <p className="mt-1 text-xs text-red-500">{getErrorMessage(errors.currency)}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
            {t.endTime}
          </label>
          <input
            type="datetime-local"
            {...register("endTime")}
            className={`w-full rounded-lg border bg-brand-dark p-3 text-sm text-white focus:outline-none focus:border-brand-accent cursor-pointer ${
              errors.endTime ? "border-red-500" : "border-slate-800"
            }`}
          />
          {errors.endTime && (
            <p className="mt-1 text-xs text-red-500">{getErrorMessage(errors.endTime)}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
          {t.document}
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          className={`w-full rounded-lg border bg-brand-dark p-2 text-sm text-white file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-surface file:text-white file:cursor-pointer ${
            errors.documentStorageKey ? "border-red-500" : "border-slate-800"
          }`}
          accept=".pdf,image/png,image/jpeg,image/jpg"
        />
        {uploadState === "uploading" && (
          <p className="mt-1 text-xs text-brand-accent animate-pulse">{t.uploadingDoc}</p>
        )}
        {uploadState === "success" && (
          <p className="mt-1 text-xs text-green-500">{t.docUploadSuccess}</p>
        )}
        {errors.documentStorageKey && (
          <p className="mt-1 text-xs text-red-500">{getErrorMessage(errors.documentStorageKey)}</p>
        )}
      </div>

      <div className="pt-6 border-t border-slate-800 flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting || uploadState === "uploading"}
          disabled={uploadState === "uploading" || !documentStorageKey}
        >
          {isSubmitting ? t.creatingAuction : t.submit}
        </Button>
      </div>
    </form>
  );
}
