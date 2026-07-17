"use client";

import React, { useState, useEffect } from "react";

interface SafeDateRendererProps {
  dateString: string;
  className?: string;
}

export function SafeDateRenderer({ dateString, className = "" }: SafeDateRendererProps) {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    // Al montarse en el cliente, calculamos la fecha en la zona horaria local del navegador
    try {
      const date = new Date(dateString);
      
      // Formato amigable e internacionalizado (ej. "16 jul 2026, 15:30")
      const formatter = new Intl.DateTimeFormat(navigator.language || "es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      setFormattedDate(formatter.format(date));
    } catch {
      setFormattedDate(dateString);
    }
  }, [dateString]);

  // Si no se ha montado aún en el cliente, renderizamos un espacio vacío o un texto neutro (evitando mismatch con el HTML inicial)
  return <span className={className}>{formattedDate || "..."}</span>;
}
