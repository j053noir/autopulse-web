import { create } from "zustand";
import { User } from "@/types";
import { syncTokenWithWorker } from "@/hooks/useServiceWorkerAuth";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setSession: (user: User | null, accessToken: string | null) => void;
  setAccessToken: (accessToken: string | null) => void;
  setInitializing: (isInitializing: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,

  setSession: (user, accessToken) => {
    set({
      user,
      accessToken,
      isAuthenticated: !!user && !!accessToken,
    });
    // Sincronizar inmediatamente con el Service Worker (aislamiento)
    syncTokenWithWorker(accessToken);
  },

  setAccessToken: (accessToken) => {
    set({
      accessToken,
      isAuthenticated: !!accessToken,
    });
    // Sincronizar inmediatamente con el Service Worker (aislamiento)
    syncTokenWithWorker(accessToken);
  },

  setInitializing: (isInitializing) => {
    set({ isInitializing });
  },

  logout: () => {
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
    // Limpiar el token en el Service Worker
    syncTokenWithWorker(null);
  },
}));
