import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  isSidebarOpen: boolean;
  theme: "light" | "dark";
  lastViewedAuctionId: string | null;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setTheme: (theme: "light" | "dark") => void;
  setLastViewedAuctionId: (auctionId: string | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarOpen: false,
      theme: "dark",
      lastViewedAuctionId: null,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      setTheme: (theme) => set({ theme }),
      setLastViewedAuctionId: (lastViewedAuctionId) => set({ lastViewedAuctionId }),
    }),
    {
      name: "autopulse-ui-storage",
      partialize: (state) => ({
        theme: state.theme,
        lastViewedAuctionId: state.lastViewedAuctionId,
      }),
    }
  )
);
