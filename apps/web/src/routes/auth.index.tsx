import { createFileRoute, redirect } from '@tanstack/react-router'
import { pageHead } from '#/lib/seo'

export const Route = createFileRoute('/auth/')({
  head: () => pageHead({ title: 'Account', noindex: true }),
  beforeLoad: () => {
    throw redirect({ to: '/auth/sign-in' })
  },
})
