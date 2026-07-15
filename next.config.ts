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
};

export default nextConfig;
