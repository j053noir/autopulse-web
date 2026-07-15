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

## 💻 Local Development

### 1. Clone the repository and install dependencies

Make sure you have [pnpm](https://pnpm.io/) installed:

```bash
pnpm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root of the project to define the backend URL (optional, the API service defaults to `http://localhost:5000`):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
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


