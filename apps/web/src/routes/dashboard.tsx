import { createFileRoute, redirect } from '@tanstack/react-router'

import { DashboardLayout } from '#/components/dashboard/dashboard-layout'
import { DashboardNotFound } from '#/components/feedback/dashboard-status'
import { ErrorPage } from '#/components/feedback/status-page'
import { getCurrentUserFn } from '#/server/auth.functions'
import { pageHead } from '#/lib/seo'

export const Route = createFileRoute('/dashboard')({
  head: () => pageHead({ title: 'Dashboard', noindex: true }),
  beforeLoad: async () => {
    const user = await getCurrentUserFn()
    if (!user) {
      throw redirect({ to: '/auth/sign-in' })
    }
    return { user }
  },
  component: DashboardLayout,
  // Unknown /dashboard/* paths render inside the layout.
  notFoundComponent: () => <DashboardNotFound />,
  // The layout itself failed (e.g. the session check), so there's no shell to
  // render into.
  errorComponent: ErrorPage,
})
