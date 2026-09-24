import { createStore } from 'zustand/vanilla'

export type SessionUser = {
  id: string
  email: string
  name: string | null
}

type AuthState = {
  user: SessionUser
  setUser: (user: SessionUser) => void
}

export type AuthStore = ReturnType<typeof createAuthStore>

// One store instance per request/render, never a module-level singleton: the
// SSR process is shared across requests, so a singleton would leak one
// signed-in user's data into another user's response.
export function createAuthStore(user: SessionUser) {
  return createStore<AuthState>((set) => ({
    user,
    setUser: (nextUser) => set({ user: nextUser }),
  }))
}
