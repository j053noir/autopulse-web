"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { api } from "@/services/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, closeActiveSessions?: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restaurar sesión desde localStorage
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");
    if (savedUser && token) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Fetch full profile (with permissions) asynchronously in the background
        api.auth.getProfile()
          .then((profile) => {
            setUser(profile);
            localStorage.setItem("user", JSON.stringify(profile));
          })
          .catch((err) => {
            console.error("Error fetching user profile:", err);
            if (err.message?.includes("401") || err.message?.includes("Unauthorized")) {
              logout();
            }
          });
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, closeActiveSessions = false) => {
    setLoading(true);
    try {
      const data = await api.auth.login(email, password, closeActiveSessions);
      localStorage.setItem("accessToken", data.auth.accessToken);
      localStorage.setItem("refreshToken", data.auth.refreshToken);
      
      try {
        const profile = await api.auth.getProfile();
        localStorage.setItem("user", JSON.stringify(profile));
        setUser(profile);
      } catch (profileErr) {
        console.error("Failed to load user profile after login:", profileErr);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    if (accessToken && refreshToken) {
      try {
        await api.auth.logout(accessToken, refreshToken);
      } catch (err) {
        console.error("Error at backend logout:", err);
      }
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
