import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { isRedirect } from '@tanstack/react-router'
import type { AnyRedirect } from '@tanstack/react-router'

// Server functions signal an expired session by throwing a router redirect.
// Query errors bypass the router, so follow it here instead of showing it.
export function makeQueryClient(onRedirect: (redirect: AnyRedirect) => void) {
  const onError = (error: unknown) => {
    if (isRedirect(error)) onRedirect(error)
  }

  return new QueryClient({
    queryCache: new QueryCache({ onError }),
    mutationCache: new MutationCache({ onError }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => !isRedirect(error) && failureCount < 1,
      },
    },
  })
}
