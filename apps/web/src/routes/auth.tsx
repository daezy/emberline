import { createFileRoute, redirect } from '@tanstack/react-router'

import { AuthShell } from '#/components/auth/auth-shell'
import { getCurrentUserFn } from '#/server/auth.functions'

export const Route = createFileRoute('/auth')({
  beforeLoad: async () => {
    if (await getCurrentUserFn()) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: AuthShell,
})
