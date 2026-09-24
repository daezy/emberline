import { QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import { makeQueryClient } from '#/lib/query-client'

export function AppProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [queryClient] = useState(() =>
    makeQueryClient((redirect) => void router.navigate(redirect.options)),
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
