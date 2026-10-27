import 'server-only'

import { formatDate } from '@/lib/content/format'
import { toPlain } from '@/lib/content/source'
import {
  COLLECTIONS,
  collectionModel,
  Department,
  Setting,
  User,
  type CollectionName,
} from '@/lib/db/models'
import { connectDb, isDbConfigured } from '@/lib/db/mongo'

import type { Field } from './resources'

/*
 * Admin reads: every item, published or not. Never cached, always fresh.
 * Callers must have checked the session (requireUser) first.
 */

export type AdminRow = Record<string, unknown> & { id: string }

/** What is missing before the admin can work, in plain words (or null). */
export function adminConfigError(): string | null {
  if (!isDbConfigured())
    return 'MONGODB_URI is not set. Add it to .env.local (see .env.example) and restart.'
  if ((process.env.SESSION_SECRET ?? '').length < 32)
    return 'SESSION_SECRET is not set (at least 32 characters). Generate one with: openssl rand -hex 32'
  return null
}

const row = (doc: unknown): AdminRow => {
  const { _id, ...rest } = toPlain<Record<string, unknown>>(doc)
  return { id: String(_id), ...rest }
}

export async function listItems(name: CollectionName): Promise<AdminRow[]> {
  await connectDb()
  const docs = await collectionModel(name).find({}).sort({ order: 1, createdAt: -1 }).lean()
  return docs.map(row)
}

export const PAGE_SIZE = 10
const DEFAULT_SORT: Record<string, 1 | -1> = { order: 1, createdAt: -1 }

