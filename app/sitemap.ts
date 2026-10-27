import type { MetadataRoute } from 'next'

import { getLibrary, getNewsItems, getSiteSettings, getSpecialities } from '@/lib/content'

const PAGES = ['/about', '/specialities', '/facilities', '/news', '/wellness-library', '/careers']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, specialities, news, library] = await Promise.all([
    getSiteSettings(),
    getSpecialities(),
    getNewsItems(),
    getLibrary(),
  ])
  const url = process.env.NEXT_PUBLIC_SITE_URL || site.seo.siteUrl
  const abs = (path: string) => new URL(path, url).toString()
  const groups = specialities.groups
    .filter((group) => group.slug)
    .map((group) => `/specialities/${group.slug}`)
  // items with a full story / article text have their own page
  const stories = [...news, ...library.articles]
    .map((item) => item.href)
    .filter((href) => href.startsWith('/news/') || href.startsWith('/wellness-library/'))
  return [
    { url: abs('/'), changeFrequency: 'weekly', priority: 1 },
    ...[...PAGES, ...groups, ...stories].map((path) => ({
      url: abs(path),
      changeFrequency: path === '/news' ? ('weekly' as const) : ('monthly' as const),
      priority: 0.8,
    })),
  ]
}
