import 'server-only'

import about from '@/content/about.json'
import careers from '@/content/careers.json'
import centres from '@/content/centres.json'
import facilities from '@/content/facilities.json'
import facilitiesPage from '@/content/facilities-page.json'
import guide from '@/content/guide.json'
import home from '@/content/home.json'
import library from '@/content/library.json'
import navigation from '@/content/navigation.json'
import news from '@/content/news.json'
import newsPage from '@/content/news-page.json'
import notices from '@/content/notices.json'
import articlesSeed from '@/content/seed/articles.json'
import careersSeed from '@/content/seed/careers.json'
import departmentsSeed from '@/content/seed/departments.json'
import doctorsSeed from '@/content/seed/doctors.json'
import faqsSeed from '@/content/seed/faqs.json'
import newsSeed from '@/content/seed/news.json'
import noticesSeed from '@/content/seed/notices.json'
import settingsSeed from '@/content/seed/settings.json'
import specialities from '@/content/specialities.json'
import specialitiesHub from '@/content/specialities-hub.json'
import specialityGroups from '@/content/speciality-groups.json'
import { connectDb, isDbConfigured } from '@/lib/db/mongo'
import { collectionModel, Setting, type CollectionName } from '@/lib/db/models'

/*
 * The single place that knows where content comes from.
 *
 * - Page copy (headings, hero text, navigation) is JSON in /content, edited by
 *   developers.
 * - Lists the hospital updates often (doctors, departments, news, notices,
 *   articles, FAQs) and the site settings live in MongoDB and are edited in
 *   /admin. Without MONGODB_URI they are read from /content/seed, the same
 *   data `pnpm seed` loads into a fresh database.
 *
 * Getters in ./index.ts validate whatever comes back; components never import
 * from here directly.
 */

const COPY_DOCUMENTS = {
  navigation,
  home,
  centres,
  specialities,
  guide,
  facilities,
  news,
  notices,
  about,
  specialitiesHub,
  specialityGroups,
  library,
  newsPage,
  facilitiesPage,
  careers,
} as const

export type DocumentKey = keyof typeof COPY_DOCUMENTS

export async function loadDocument(key: DocumentKey): Promise<unknown> {
  // structuredClone so callers can never mutate the module-level JSON
  return structuredClone(COPY_DOCUMENTS[key])
}

const SEEDS: Record<CollectionName, unknown[]> = {
  doctors: doctorsSeed,
  departments: departmentsSeed,
  news: newsSeed,
  notices: noticesSeed,
  articles: articlesSeed,
  faqs: faqsSeed,
  careers: careersSeed,
}

/** Plain JSON: ObjectIds → strings, Dates → ISO strings, no `__v`. */
export function toPlain<T = Record<string, unknown>>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc, (key, value) => (key === '__v' ? undefined : value))) as T
}

function withId(row: Record<string, unknown>, fallback: string) {
  const { _id, ...rest } = row
  return { id: _id ? String(_id) : fallback, ...rest }
}

/**
 * Published items of a collection, sorted for display (`order`, then newest).
 * When the database is configured, errors propagate so a failed read is never
 * cached as an empty list.
 */
export async function readCollection(name: CollectionName): Promise<Record<string, unknown>[]> {
  if (!isDbConfigured()) {
    return (structuredClone(SEEDS[name]) as Record<string, unknown>[])
      .filter((row) => row.published !== false)
      .map((row, i) => withId(row, `seed-${name}-${i}`))
  }
  await connectDb()
  const rows = await collectionModel(name)
    .find({ published: true })
    .sort({ order: 1, createdAt: -1 })
    .lean()
  return rows.map((row) => withId(toPlain(row), ''))
}

/** A singleton settings document (currently only "site"). */
export async function readSetting(key: 'site'): Promise<unknown> {
  if (!isDbConfigured()) return structuredClone(settingsSeed)
  await connectDb()
  const row = await Setting.findOne({ key }).lean()
  return row ? toPlain(row.data) : structuredClone(settingsSeed)
}
