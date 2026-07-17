"use client";

import React, { useMemo } from "react";
import DOMPurify from "dompurify";

interface SafeHtmlRendererProps {
  /**
   * El código HTML sin sanitizar provisto por la base de datos o entrada de usuario.
   */
  htmlContent: string;
  /**
   * Clases CSS opcionales para aplicar estilos al elemento contenedor.
   */
  className?: string;
  /**
   * El tag HTML contenedor a generar. Por defecto es un "div".
   */
  tagName?: React.ElementType;
}

/**
 * SafeHtmlRenderer actúa como un escudo contra ataques XSS (Cross-Site Scripting)
 * al sanitizar cualquier código HTML usando DOMPurify antes de inyectarlo
 * en el DOM mediante dangerouslySetInnerHTML.
 */
export function SafeHtmlRenderer({
  htmlContent,
  className = "",
  tagName: Tag = "div",
}: SafeHtmlRendererProps) {
  const sanitizedContent = useMemo(() => {
    // Si estamos renderizando del lado del servidor (SSR), retornamos el contenido sin alterar.
    // Al hidratarse en el navegador, se ejecutará DOMPurify limpiando cualquier payload malicioso.
    if (typeof window === "undefined") {
      return htmlContent;
    }
    
    return DOMPurify.sanitize(htmlContent, {
      ALLOWED_TAGS: [
        "strong",
        "em",
        "a",
        "p",
        "br",
        "ul",
        "ol",
        "li",
        "b",
        "i",
        "u",
        "strike",
        "s",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "blockquote",
        "code",
        "pre",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
        "hr",
      ],
      ALLOWED_ATTR: ["href", "target", "rel", "class"],
      // Limita la inyección de esquemas de URLs peligrosos (como javascript:)
      ALLOW_DATA_ATTR: false,
    });
  }, [htmlContent]);

  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
