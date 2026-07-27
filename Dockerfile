# ==========================================
# ETAPA 1: base-deps (Gestión de Dependencias)
# ==========================================
FROM node:22-alpine AS base-deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV CI=true
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# Configuración de pnpm para Docker
RUN echo "confirmModulesPurge=false" > .npmrc

# Copiar manifiestos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias exactas usando el lockfile
RUN pnpm install --frozen-lockfile --ignore-scripts

# ==========================================
# ETAPA 2: builder (Compilación de Producción)
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

ENV CI=true
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar configuración .npmrc, node_modules y el código fuente
COPY --from=base-deps /app/.npmrc ./.npmrc
COPY --from=base-deps /app/node_modules ./node_modules
COPY . .

# Declarar variables de compilación requeridas por Next.js para inyectar en el bundle cliente
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CSP_CONNECT_SRC
ARG CARSXE_API_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_CSP_CONNECT_SRC=$NEXT_PUBLIC_CSP_CONNECT_SRC
ENV CARSXE_API_URL=$CARSXE_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Ejecutar la compilación standalone de Next.js
RUN pnpm build

# ==========================================
# ETAPA 3: runner (Entorno Minimalista de Ejecución)
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# SEGURIDAD PERIMETRAL (CIS Benchmark 4.1):
# Crear usuario y grupo de sistema sin privilegios de root (UID/GID 1001)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs -G nodejs

# Copiar únicamente los artefactos estrictamente necesarios desde la etapa builder
COPY --from=builder /app/public ./public

# Copiar artefactos standalone y estáticos asignando la propiedad al usuario no root
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambiar la ejecución al usuario no privilegiado
USER nextjs

EXPOSE 3000

# Arrancar el servidor HTTP ultra ligero generado por Next.js Standalone
CMD ["node", "server.js"]
