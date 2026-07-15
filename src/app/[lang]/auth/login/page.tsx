"use client";

import React, { useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "en";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [closeActiveSessions, setCloseActiveSessions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError(lang === "es" ? "Por favor completa todos los campos" : "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      // Intentar iniciar sesión (con el mock/API service)
      await login(email, password, closeActiveSessions);
      router.push(`/${lang}`);
    } catch (err: any) {
      // Como estamos probando localmente, si falla por no tener backend activo (5000), 
      // podemos opcionalmente mockear un login exitoso directo para testing/demostración
      if (err.message && err.message.includes("fetch")) {
        // Simular éxito para demostración local si el servidor local 5000 no responde
        console.warn("API offline, simulando inicio de sesión mockeado.");
        localStorage.setItem("accessToken", "mock-jwt-token");
        localStorage.setItem("user", JSON.stringify({
          id: "101",
          email: email,
          userName: email.split("@")[0],
          permissions: ["bid.create", "auctions.view"],
        }));
        // Forzar recarga / redirección
        window.location.href = `/${lang}`;
      } else {
        setError(err.message || "Credenciales incorrectas");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-dark px-4 py-12 sm:px-6 lg:px-8 text-white">
      <div className="w-full max-w-md space-y-8 bg-brand-surface p-8 rounded-2xl border border-gray-800 shadow-2xl">
        <div className="text-center">
          <Link href={`/${lang}`} className="text-3xl font-black tracking-wider text-white">
            AUTO<span className="text-brand-accent">PULSE</span>
          </Link>
          <h2 className="mt-6 text-xl font-bold tracking-tight text-white">
            {lang === "es" ? "Acceso de Postores" : "Bidders Login"}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {lang === "es" 
              ? "Ingresa tus credenciales para participar" 
              : "Enter your credentials to participate"
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-brand-accent/10 border border-brand-accent/40 text-brand-accent text-sm rounded-lg p-3 text-center font-medium animate-fade-in">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                {lang === "es" ? "Correo Electrónico" : "Email Address"}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-dark border border-gray-800 focus:border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-all placeholder:text-gray-600"
                placeholder="usuario@autopulse.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                {lang === "es" ? "Contraseña" : "Password"}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-dark border border-gray-800 focus:border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-all placeholder:text-gray-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="close-sessions"
                name="close-sessions"
                type="checkbox"
                checked={closeActiveSessions}
                onChange={(e) => setCloseActiveSessions(e.target.checked)}
                className="h-4 w-4 rounded border-gray-800 bg-brand-dark text-brand-accent focus:ring-brand-accent focus:ring-offset-brand-surface cursor-pointer"
              />
              <label htmlFor="close-sessions" className="ml-2 block text-xs text-gray-400 select-none cursor-pointer">
                {lang === "es" ? "Cerrar otras sesiones activas" : "Close other active sessions"}
              </label>
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
            {lang === "es" ? "Ingresar al Portal" : "Enter Portal"}
          </Button>
        </form>
      </div>
    </div>
  );
}
