import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'
import type { z } from 'zod'

import type { CollectionName } from '@/lib/db/models'

import { fill, formatDate } from './format'
import {
  AboutPageSchema,
  ArticleItemSchema,
  CareersPageSchema,
  BlogsSchema,
  CentresSchema,
  DoctorsSchema,
  FacilitiesPageSchema,
  FacilitiesSchema,
  FaqsSchema,
  GuideSchema,
  HomePageSchema,
  JobItemSchema,
  LibrarySchema,
  NavigationSchema,
  NewsCopySchema,
  NewsItemSchema,
  NewsPageSchema,
  NewsSchema,
  NoticesSchema,
  SiteSettingsSchema,
  SpecialitiesHubSchema,
  SpecialitiesSchema,
  SpecialityGroupPagesSchema,
  type ArticleItem,
  type JobItem,
  type NewsItem,
} from './schemas'
import { loadDocument, readCollection, readSetting, type DocumentKey } from './source'
import { CONTENT_TAG, tagFor } from './tags'

export * from './schemas'
export { CONTENT_TAG, CONTENT_TAGS, tagFor } from './tags'

const COPY_SCHEMAS = {
  navigation: NavigationSchema,
  home: HomePageSchema,
  centres: CentresSchema,
  specialities: SpecialitiesSchema,
  guide: GuideSchema,
  facilities: FacilitiesSchema,
  news: NewsCopySchema,
  notices: NoticesSchema,
  about: AboutPageSchema,
  specialitiesHub: SpecialitiesHubSchema,
  specialityGroups: SpecialityGroupPagesSchema,
  library: LibrarySchema,
  newsPage: NewsPageSchema,
  facilitiesPage: FacilitiesPageSchema,
  careers: CareersPageSchema,
} satisfies Record<DocumentKey, z.ZodType>

type Copy<K extends DocumentKey> = z.output<(typeof COPY_SCHEMAS)[K]>
type Row = Record<string, unknown>

/**
 * Page copy (JSON). Cached per document, tagged `content` + `content:<key>`
 * so /api/revalidate can refresh one document or everything.
 */
async function loadCopy<K extends DocumentKey>(key: K): Promise<Copy<K>> {
  'use cache'
  cacheTag(CONTENT_TAG, tagFor(key))
  cacheLife('max')

  let raw: unknown = {}
  try {
    raw = await loadDocument(key)
  } catch (error) {
    console.error(`[content] failed to load "${key}"`, error)
  }
  // Schemas never throw (see schemas.ts): bad fields become empty values.
  return COPY_SCHEMAS[key].parse(raw) as Copy<K>
}

/**
 * Admin-managed list (MongoDB, or /content/seed without a database). Tagged
 * `content:<collection>`; admin saves call updateTag with the same tag. A
 * database error is not caught, so it is never cached as an empty list.
 */
async function loadCollection(name: CollectionName): Promise<Row[]> {
  'use cache'
  cacheTag(CONTENT_TAG, tagFor(name))
  cacheLife('max')
  return readCollection(name)
}

// ---------- page copy ----------

export const getNavigation = () => loadCopy('navigation')
export const getHomePage = () => loadCopy('home')
export const getCentres = () => loadCopy('centres')
export const getGuide = () => loadCopy('guide')
export const getFacilities = () => loadCopy('facilities')
export const getAboutPage = () => loadCopy('about')
export const getSpecialitiesHub = () => loadCopy('specialitiesHub')
export const getSpecialityGroupPages = () => loadCopy('specialityGroups')
export const getNewsPage = () => loadCopy('newsPage')
export const getFacilitiesPage = () => loadCopy('facilitiesPage')
export const getCareersPage = () => loadCopy('careers')

// ---------- admin-managed ----------

export async function getSiteSettings() {
  'use cache'
  cacheTag(CONTENT_TAG, tagFor('site'))
  cacheLife('max')
  return SiteSettingsSchema.parse(await readSetting('site'))
}

export async function getDoctors() {
  return DoctorsSchema.parse({ items: await loadCollection('doctors') })
}

/** Speciality groups (copy) with their departments (collection). */
export async function getSpecialities() {
  const [copy, departments] = await Promise.all([
    loadCopy('specialities'),
    loadCollection('departments'),
  ])
  return SpecialitiesSchema.parse({
    groups: copy.groups.map((group) => ({
      ...group,
      departments: departments.filter((dept) => dept.group === group.slug),
    })),
  })
}

const asText = (value: unknown) => (typeof value === 'string' ? value : '')
const asList = (value: unknown) => (Array.isArray(value) ? value : [])

