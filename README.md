# AutoPulse Web Portal 🚗💨

**AutoPulse Web Portal** is a modern, responsive, and professional vehicle auction client dashboard built using the latest React and Next.js ecosystems. It features real-time bid updates, dynamic telemetry visualizations, and localized routing.

---

## 🏛️ Architecture & Design Patterns

The frontend application is built around modern UI architecture patterns that prioritize component reusability, high performance, and robust state management.

### Key Architectural & Design Patterns

1. **Compound Components Pattern**
   - Implemented in UI building blocks such as `<Card>` and `<Tabs>` (under `src/components/ui`).
   - Enables highly flexible, declarative layouts and avoids *prop drilling* by managing shared state implicitly through React Context.

2. **Internationalization & Localization (i18n)**
   - Leverages Next.js dynamic routing with language segments `/[lang]` (supporting English `en` and Spanish `es`).
   - A custom **i18n Middleware** negotiates client locales by inspecting `Accept-Language` headers, redirecting to the default `/en` when no segment is specified.
   - Translation dictionaries are stored under `/dictionaries` and loaded dynamically.

3. **API Proxy & Cache Tuning (CarsXE Integration)**
   - Integrates with the CarsXE API to retrieve high-quality vehicle images.
   - **Security & CORS Bypass:** Requests are routed through a secure local API handler `/api/carsxe/images` to hide API tokens and bypass browser CORS restrictions.
   - **TanStack React Query Cache Configuration:** To optimize API costs, image responses use a custom cache configuration: a **1-month development cache** (`staleTime` and `gcTime`).
   - **Real-Time Data Bypass:** For personal user bids and active lists, caching is explicitly bypassed (`staleTime: 0`) to enforce a backend fetch and guarantee real-time bid sync.

4. **Persistent Client-Side State (Zustand)**
   - Utilizes **Zustand** (`useUIStore`) for lightweight, high-performance global state management.
   - Manages UI themes (Light/Dark Mode toggle) and sidebar collapse states.
   - Integrates with a React `useEffect` inside `providers.tsx` to inject or remove the `.dark` class from the `document` root.

5. **Consolidated REST & SignalR API Client**
   - Configured `fetch` wrapper automatically intercepts outgoing requests to inject JWT bearer tokens.
   - Integrates `@microsoft/signalr` to connect directly to the backend's real-time hubs for instant bidding updates.

---

## 📂 Directory Structure

```lic
autopulse-web/
├── dictionaries/                 # i18n Translation dictionaries (en.json, es.json)
├── public/                       # Static assets (logos, icons)
└── src/
    ├── app/                      # Next.js App Router root
    │   ├── [lang]/               # Dynamic language routing segment
    │   │   ├── auctions/         # Active auction pages and detail dashboards
    │   │   ├── auth/             # Login / Register views
    │   │   ├── dashboard/        # User profile views
    │   │   └── page.tsx          # Homepage view
    │   ├── api/                  # Next.js local server routes
    │   │   └── carsxe/           # CarsXE API image proxy
    │   ├── globals.css           # Global Tailwind directives and tokens
    │   └── providers.tsx         # Providers shell (QueryClient, Auth, Theme)
    ├── components/               # React UI components
    │   ├── auctions/             # Auction-specific UI (Bid list, telemetry widgets)
    │   ├── layout/               # Header, Footer, Sidebar layouts
    │   └── ui/                   # Reusable atomic UI (Cards, Modals, Lists)
    ├── hooks/                    # Reusable custom React hooks (useCountdown, useAuth)
    ├── lib/                      # Base configurations (SignalR hubs, QueryClient setups)
    ├── services/                 # Backend HTTP API integration services
    └── types/                    # Strict TypeScript type definitions
```

---

## 📦 Technology Stack & Package Versions

### Core Environment
* **Framework:** Next.js `16.2.10` (App Router & Turbopack)
* **Language:** TypeScript `5.x` (Strict Mode)
* **Styling:** Tailwind CSS `v4.0` (PostCSS approach)
* **Package Manager:** pnpm

### Main Dependencies

| Package | Version | Description |
| :--- | :--- | :--- |
| `react` / `react-dom` | `19.2.4` | Component-driven runtime engine |
| `@tanstack/react-query` | `5.101.2` | Server-state management and query caching |
| `@tanstack/react-virtual` | `3.14.6` | Row virtualization for heavy auction lists |
| `zustand` | `5.0.14` | Global state container for local UI configs |
| `@microsoft/signalr` | `10.0.0` | Real-time WebSocket connection to backend hubs |
| `react-hook-form` | `7.82.0` | Form handling and validation logic |
| `zod` | `4.4.3` | Schema declaration and validation library |
| `dompurify` | `3.4.12` | HTML sanitization for telemetry logs |
| `react-hot-toast` | `2.6.0` | Animated push notifications in the UI |

---

## 💻 Local Development

### 1. Install Dependencies
Make sure you have [pnpm](https://pnpm.io/) installed:
```bash
pnpm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root of the directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000

# CarsXE API Configuration
CARSXE_API_URL=https://api.carsxe.com
CARSXE_API_KEY=YOUR_CARSXE_API_KEY
```

### 3. Start Development Server
```bash
pnpm dev
```
The application will be running at [http://localhost:3000](http://localhost:3000).

### 4. Build for Production
To run TypeScript compilation and bundle optimized assets:
```bash
pnpm build
pnpm start
```
