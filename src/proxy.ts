import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "es"];
const defaultLocale = "en";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Control de acceso perimetral de sesión (Middleware de seguridad)
  // Verifica si la ruta solicitada corresponde al dashboard protegido (localizado o no)
  const isDashboardRoute = pathname.match(/^\/(?:[a-z]{2}\/)?dashboard(?:\/.*)?$/);

  if (isDashboardRoute) {
    // Al ejecutarse del lado del servidor, lee la cookie HTTP-Only 'autopulse-session'
    const sessionCookie = request.cookies.get("autopulse-session")?.value;

    if (!sessionCookie) {
      // Extrae el idioma de la URL para redirigir a la vista de login localizada correcta
      const langMatch = pathname.match(/^\/([a-z]{2})/);
      const lang = langMatch ? langMatch[1] : defaultLocale;

      const loginUrl = new URL(`/${lang}/auth/login`, request.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Lógica existente de internacionalización (I18n)
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Negociación simple de idioma basada en cabeceras
  const acceptLanguage = request.headers.get("accept-language") || "";
  const locale = acceptLanguage.toLowerCase().includes("es") ? "es" : defaultLocale;

  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, public assets like favicon.ico, etc.)
    "/((?!api|_next/static|_next/image|favicon.ico|next.svg|vercel.svg).*)",
  ],
};
