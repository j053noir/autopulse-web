import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Paleta de colores para AutoPulse
                brand: {
                    dark: "#0F172A",       // Slate 900 (Fondo principal)
                    surface: "#1E293B",    // Slate 800 (Tarjetas, contenedores)
                    accent: "#EF4444",     // Rojo deportivo de subastas (Velocidad)
                    muted: "#64748B",      // Slate 500 (Textos secundarios)
                }
            },
            animation: {
                "fade-in": "fadeIn 0.2s ease-out-forward",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0", transform: "translateY(4px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                }
            }
        },
    },
    plugins: [],
};
export default config;