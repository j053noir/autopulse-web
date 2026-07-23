# AutoPulse 🚗💨

**AutoPulse** is a modern and professional real-time vehicle auction portal built on a scalable and high-performance architecture.

## 🚀 Technologies

* **Framework:** Next.js 16.2 (App Router & Turbopack)
* **Language:** TypeScript (Strict Typing)
* **Styling:** Tailwind CSS v4 (CSS-First & PostCSS approach)
* **Package Manager:** pnpm

## 🛠️ Main Features

* **Localization (i18n):** Dynamic routing using local segments `/[lang]` (supports Spanish `es` and English `en` by default).
* **Proxy Handler (Middleware):** Intercepts requests and negotiates the language by detecting local headers, redirecting to `/en` by default.
* **Compound Components:** Implementation of the *Compound Components* design pattern (such as `<Card>` and `<Tabs>`) to avoid Prop Drilling and simplify UI layout.
* **Authentication Handler:** Integrated `AuthProvider` and `useAuth` hook that allows persisting user sessions and closing active sessions from other browsers.
* **Consolidated API Service:** `fetch` client configuration with automatic injection of authorization tokens (Bearer) in headers.
* **Interactive Modals:** Custom animated `Modal` wrapper implementing responsive `BidModal` (with currency-lock and custom bid validation) and `CreateAuctionModal` (with restricted currency validation).
* **CarsXE API Proxy & Caching:** Dynamically retrieves high-quality vehicle images using a local Next.js proxy route `/api/carsxe/images` to avoid browser CORS blocks and secure the API key. Combines TanStack React Query with a **1-month development cache** (via custom `staleTime` and `gcTime`) to optimize billing costs.
* **Theme System (Light / Dark Mode):** Class-based theme toggle managed via Zustand (`useUIStore`). Utilizes a React `useEffect` inside the providers layer to inject/remove the `.dark` class from the `document` root. Overrides system OS color scheme preferences to prevent light/dark mismatches.
* **Dynamic Bidding & Validation:** Adapts quick bid increments and custom bid boundaries dynamically based on the vehicle's `minimumBidIncrement` from the backend. Bidding controls are automatically replaced by a finalized warning badge on closed or expired auctions.
* **Consistently Unified Terminology:** Consistent use of "puja" and "pujar" across all Spanish dictionary files to avoid user confusion.
* **Cache Bypass Tuning:** Disables caching (`staleTime: 0`) for personal user bids (`my-bids`) and active lists to bypass `localStorage` cache and force a backend fetch, ensuring real-time bid representation.

## 💻 Local Development

### 1. Clone the repository and install dependencies

Make sure you have [pnpm](https://pnpm.io/) installed:

```bash
pnpm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root of the project:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000

# CarsXE API Configuration
CARSXE_API_URL=https://api.carsxe.com
CARSXE_API_KEY=YOUR_CARSXE_API_KEY
```

### 3. Start the development server

```bash
pnpm dev
```

The portal will be available at [http://localhost:3000](http://localhost:3000).

### 4. Build for production

To validate types and package the portal:

```bash
pnpm build
pnpm start
```



