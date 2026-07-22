import {
  User,
  AuthDto,
  Auction,
  AuctionDashboardDto,
  CreateAuctionCommand,
  CreateAuctionBidCommand,
  TelemetryBenchmarkResult,
  UserBid,
  PreSignedUrlResponseDto,
} from "@/types";

if (typeof window === "undefined" && process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Cliente de red seguro que propaga credenciales (cookies HTTP-Only) en todas las llamadas.
 * 
 * NOTA EDUCATIVA: En Next.js App Router (RSC y Client Components), al interactuar con APIs
 * externas o en diferentes puertos (ej. Frontend en :3000 y Backend .NET en :5000), es VITAL
 * usar `credentials: "include"`. Esto le indica al navegador que adjunte y guarde las cookies
 * de sesión en solicitudes Cross-Origin, previniendo que se pierda el estado de la sesión.
 */
const fetchWithCredentials = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const finalOptions: RequestInit = {
    ...options,
    headers,
    credentials: "include", // REQUISITO CRÍTICO: Envío automático de cookies en peticiones Cross-Origin
  };

  // Propagación manual de cookies en Server Components (SSR/RSC)
  if (typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const allCookies = cookieStore.toString();
      if (allCookies) {
        headers.set("Cookie", allCookies);
      }
    } catch (e) {
      // Ignorar si no hay contexto de request activo (ej. durante build estático)
    }
  }

  return fetch(url, finalOptions);
};

export const api = {
  auth: {
    /**
     * Procesa la autenticación del usuario.
     * La cookie HTTP-Only 'Set-Cookie' es gestionada de manera nativa por el navegador.
     */
    async login(email: string, password: string, closeActiveSessions: boolean = false): Promise<User> {
      const response = await fetchWithCredentials(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email, password, closeActiveSessions }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al iniciar sesión");
      }

      // El backend puede retornar información básica del usuario. Si no la hay, se resuelve vía getProfile.
      const data = await response.json();
      return data.user || data;
    },

    async register(username: string, email: string, password: string): Promise<{ id: string }> {
      const idempotencyKey = typeof window !== "undefined" ? window.crypto.randomUUID() : "server-register-key";
      const response = await fetchWithCredentials(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        body: JSON.stringify({ username, email, password, idempotencyKey }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al registrarse");
      }

      return response.json();
    },

    async logout(): Promise<void> {
      const response = await fetchWithCredentials(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al cerrar sesión");
      }
    },

    async getProfile(): Promise<User> {
      const response = await fetchWithCredentials(`${BASE_URL}/api/auth/profile`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al obtener perfil del usuario");
      }

      return response.json();
    },
  },

  auctions: {
    async getActive(): Promise<Auction[]> {
      const response = await fetchWithCredentials(`${BASE_URL}/api/auctions/active`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Error al obtener subastas activas");
      }

      const data = await response.json();
      return data.map((item: any) => ({
        id: item.id,
        title: item.vehicle ? `${item.vehicle.year} ${item.vehicle.marquee} ${item.vehicle.model}` : "Vehículo",
        description: item.vehicle
          ? `VIN: ${item.vehicle.vin} • Kilometraje: ${item.vehicle.mileage?.toLocaleString() ?? 0} mi`
          : "Detalles no disponibles",
        basePrice: item.startingPrice ?? 0,
        currentBid: item.currentPrice ?? 0,
        currency: item.currentPriceCurrency || item.startingPriceCurrency || "USD",
        endTime: item.endTime,
        imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
      }));
    },

    async getById(id: string): Promise<Auction> {
      const response = await fetchWithCredentials(`${BASE_URL}/api/auctions/${id}`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al obtener la subasta con ID ${id}`);
      }

      const item = await response.json();

      let lastBidderName = undefined;
      if (item.bids && item.bids.length > 0) {
        const sortedBids = [...item.bids].sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        lastBidderName = sortedBids[0]?.bidderName || undefined;
      }

      return {
        id: item.id,
        title: item.vehicle ? `${item.vehicle.year} ${item.vehicle.marquee} ${item.vehicle.model}` : "Vehículo",
        description: item.vehicle
          ? `VIN: ${item.vehicle.vin} • Kilometraje: ${item.vehicle.mileage?.toLocaleString() ?? 0} mi`
          : "Detalles no disponibles",
        basePrice: item.startingPrice ?? 0,
        currentBid: item.currentPrice ?? 0,
        currency: item.currentPriceCurrency || item.startingPriceCurrency || "USD",
        endTime: item.endTime,
        imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
        year: item.vehicle?.year,
        mileage: item.vehicle?.mileage,
        vin: item.vehicle?.vin,
        marquee: item.vehicle?.marquee,
        model: item.vehicle?.model,
        lastBidderName,
      };
    },

    async getDashboard(id: string): Promise<AuctionDashboardDto> {
      const response = await fetchWithCredentials(`${BASE_URL}/api/auctions/${id}/dashboard`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al obtener el dashboard de la subasta ${id}`);
      }

      return response.json();
    },

    async create(command: CreateAuctionCommand): Promise<{ id: string }> {
      const response = await fetchWithCredentials(`${BASE_URL}/api/auctions`, {
        method: "POST",
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Propagate structured FluentValidation errors if available
        if (response.status === 400 && errorData.errors) {
          const customError = new Error("Validation Failed") as any;
          customError.errors = errorData.errors;
          throw customError;
        }

        throw new Error(errorData.message || "Error al crear la subasta");
      }

      return response.json();
    },

    async getUploadUrl(fileName: string, contentType: string): Promise<PreSignedUrlResponseDto> {
      const response = await fetchWithCredentials(`${BASE_URL}/api/auctions/upload-url`, {
        method: "POST",
        body: JSON.stringify({ fileName, contentType }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al generar URL de carga");
      }

      return response.json();
    },

    async uploadFileToStorage(uploadUrl: string, file: File): Promise<void> {
      // En ambiente de desarrollo (development) simulamos el éxito de la subida sin hacer la petición real
      if (process.env.NODE_ENV === "development") {
        console.log("[Dev Mode] Simulando subida de archivo a Azure Storage:", file.name);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return;
      }

      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error("Error al subir archivo al Storage");
      }
    },

    async placeBid(id: string, command: CreateAuctionBidCommand): Promise<{ id: string }> {
      const response = await fetchWithCredentials(`${BASE_URL}/api/auctions/${id}/bids`, {
        method: "POST",
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.title || errorData.message || `HTTP ${response.status}`;
        throw new Error(errorMessage);
      }

      return response.json();
    },

    async getMyBids(): Promise<UserBid[]> {
      const response = await fetchWithCredentials(`${BASE_URL}/api/auctions/bids/my`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Error al obtener las ofertas del usuario");
      }

      return response.json();
    },
  },

  telemetry: {
    async process(method: "span" | "naive", rawData: string): Promise<void> {
      const response = await fetchWithCredentials(`${BASE_URL}/api/telemetry?method=${method}`, {
        method: "POST",
        body: JSON.stringify(rawData),
      });

      if (!response.ok) {
        throw new Error("Error al procesar telemetría");
      }
    },

    async benchmark(rawData: string): Promise<TelemetryBenchmarkResult> {
      const response = await fetchWithCredentials(`${BASE_URL}/api/telemetry/benchmark`, {
        method: "POST",
        body: JSON.stringify(rawData),
      });

      if (!response.ok) {
        throw new Error("Error al ejecutar benchmark de telemetría");
      }

      return response.json();
    },
  },
};
