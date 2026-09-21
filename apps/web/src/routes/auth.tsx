import { createFileRoute } from '@tanstack/react-router'

import { AuthShell } from '#/components/auth/auth-shell'

export const Route = createFileRoute('/auth')({ component: AuthShell })
