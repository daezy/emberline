import { createFileRoute } from '@tanstack/react-router'

import { SITE_URL } from '#/lib/seo'

const body = `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /auth/
Allow: /auth/sign-in
Allow: /auth/sign-up

Sitemap: ${SITE_URL}/sitemap.xml
`

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(body, {
          headers: {
            'content-type': 'text/plain; charset=utf-8',
            'cache-control': 'public, max-age=3600',
          },
        }),
    },
  },
})