/** The list page (1-based) an item appears on, so the list can open where it is. */
export async function pageOf(
  name: CollectionName,
  id: string,
  sort: Record<string, 1 | -1> = DEFAULT_SORT,
): Promise<number> {
  await connectDb()
  const ids = await collectionModel(name).find({}, { _id: 1 }).sort(sort).lean()
  const index = ids.findIndex((doc) => String(doc._id) === id)
  return index < 0 ? 1 : Math.floor(index / PAGE_SIZE) + 1
}

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** One page of a collection, optionally filtered by text in the title field. */
export async function listPage(
  name: CollectionName,
  {
    page,
    query,
    titleField,
    sort = DEFAULT_SORT,
  }: { page: number; query: string; titleField: string; sort?: Record<string, 1 | -1> },
): Promise<{ items: AdminRow[]; total: number; page: number; pages: number }> {
  await connectDb()
  const model = collectionModel(name)
  const filter = query ? { [titleField]: { $regex: escapeRegex(query), $options: 'i' } } : {}
  const total = await model.countDocuments(filter)
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const current = Math.min(Math.max(1, page), pages)
  const docs = await model
    .find(filter)
    .sort(sort)
    .skip((current - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean()
  return { items: docs.map(row), total, page: current, pages }
}

export async function getItem(name: CollectionName, id: string): Promise<AdminRow | null> {
  await connectDb()
  const doc = await collectionModel(name)
    .findById(id)
    .lean()
    .catch(() => null)
  return doc ? row(doc) : null
}

export async function countItems(): Promise<
  Record<CollectionName, { total: number; hidden: number }>
> {
  await connectDb()
  const names = Object.keys(COLLECTIONS) as CollectionName[]
  const entries = await Promise.all(
    names.map(async (name) => {
      const model = collectionModel(name)
      const [total, hidden] = await Promise.all([
        model.countDocuments(),
        model.countDocuments({ published: false }),
      ])
      return [name, { total, hidden }] as const
    }),
  )
  return Object.fromEntries(entries) as Record<CollectionName, { total: number; hidden: number }>
}

/** Department names, for the doctor "Speciality" suggestions. */
export async function departmentNames(): Promise<string[]> {
  await connectDb()
  const names = await Department.distinct('name')
  return names.map(String).sort()
}

export async function listUsers() {
  await connectDb()
  const users = await User.find({}).sort({ createdAt: 1 }).lean()
  return users.map((u) => ({
    id: String(u._id),
    name: u.name,
    email: u.email,
    lastLogin: u.lastLoginAt ? formatDate(u.lastLoginAt) : '',
  }))
}

export async function getStoredSettings(): Promise<unknown> {
  await connectDb()
  return (await Setting.findOne({ key: 'site' }).lean())?.data ?? null
}

// ---------- form values ----------

export type FormValues = Record<string, string | string[]>

/** "YYYY-MM-DD" in India time, for <input type="date">. */
const dateInput = (value: unknown) => {
  if (!value) return ''
  const date = new Date(value as string)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(date)
}

/** A stored item → the string values the form fields expect. */
export function toFormValues(fields: Field[], item: AdminRow | null): FormValues {
  const values: FormValues = {}
  for (const field of fields) {
    const value = item?.[field.name]
    switch (field.type) {
      case 'paragraphs':
        values[field.name] = Array.isArray(value) ? value.join('\n\n') : ''
        break
      case 'checkbox':
        // new items default to visible
        values[field.name] = (item ? value === true : field.name === 'published') ? 'on' : ''
        break
      case 'checkboxes':
        values[field.name] = Array.isArray(value) ? value.map(String) : []
        break
      case 'date':
        values[field.name] = dateInput(value)
        break
      case 'number':
        values[field.name] = value === undefined ? '' : String(value)
        break
      case 'tag': {
        const tag = (value ?? {}) as { label?: string; tone?: string }
        values[`${field.name}.label`] = tag.label ?? ''
        values[`${field.name}.tone`] = tag.tone ?? 'green'
        break
      }
      case 'image': {
        const image = value as { src?: string; alt?: string } | undefined
        values[`${field.name}.src`] = image?.src ?? ''
        values[`${field.name}.alt`] = image?.alt ?? ''
        break
      }
      case 'document': {
        const doc = value as { url?: string; name?: string } | undefined
        values[`${field.name}.url`] = doc?.url ?? ''
        values[`${field.name}.name`] = doc?.name ?? ''
        break
      }
      default:
        // '#' is the stored "no link" value; show it as an empty field
        values[field.name] = typeof value === 'string' && value !== '#' ? value : ''
    }
  }
  return values
}

// ---------- dashboard ----------

/** "just now", "5 min ago", "3 h ago", "2 days ago", then a date. */
export function timeAgo(value: unknown, now = Date.now()): string {
  const time = new Date(value as string).getTime()
  if (Number.isNaN(time)) return ''
  const minutes = Math.round((now - time) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  return formatDate(value)
}

export type DashboardData = {
  counts: Record<CollectionName, { total: number; hidden: number }>
  /** items whose title still has template text like "[Doctor name]" */
  placeholders: { name: CollectionName; count: number }[]
  recent: { name: CollectionName; id: string; title: string; updated: string }[]
}

export async function dashboardData(
  resources: { key: CollectionName; titleField: string }[],
): Promise<DashboardData> {
  await connectDb()
  const PLACEHOLDER = { $regex: '\\[[^\\]]+\\]' }
  const [counts, placeholders, recentLists] = await Promise.all([
    countItems(),
    Promise.all(
      resources.map(async ({ key, titleField }) => ({
        name: key,
        count: await collectionModel(key).countDocuments({ [titleField]: PLACEHOLDER }),
      })),
    ),
    Promise.all(
      resources.map(async ({ key, titleField }) => {
        const docs = await collectionModel(key)
          .find({}, { [titleField]: 1, updatedAt: 1 })
          .sort({ updatedAt: -1 })
          .limit(6)
          .lean()
        return docs.map((doc) => ({
          name: key,
          id: String(doc._id),
          title: String(doc[titleField] ?? ''),
          at: new Date(doc.updatedAt as string).getTime() || 0,
        }))
      }),
    ),
  ])
  const now = Date.now()
  const recent = recentLists
    .flat()
    .sort((a, b) => b.at - a.at)
    .slice(0, 6)
    .map(({ at, ...item }) => ({ ...item, updated: timeAgo(at, now) }))
  return { counts, placeholders: placeholders.filter((p) => p.count > 0), recent }
}
