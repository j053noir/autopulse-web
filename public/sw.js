/**
 * AutoPulse Web - Secure Service Worker Proxy
 * 
 * NOTA DE SEGURIDAD (OWASP A03:2021 / Mitigación XSS):
 * Este Service Worker corre en un hilo de ejecución secundario aislado de la pestaña principal del navegador.
 * Al almacenar el 'memoryAccessToken' en este ámbito local del Worker, el token permanece inaccesible 
 * para cualquier script malicioso que logre ejecutarse en el DOM o mediante el objeto 'window' (evitando 
 * la exfiltración del JWT). La inyección del header 'Authorization' se realiza directamente a nivel de red.
 */

// Token y configuración almacenados en el hilo aislado
let memoryAccessToken = null;
let apiUrl = "http://localhost:5000/api"; // Default fallback

// Escuchar mensajes desde el hilo principal de React
self.addEventListener("message", (event) => {
  if (!event.data) return;

  switch (event.data.type) {
    case "INIT_CONFIG":
      if (event.data.apiUrl) {
        apiUrl = event.data.apiUrl;
      }
      break;

    case "SET_TOKEN":
      memoryAccessToken = event.data.token;
      break;

    case "CLEAR_TOKEN":
      memoryAccessToken = null;
      break;

    default:
      break;
  }
});

// Interceptar peticiones de red salientes (Proxy Transparente)
self.addEventListener("fetch", (event) => {
  const requestUrl = event.request.url;

  // Interceptar únicamente peticiones dirigidas a nuestra API configurada dinámicamente
  const isApiRequest = requestUrl.startsWith(apiUrl);

  if (isApiRequest && memoryAccessToken) {
    // Clonar la petición original para poder modificar sus cabeceras
    const headers = new Headers(event.request.headers);
    headers.set("Authorization", `Bearer ${memoryAccessToken}`);

    // Crear una nueva petición con las cabeceras modificadas
    const modifiedRequest = new Request(event.request, {
      headers,
      mode: event.request.mode === "navigate" ? "same-origin" : event.request.mode,
      credentials: event.request.credentials,
    });

    event.respondWith(
      fetch(modifiedRequest).catch((err) => {
        console.error("[SW Proxy] Error executing intercepted request:", err);
        throw err;
      })
    );
  }
  // Para cualquier otra petición (activos de Next.js, imágenes, etc.), fluir sin interferir
});

// Forzar la activación inmediata del Service Worker cuando se registra
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
