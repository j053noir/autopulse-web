import {
  User,
  AuthDto,
  Auction,
  AuctionDashboardDto,
  CreateAuctionCommand,
  CreateAuctionBidCommand,
  TelemetryBenchmarkResult,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:5000";

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

export const api = {
  auth: {
    async login(email: string, password: string, closeActiveSessions: boolean = false): Promise<{ user: User; auth: AuthDto }> {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, closeActiveSessions }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al iniciar sesión");
      }

      const authData: AuthDto = await response.json();

      // Decodificar el JWT AccessToken para extraer las claims del usuario
      let user: User = {
        id: "",
        email: "",
        userName: "",
        permissions: [],
      };

      try {
        const payloadBase64 = authData.accessToken.split(".")[1];
        const decodedPayload = JSON.parse(
          typeof window !== "undefined"
            ? atob(payloadBase64)
            : Buffer.from(payloadBase64, "base64").toString("utf-8")
        );

        user = {
          id: decodedPayload.sub || "",
          email: decodedPayload.email || "",
          userName: decodedPayload.unique_name || "",
          permissions: [], // Las autorizaciones dinámicas se manejan por sesión en backend/cache
        };
      } catch (err) {
        console.error("Error decodificando token de sesión:", err);
      }

      return {
        user,
        auth: authData,
      };
    },
  },

  auctions: {
    async getActive(): Promise<Auction[]> {
      const response = await fetch(`${BASE_URL}/api/auctions/active`, {
        method: "GET",
        headers: getAuthHeaders(),
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
        endTime: item.endTime,
        imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
      }));
    },

    async getById(id: string): Promise<Auction> {
      const response = await fetch(`${BASE_URL}/api/auctions/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al obtener la subasta con ID ${id}`);
      }

      return response.json();
    },

    async getDashboard(id: string): Promise<AuctionDashboardDto> {
      const response = await fetch(`${BASE_URL}/api/auctions/${id}/dashboard`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al obtener el dashboard de la subasta ${id}`);
      }

      return response.json();
    },

    async create(command: CreateAuctionCommand): Promise<{ id: string }> {
      const response = await fetch(`${BASE_URL}/api/auctions`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al crear la subasta");
      }

      return response.json();
    },

    async placeBid(id: string, command: CreateAuctionBidCommand): Promise<{ id: string }> {
      const response = await fetch(`${BASE_URL}/api/auctions/${id}/bids`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al realizar la puja");
      }

      return response.json();
    },
  },

  telemetry: {
    async process(method: "span" | "naive", rawData: string): Promise<void> {
      const response = await fetch(`${BASE_URL}/api/telemetry?method=${method}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(rawData),
      });

      if (!response.ok) {
        throw new Error("Error al procesar telemetría");
      }
    },

    async benchmark(rawData: string): Promise<TelemetryBenchmarkResult> {
      const response = await fetch(`${BASE_URL}/api/telemetry/benchmark`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(rawData),
      });

      if (!response.ok) {
        throw new Error("Error al ejecutar benchmark de telemetría");
      }

      return response.json();
    },
  },
};
