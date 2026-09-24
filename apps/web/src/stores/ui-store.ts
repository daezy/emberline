import { create } from 'zustand'

type UiState = {
  mobileNavOpen: boolean
  openMobileNav: () => void
  closeMobileNav: () => void
}

// Client-only UI state (no user data), so a module-level store is safe under
// SSR: it always starts closed on the server and carries no per-request data.
export const useUiStore = create<UiState>((set) => ({
  mobileNavOpen: false,
  openMobileNav: () => set({ mobileNavOpen: true }),
  closeMobileNav: () => set({ mobileNavOpen: false }),
}))
