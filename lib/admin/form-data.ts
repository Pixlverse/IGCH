import 'server-only'

import { slugify } from '@/lib/content/format'

import type { Field } from './resources'

/*
 * Turns a submitted admin form into a plain object shaped like the resource
 * schema. Uploads (image/document fields) are returned separately so the
 * action can store them only after validation passes.
 */

export type Uploads = {
  images: { name: string; file: File | null; alt: string; remove: boolean }[]
  documents: { name: string; file: File | null; remove: boolean }[]
}

const str = (fd: FormData, name: string) => {
  const value = fd.get(name)
  return typeof value === 'string' ? value.trim() : ''
}
const file = (fd: FormData, name: string) => {
  const value = fd.get(name)
  return value instanceof File && value.size > 0 ? value : null
}

/** "2026-10-25" (from <input type=date>) → midnight in India time. */
function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00+05:30`)
  return Number.isNaN(date.getTime()) ? null : date
}

export function parseForm(fields: Field[], fd: FormData) {
  const data: Record<string, unknown> = {}
  const uploads: Uploads = { images: [], documents: [] }
  for (const field of fields) {
    const { name } = field
    switch (field.type) {
      case 'text':
      case 'textarea':
        data[name] = str(fd, name)
        break
      case 'slug':
        data[name] = str(fd, name) || slugify(str(fd, field.from))
        break
      case 'paragraphs':
        data[name] = str(fd, name)
          .split(/\r?\n\s*\r?\n/)
          .map((p) => p.trim())
          .filter(Boolean)
        break
      case 'number':
        data[name] = Number(str(fd, name) || 0)
        break
      case 'checkbox':
        data[name] = fd.get(name) === 'on'
        break
      case 'checkboxes':
        data[name] = fd.getAll(name).filter((v): v is string => typeof v === 'string')
        break
      case 'select':
        data[name] = str(fd, name) || (field.optional ? undefined : '')
        break
      case 'date':
        data[name] = parseDate(str(fd, name))
        break
      case 'tag':
        data[name] = { label: str(fd, `${name}.label`), tone: str(fd, `${name}.tone`) || 'green' }
        break
      case 'image':
        uploads.images.push({
          name,
          file: file(fd, `${name}.file`),
          alt: str(fd, `${name}.alt`),
          remove: fd.get(`${name}.remove`) === 'on',
        })
        break
      case 'document':
        uploads.documents.push({
          name,
          file: file(fd, `${name}.file`),
          remove: fd.get(`${name}.remove`) === 'on',
        })
        break
    }
  }
  return { data, uploads }
}
