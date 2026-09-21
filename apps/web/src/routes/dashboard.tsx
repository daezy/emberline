import { createFileRoute } from '@tanstack/react-router'

import { DashboardLayout } from '#/components/dashboard/dashboard-layout'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})
