import { createFileRoute, redirect } from '@tanstack/react-router'

import { DashboardLayout } from '#/components/dashboard/dashboard-layout'
import { getCurrentUserFn } from '#/server/auth.functions'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const user = await getCurrentUserFn()
    if (!user) {
      throw redirect({ to: '/auth/sign-in' })
    }
    return { user }
  },
  component: DashboardLayout,
})
