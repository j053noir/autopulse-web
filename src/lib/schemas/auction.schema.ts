import { z } from "zod";

export const CATEGORIES = ["Sedan", "SUV", "Deportivo", "Camioneta"] as const;
export const CURRENCIES = ["USD", "CAD", "COP"] as const;

// Expresión regular para VIN de 17 caracteres que excluye I, O, Q
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;

export const createAuctionSchema = z.object({
  title: z
    .string()
    .min(10, "validation.titleMin")
    .max(100, "validation.titleMax"),
  
  vin: z
    .string()
    .length(17, "validation.vinLength")
    .regex(VIN_REGEX, "validation.vinRegex"),

  marquee: z
    .string()
    .min(2, "validation.marqueeMin")
    .max(50, "validation.marqueeMax"),

  model: z
    .string()
    .min(1, "validation.modelMin")
    .max(50, "validation.modelMax"),

  year: z
    .number({ invalid_type_error: "validation.yearType" } as any)
    .int()
    .min(1900, "validation.yearMin")
    .max(new Date().getFullYear() + 2, "validation.yearMax"),

  mileage: z
    .number({ invalid_type_error: "validation.mileageType" } as any)
    .min(0, "validation.mileageMin"),

  basePrice: z
    .number({ invalid_type_error: "validation.basePriceType" } as any)
    .positive("validation.basePricePositive"),

  currency: z.enum(CURRENCIES, {
    errorMap: () => ({ message: "validation.currencyInvalid" }),
  } as any),

  minimumBidIncrement: z
    .number({ invalid_type_error: "validation.minIncrementType" } as any)
    .min(50, "validation.minIncrementMin"),

  endTime: z
    .string()
    .refine((val) => {
      const date = new Date(val);
      const tomorrow = new Date();
      tomorrow.setHours(tomorrow.getHours() + 24);
      return date > tomorrow;
    }, "validation.endTimeDuration"),

  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: "validation.categoryInvalid" }),
  } as any),

  documentStorageKey: z
    .string()
    .min(1, "validation.documentStorageKeyRequired"),

  documentFile: typeof window === "undefined" 
    ? z.any() 
    : z
        .instanceof(File, { message: "validation.documentFileInvalid" })
        .refine((file) => file.size <= 5 * 1024 * 1024, "validation.documentFileSize")
        .refine(
          (file) => ["application/pdf", "image/png", "image/jpeg", "image/jpg"].includes(file.type),
          "validation.documentFileType"
        ),
});

export type CreateAuctionInput = z.infer<typeof createAuctionSchema>;
export type CategoryType = (typeof CATEGORIES)[number];
