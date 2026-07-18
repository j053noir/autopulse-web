import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Necesario para usar la librería externa sharp en AWS Lambda/Fargate si usaras Edge
    unoptimized: true,
    // Dominios permitidos si usas SSR/API Routes
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Puedes agregar el dominio de tu CDN de AWS aquí después
    ],
  },
  async headers() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const cspConnectSrc = process.env.NEXT_PUBLIC_CSP_CONNECT_SRC || "http://localhost:5000 https://api.carsxe.com";
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https:;
      font-src 'self' data:;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      connect-src 'self' ${apiUrl} ${cspConnectSrc};
    `.replace(/\s{2,}/g, ' ').trim();

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
