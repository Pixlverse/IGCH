import type { MetadataRoute } from 'next'

import { getSiteSettings } from '@/lib/content'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSiteSettings()
  const url = process.env.NEXT_PUBLIC_SITE_URL || site.seo.siteUrl
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/api/' }],
    sitemap: new URL('/sitemap.xml', url).toString(),
  }
}
