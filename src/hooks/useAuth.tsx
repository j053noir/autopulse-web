"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, useParams } from "next/navigation";
import { User } from "@/types";
import { api } from "@/services/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, closeActiveSessions?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const router = useRouter();
  const params = useParams();

  // Determinar el idioma actual para las redirecciones localizadas
  const lang = typeof params?.lang === "string" ? params.lang : "en";

  /**
   * Verifica la validez de la sesión contra el endpoint seguro del servidor.
   * Si la cookie HTTP-Only sigue siendo válida, cargará el perfil; de lo contrario, limpiará el estado.
   */
  const checkSession = async () => {
    setIsLoading(true);
    try {
      const profile = await api.auth.getProfile();
      setUser(profile);
      setIsAuthenticated(true);
    } catch (err) {
      console.warn("La verificación de sesión falló o no hay cookie activa:", err);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Validación de arranque para hidratar el estado global
  useEffect(() => {
    checkSession();
  }, []);

  /**
   * Realiza la petición de login. El navegador intercepta de forma transparente la directiva
   * Set-Cookie del backend. Luego consultamos el perfil del usuario para poblar el estado local
   * y redirigir con seguridad.
   */
  const login = async (email: string, password: string, closeActiveSessions = false) => {
    setIsLoading(true);
    try {
      // Intentar iniciar sesión (esta llamada adjunta automáticamente la cookie en el navegador)
      await api.auth.login(email, password, closeActiveSessions);
      
      // Obtener los datos del perfil activo a partir de la nueva cookie guardada
      const profile = await api.auth.getProfile();
      setUser(profile);
      setIsAuthenticated(true);

      // Redirección inteligente: si venimos de ser bloqueados, volvemos a la página anterior
      const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const returnUrl = searchParams?.get("returnUrl");
      
      router.push(returnUrl || `/${lang}/dashboard`);
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cierra la sesión activa borrando la cookie en el backend y limpiando el estado global.
   */
  const logout = async () => {
    setIsLoading(true);
    try {
      await api.auth.logout();
    } catch (err) {
      console.error("Error al revocar la sesión en el servidor:", err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      router.push(`/${lang}/auth/login`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
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
