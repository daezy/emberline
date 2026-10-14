// Read at build time, so set VITE_SITE_URL before building for production.
// Absolute URLs are required for link previews and canonical tags.
export const SITE_URL = (
  (import.meta.env.VITE_SITE_URL as string | undefined) ??
  'http://localhost:3000'
).replace(/\/$/, '')

export const SITE_NAME = 'Emberline'

export const DEFAULT_TITLE = 'Emberline — Keep your services warm'

export const DEFAULT_DESCRIPTION =
  'Emberline keeps your applications warm, detects cold starts, and alerts you before users notice a sleeping service.'

const OG_IMAGE = {
  url: `${SITE_URL}/og-image.png`,
  width: '1200',
  height: '630',
  alt: 'Two requests to the same endpoint: 8.41 s while the server cold starts, 184 ms when Emberline keeps it warm.',
}

type PageMeta = {
  title?: string
  description?: string
  // Path of the page, used for its canonical URL and og:url.
  path?: string
  noindex?: boolean
}

// Router head entries with the same name/property replace the parent's, so
// pages only pass what differs from the defaults.
export function pageHead({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  noindex = false,
}: PageMeta = {}) {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : DEFAULT_TITLE
  const url = path === undefined ? undefined : `${SITE_URL}${path}`

  return {
    meta: [
      { title: fullTitle },
      { name: 'description', content: description },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
      ...(url ? [{ property: 'og:url', content: url }] : []),
      ...(noindex ? [{ name: 'robots', content: 'noindex, nofollow' }] : []),
    ],
    links: url ? [{ rel: 'canonical', href: url }] : [],
  }
}

// Shared tags every page inherits from the root route.
export const baseMeta = [
  { property: 'og:site_name', content: SITE_NAME },
  { property: 'og:type', content: 'website' },
  { property: 'og:locale', content: 'en_US' },
  { property: 'og:image', content: OG_IMAGE.url },
  { property: 'og:image:width', content: OG_IMAGE.width },
  { property: 'og:image:height', content: OG_IMAGE.height },
  { property: 'og:image:alt', content: OG_IMAGE.alt },
  { name: 'twitter:card', content: 'summary_large_image' },
  { name: 'twitter:image', content: OG_IMAGE.url },
  { name: 'twitter:image:alt', content: OG_IMAGE.alt },
]

export const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  url: SITE_URL,
  description: DEFAULT_DESCRIPTION,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  image: OG_IMAGE.url,
}
