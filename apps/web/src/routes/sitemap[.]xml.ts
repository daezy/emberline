import { createFileRoute } from '@tanstack/react-router'

import { SITE_URL } from '#/lib/seo'

// Public pages only; the dashboard and account flows are not indexed.
const pages = [
  { path: '/', priority: '1.0' },
  { path: '/auth/sign-up', priority: '0.6' },
  { path: '/auth/sign-in', priority: '0.4' },
]

const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    ({ path, priority }) =>
      `  <url><loc>${SITE_URL}${path}</loc><priority>${priority}</priority></url>`,
  )
  .join('\n')}
</urlset>
`

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () =>
        new Response(body, {
          headers: {
            'content-type': 'application/xml; charset=utf-8',
            'cache-control': 'public, max-age=3600',
          },
        }),
    },
  },
})
