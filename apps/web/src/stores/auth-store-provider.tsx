import { createContext, use, useState } from 'react'
import { useStore } from 'zustand'

import type { AuthStore, SessionUser } from './auth-store'
import { createAuthStore } from './auth-store'

const AuthStoreContext = createContext<AuthStore | null>(null)

export function AuthStoreProvider({
  user,
  children,
}: {
  user: SessionUser
  children: React.ReactNode
}) {
  const [store] = useState(() => createAuthStore(user))

  return <AuthStoreContext value={store}>{children}</AuthStoreContext>
}

function useAuthStore<T>(
  selector: (state: ReturnType<AuthStore['getState']>) => T,
) {
  const store = use(AuthStoreContext)
  if (!store) {
    throw new Error('useAuthStore must be used within AuthStoreProvider')
  }
  return useStore(store, selector)
}

export const useSessionUser = () => useAuthStore((state) => state.user)
export const useSetSessionUser = () => useAuthStore((state) => state.setUser)
