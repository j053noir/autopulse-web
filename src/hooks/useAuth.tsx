"use client";

import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { api } from "@/services/api";

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, closeActiveSessions?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const store = useAuthStore();
  const router = useRouter();
  const params = useParams();

  // Determinar el idioma actual para las redirecciones localizadas
  const lang = typeof params?.lang === "string" ? params.lang : "en";

  /**
   * Verifica la validez de la sesión contra el endpoint seguro del servidor.
   * Realiza un refresco silencioso en el arranque para recuperar el accessToken si la cookie sigue siendo válida.
   */
  const checkSession = async () => {
    store.setInitializing(true);
    try {
      // 1. Intentar refresco silencioso usando la cookie HTTP-Only
      const authData = await api.auth.refreshToken();
      
      // 2. Si tiene éxito, guardar el token de acceso en el store (se sincronizará con el SW)
      store.setAccessToken(authData.accessToken);

      // 3. Obtener el perfil del usuario utilizando el nuevo token activo
      const profile = await api.auth.getProfile();
      
      // 4. Establecer la sesión completa en el store
      store.setSession(profile, authData.accessToken);
    } catch (err) {
      console.warn("[Session Checker] No active session found or silent refresh failed:", err);
      store.logout();
    } finally {
      store.setInitializing(false);
    }
  };

  /**
   * Realiza la petición de login. El navegador recibe la cookie HTTP-Only de sesión.
   * Guardamos el accessToken en Zustand (que lo envía al Service Worker) y obtenemos el perfil.
   */
  const login = async (email: string, password: string, closeActiveSessions = false) => {
    store.setInitializing(true);
    try {
      // Iniciar sesión y obtener el AuthDto (que contiene el accessToken)
      const authData = await api.auth.login(email, password, closeActiveSessions);
      
      // Guardar el accessToken en el store (sincroniza con el SW)
      store.setAccessToken(authData.accessToken);

      // Obtener los datos del perfil activo
      const profile = await api.auth.getProfile();
      
      // Establecer sesión completa
      store.setSession(profile, authData.accessToken);

      // Redirección inteligente
      const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const returnUrl = searchParams?.get("returnUrl");
      
      router.push(returnUrl || `/${lang}/dashboard`);
    } catch (err) {
      store.logout();
      throw err;
    } finally {
      store.setInitializing(false);
    }
  };

  /**
   * Cierra la sesión activa borrando las cookies en el backend y limpiando Zustand / Service Worker.
   */
  const logout = async () => {
    store.setInitializing(true);
    try {
      await api.auth.logout();
    } catch (err) {
      console.error("[Session Server] Error revoking session on server:", err);
    } finally {
      store.logout();
      store.setInitializing(false);
      router.push(`/${lang}/auth/login`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: store.user,
        isAuthenticated: store.isAuthenticated,
        isLoading: store.isInitializing,
        login,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
