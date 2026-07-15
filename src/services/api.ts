import { User, AuthDto, Auction } from "@/types";

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

      return response.json();
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

      return response.json();
    },
  },
};
