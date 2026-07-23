# Portal Web AutoPulse 🚗💨

**Portal Web AutoPulse** es un cliente moderno, responsivo y profesional para subastas de vehículos en tiempo real, construido utilizando los ecosistemas más recientes de React y Next.js. El portal cuenta con actualizaciones de pujas en tiempo real, visualización interactiva de telemetría y enrutamiento localizado.

---

## 🏛️ Arquitectura y Patrones de Diseño

La aplicación frontend está diseñada en torno a patrones de arquitectura modernos que priorizan la reutilización de componentes, el alto rendimiento y la robustez en la gestión de estados.

### Patrones de Diseño Clave Aplicados

1. **Patrón de Componentes Compuestos (Compound Components)**
   - Implementado en bloques de construcción de interfaz como `<Card>` y `<Tabs>` (ubicados bajo `src/components/ui`).
   - Permite layouts altamente flexibles y declarativos, evitando el *prop drilling* al gestionar el estado compartido de manera implícita a través de React Context.

2. **Internacionalización y Localización (i18n)**
   - Aprovecha el enrutamiento dinámico de Next.js mediante el segmento `/[lang]` (soporta inglés `en` y español `es` de manera nativa).
   - Un **Middleware de i18n** gestiona las preferencias de idioma inspeccionando los encabezados `Accept-Language` del cliente, redirigiendo al predeterminado `/en` si no se especifica un segmento de ruta.
   - Los diccionarios de traducciones se ubican bajo `/dictionaries` y se cargan dinámicamente según el idioma actual.

3. **Proxy de API y Ajuste de Caché (Integración con CarsXE)**
   - Se integra con la API de CarsXE para obtener imágenes de vehículos de alta calidad.
   - **Seguridad y Evitación de CORS:** Las peticiones se enrutan a través del controlador local `/api/carsxe/images` para ocultar las claves de la API en el cliente y evitar bloqueos de CORS en el navegador.
   - **Configuración de Caché con TanStack React Query:** Para optimizar costos de API, las respuestas de imágenes utilizan una caché persistente de desarrollo configurada para **1 mes** (`staleTime` y `gcTime`).
   - **Bypass de Caché para Datos Críticos:** Para las ofertas del usuario y listados activos, se desactiva la caché (`staleTime: 0`) para obligar a realizar solicitudes al backend y garantizar la visualización de datos en tiempo real.

4. **Persistencia de Estado del Cliente (Zustand)**
   - Utiliza **Zustand** (`useUIStore`) para la gestión de estados globales ligeros y de alto rendimiento.
   - Administra el cambio de tema de colores (Modo Claro/Oscuro) y la expansión de la barra de navegación lateral.
   - Se integra con un efecto (`useEffect`) de React dentro de `providers.tsx` para inyectar o remover la clase `.dark` del elemento raíz del documento (`document`).

5. **Cliente API Unificado con REST y SignalR**
   - El cliente `fetch` configurado intercepta automáticamente las solicitudes salientes para inyectar los tokens JWT en los encabezados Bearer.
   - Integra `@microsoft/signalr` para conectarse directamente con los Hubs de tiempo real del backend para recibir actualizaciones instantáneas de pujas.

---

## 📂 Estructura de Directorios

```lic
autopulse-web/
├── dictionaries/                 # Diccionarios de traducción i18n (en.json, es.json)
├── public/                       # Activos estáticos (logos, iconos)
└── src/
    ├── app/                      # Raíz del App Router de Next.js
    │   ├── [lang]/               # Segmento dinámico de idioma para enrutamiento
    │   │   ├── auctions/         # Páginas de subastas y paneles detallados
    │   │   ├── auth/             # Vistas de Inicio de Sesión / Registro
    │   │   ├── dashboard/        # Vistas de perfil de usuario
    │   │   └── page.tsx          # Vista principal / Home
    │   ├── api/                  # Rutas de servidor local de Next.js
    │   │   └── carsxe/           # Proxy para la API de imágenes de CarsXE
    │   ├── globals.css           # Directivas globales de Tailwind y tokens de diseño
    │   └── providers.tsx         # Contenedor de proveedores (QueryClient, Auth, Tema)
    ├── components/               # Componentes de React UI
    │   ├── auctions/             # UI de subastas (Listas de pujas, widgets de telemetría)
    │   ├── layout/               # Diseños de Cabecera, Pie de Página y Barra Lateral
    │   └── ui/                   # Componentes atómicos reutilizables (Tarjetas, Modales, Listas)
    ├── hooks/                    # Hooks de React personalizados (useCountdown, useAuth)
    ├── lib/                      # Configuraciones base (SignalR, inicialización de QueryClient)
    ├── services/                 # Servicios de integración HTTP con la API del backend
    └── types/                    # Definición estricta de tipos de TypeScript
```

---

## 📦 Stack Tecnológico y Versiones de Paquetes

### Entorno Base
* **Framework:** Next.js `16.2.10` (App Router y Turbopack)
* **Lenguaje:** TypeScript `5.x` (Modo Estricto)
* **Estilos:** Tailwind CSS `v4.0` (Enfoque CSS-First con PostCSS)
* **Gestor de Paquetes:** pnpm

### Dependencias Principales

| Paquete | Versión | Descripción |
| :--- | :--- | :--- |
| `react` / `react-dom` | `19.2.4` | Motor de renderizado basado en componentes |
| `@tanstack/react-query` | `5.101.2` | Gestión del estado del servidor y caché de consultas |
| `@tanstack/react-virtual` | `3.14.6` | Virtualización de filas para listas extensas de subastas |
| `zustand` | `5.0.14` | Contenedor de estado global para configuraciones locales de UI |
| `@microsoft/signalr` | `10.0.0` | Conexión WebSocket en tiempo real a los Hubs del backend |
| `react-hook-form` | `7.82.0` | Lógica de manejo y validación de formularios |
| `zod` | `4.4.3` | Biblioteca de validación y declaración de esquemas |
| `dompurify` | `3.4.12` | Sanitización de HTML para bitácoras de telemetría |
| `react-hot-toast` | `2.6.0` | Notificaciones flotantes animadas en la interfaz |

---

## 💻 Desarrollo Local

### 1. Instalar Dependencias
Asegúrate de tener [pnpm](https://pnpm.io/) instalado:
```bash
pnpm install
```

### 2. Configurar Variables de Entorno
Crea un archivo `.env.local` en la raíz de la carpeta:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000

# Configuración de la API de CarsXE
CARSXE_API_URL=https://api.carsxe.com
CARSXE_API_KEY=TU_API_KEY_DE_CARSXE
```

### 3. Iniciar el Servidor de Desarrollo
```bash
pnpm dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

### 4. Compilar para Producción
Para validar tipos de TypeScript y empaquetar los archivos optimizados:
```bash
pnpm build
pnpm start
```