/** Detail pages exist only for items with a body; otherwise the item's own link. */
function itemHref(row: Row, base: string) {
  if (asList(row.body).length > 0 && row.slug) return `${base}/${asText(row.slug)}`
  return asText(row.link) || '#'
}

/** Published news, newest/featured order as set in the admin. */
export async function getNewsItems(): Promise<NewsItem[]> {
  const rows = await loadCollection('news')
  return rows.flatMap((row) => {
    const parsed = NewsItemSchema.safeParse({
      ...row,
      href: itemHref(row, '/news'),
      date: formatDate(row.date),
    })
    return parsed.success ? [parsed.data] : []
  })
}

/** Home-page news block: the featured story plus the next two items. */
export async function getNews() {
  const [copy, items] = await Promise.all([loadCopy('news'), getNewsItems()])
  const lead = items.find((item) => item.featured) ?? items[0]
  const cards = items.filter((item) => item !== lead).slice(0, 2)
  return NewsSchema.parse({
    lead: lead && {
      image: lead.image,
      tag: lead.tag,
      badge: copy.featuredBadge,
      meta: [lead.date, lead.readTime].filter(Boolean).join(' · '),
      title: lead.title,
      teaser: lead.summary,
      linkLabel: copy.linkLabel,
      href: lead.href,
    },
    cards,
  })
}

/** Notice board copy with announcements and tenders from the notices collection. */
export async function getNotices() {
  const [copy, rows] = await Promise.all([loadCopy('notices'), loadCollection('notices')])
  const item = (row: Row) => {
    const iso = asText(row.date)
    const date = iso ? new Date(iso) : null
    const doc = row.document as { url?: string } | undefined
    return {
      day: date ? formatDate(iso, { day: '2-digit' }) : copy.dateTbc.day,
      month: date ? formatDate(iso, { month: 'short' }) : copy.dateTbc.month,
      title: row.title,
      href: doc?.url || asText(row.link) || '#',
      date: iso ? formatDate(iso) : '',
      status: asText(row.status),
    }
  }
  return NoticesSchema.parse({
    ...copy,
    announcements: {
      ...copy.announcements,
      items: rows
        .filter((row) => row.kind === 'announcement')
        .map((row) => ({ ...item(row), kind: copy.announcements.kindLabel })),
    },
    tenders: {
      ...copy.tenders,
      items: rows
        .filter((row) => row.kind === 'tender')
        .map((row) => {
          const base = item(row)
          return {
            ...base,
            lastDate: base.date ? fill(copy.tenders.lastDateLabel, { date: base.date }) : '',
          }
        }),
    },
  })
}

async function getArticleItems(): Promise<ArticleItem[]> {
  const rows = await loadCollection('articles')
  return rows.flatMap((row) => {
    const parsed = ArticleItemSchema.safeParse({
      ...row,
      href: itemHref(row, '/wellness-library'),
      date: formatDate(row.date),
    })
    return parsed.success ? [parsed.data] : []
  })
}

/** Wellness Library copy and categories with the published articles. */
export async function getLibrary() {
  const [copy, articles] = await Promise.all([loadCopy('library'), getArticleItems()])
  return LibrarySchema.parse({ ...copy, articles })
}

/** Home-page "Wellness library" cards: the first four articles. */
export async function getBlogs() {
  const library = await getLibrary()
  return BlogsSchema.parse({
    items: library.articles.slice(0, 4).map((article) => {
      const category = library.categories.find((c) => c.key === article.category)
      return {
        category: { label: category?.label ?? '', tone: category?.tone ?? 'green' },
        accent: category?.accent ?? 'teal',
        title: article.title,
        meta: article.readTime,
        href: article.href,
      }
    }),
  })
}

export async function getFaqs() {
  return FaqsSchema.parse({ items: await loadCollection('faqs') })
}

export async function getNewsItem(slug: string) {
  const items = await getNewsItems()
  return items.find((item) => item.slug === slug && item.body.length > 0)
}

export async function getArticle(slug: string) {
  const library = await getLibrary()
  const article = library.articles.find((a) => a.slug === slug && a.body.length > 0)
  return article && { article, library }
}

/** Published job openings, in the order set in the admin. */
export async function getJobs(): Promise<JobItem[]> {
  const rows = await loadCollection('careers')
  return rows.flatMap((row) => {
    const parsed = JobItemSchema.safeParse({ ...row, date: formatDate(row.date) })
    return parsed.success ? [parsed.data] : []
  })
}
