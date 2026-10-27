import type { CollectionName } from '@/lib/db/models'

import type { DocumentKey } from './source'

/** Tag attached to every content entry — revalidate it to refresh everything. */
export const CONTENT_TAG = 'content'

export type ContentKey = DocumentKey | CollectionName | 'site'

export const CONTENT_TAGS = [
  // page copy (JSON)
  'navigation',
  'home',
  'centres',
  'specialities',
  'guide',
  'facilities',
  'news',
  'notices',
  'about',
  'specialitiesHub',
  'specialityGroups',
  'library',
  'newsPage',
  'facilitiesPage',
  // admin-managed (MongoDB)
  'site',
  'doctors',
  'departments',
  'articles',
  'faqs',
  'careers',
] as const satisfies readonly ContentKey[]

export const tagFor = (key: ContentKey) => `content:${key}`
