import type { MetadataRoute } from 'next'

import {
  getDoctors,
  getLibrary,
  getNewsItems,
  getSiteSettings,
  getSpecialities,
  SERVICE_PAGES,
} from '@/lib/content'

const PAGES = [
  '/about',
  '/specialities',
  '/doctors',
  '/facilities',
  '/news',
  '/wellness-library',
  '/careers',
  ...Object.values(SERVICE_PAGES),
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, specialities, news, library, doctors] = await Promise.all([
    getSiteSettings(),
    getSpecialities(),
    getNewsItems(),
    getLibrary(),
    getDoctors(),
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
  const profiles = doctors.items
    .map((doctor) => doctor.href)
    .filter((href) => href.startsWith('/doctors/'))
  return [
    { url: abs('/'), changeFrequency: 'weekly', priority: 1 },
    ...[...PAGES, ...groups, ...stories, ...profiles].map((path) => ({
      url: abs(path),
      changeFrequency: path === '/news' ? ('weekly' as const) : ('monthly' as const),
      priority: 0.8,
    })),
  ]
}
