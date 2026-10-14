import { createFileRoute } from '@tanstack/react-router'

import { LandingPage } from '#/components/marketing/landing-page/landing-page'
import { pageHead, structuredData } from '#/lib/seo'

export const Route = createFileRoute('/')({
  head: () => ({
    ...pageHead({ path: '/' }),
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(structuredData),
      },
    ],
  }),
  component: LandingPage,
})
