import { z } from 'zod'

import library from '@/content/library.json'
import specialities from '@/content/specialities.json'
import { ILLUSTRATIONS, TAG_TONES, TONES } from '@/lib/content/schemas'
import type { CollectionName } from '@/lib/db/models'

/*
 * Declarative description of every admin-managed list. The generic admin
 * pages render forms and tables from this, and the server actions validate
 * with `schema`. Safe to import on the client (no server code here).
 */

type Option = { value: string; label: string }

/** Layout: `half` puts the field in one of two columns (short inputs side by side). */
type Layout = { half?: boolean }

export type Field = Layout &
  (
    | {
        type: 'text'
        name: string
        label: string
        required?: boolean
        help?: string
        placeholder?: string
        suggest?: 'departments'
      }
    | { type: 'slug'; name: string; label: string; from: string; help?: string }
    | {
        type: 'textarea'
        name: string
        label: string
        rows?: number
        help?: string
        required?: boolean
      }
    /** blank-line separated paragraphs, stored as string[] */
    | { type: 'paragraphs'; name: string; label: string; rows?: number; help?: string }
    | { type: 'number'; name: string; label: string; help?: string }
    | { type: 'checkbox'; name: string; label: string; help?: string }
    | { type: 'checkboxes'; name: string; label: string; options: Option[]; help?: string }
    | {
        type: 'select'
        name: string
        label: string
        options: Option[]
        help?: string
        optional?: boolean
      }
    | { type: 'date'; name: string; label: string; help?: string }
    | { type: 'tag'; name: string; label: string; help?: string }
    | { type: 'image'; name: string; label: string; help?: string }
    | { type: 'document'; name: string; label: string; help?: string }
  )

export type Resource = {
  key: CollectionName
  label: string
  singular: string
  description: string
  /** field shown as the row title in the list */
  titleField: string
  /** extra list columns: field name → heading */
  columns: { field: string; label: string }[]
  fields: Field[]
  schema: z.ZodType
  /** admin list order (default: display order, newest first) */
  sort?: Record<string, 1 | -1>
}

const opts = (values: readonly string[]): Option[] =>
  values.map((value) => ({ value, label: value[0]!.toUpperCase() + value.slice(1) }))

const GROUPS: Option[] = specialities.groups.map((g) => ({ value: g.slug, label: g.title }))
const CATEGORIES: Option[] = library.categories.map((c) => ({ value: c.key, label: c.label }))
const DAYS = opts(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
const ILLUSTRATION_OPTIONS = opts(ILLUSTRATIONS)
/** Tone choices for the badge/tag field. */
export const TAG_TONE_OPTIONS = opts(TAG_TONES)

// ---------- shared validation pieces ----------

const text = (max = 300) => z.string().trim().max(max)
const required = (label: string, max = 300) => text(max).min(1, `${label} is required`)
const link = () =>
  text(500)
    .refine((v) => !v || v === '#' || v.startsWith('/') || /^https?:\/\//.test(v), {
      message: 'Use a full URL (https://…), a site path (/news) or leave empty',
    })
    .transform((v) => v || '#')
const slug = () =>
  z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens')
const tag = () => z.object({ label: text(60), tone: z.enum(TAG_TONES) })
const listMeta = {
  order: z.number().int().min(0).max(100000),
  published: z.boolean(),
}

export const RESOURCES: Resource[] = [
  {
    key: 'doctors',
    label: 'Doctors',
    singular: 'Doctor',
    description:
      'Doctor cards on the home, About, Specialities and group pages, and the doctor finder.',
    titleField: 'name',
    columns: [
      { field: 'department', label: 'Speciality' },
      { field: 'featured', label: 'Featured' },
    ],
    fields: [
      {
        type: 'text',
        name: 'name',
        half: true,
        label: 'Name',
        required: true,
        placeholder: 'Dr. …',
      },
      {
        type: 'text',
        name: 'department',
        half: true,
        label: 'Speciality',
        suggest: 'departments',
        help: 'Shown under the name and used by the doctor finder.',
      },
      {
        type: 'text',
        name: 'qualifications',
        half: true,
        label: 'Qualifications',
        placeholder: 'MBBS, MD (General Medicine)',
      },
      {
        type: 'text',
        name: 'href',
        half: true,
        label: 'Profile link',
        help: 'Optional. A page or external profile.',
      },
      {
        type: 'image',
        name: 'image',
        label: 'Photo',
        help: 'Portrait, at least 600 px wide. Without a photo an illustrated avatar is shown.',
      },
      {
        type: 'checkboxes',
        name: 'groups',
        label: 'Listed under',
        options: GROUPS,
        help: 'Speciality group pages that show this doctor.',
      },
      {
        type: 'checkbox',
        name: 'featured',
        label: 'Featured doctor',
        help: 'Shown on the home and About pages and before a doctor-finder search.',
      },
      {
        type: 'checkboxes',
        name: 'days',
        label: 'OPD days',
        options: DAYS,
        help: 'Leave all unticked if not fixed.',
      },
      {
        type: 'number',
        name: 'order',
        half: true,
        label: 'Display order',
        help: 'Lower numbers come first.',
      },
      { type: 'checkbox', name: 'published', half: true, label: 'Visible on the website' },
    ],
    schema: z.object({
      name: required('Name', 120),
      department: text(120),
      qualifications: text(200),
      groups: z.array(z.enum(GROUPS.map((g) => g.value) as [string, ...string[]])),
      featured: z.boolean(),
      days: z.array(z.string()),
      href: link(),
      ...listMeta,
    }),
  },
  {
    key: 'departments',
    sort: { group: 1, order: 1, createdAt: -1 },
    label: 'Departments',
    singular: 'Department',
    description:
      'Department cards on the Specialities pages and the home-page department explorer.',
    titleField: 'name',
    columns: [
      { field: 'group', label: 'Group' },
      { field: 'featured', label: 'On hub card' },
    ],
    fields: [
      { type: 'select', name: 'group', half: true, label: 'Group', options: GROUPS },
      { type: 'text', name: 'name', half: true, label: 'Name', required: true },
      {
        type: 'text',
        name: 'shortName',
        half: true,
        label: 'Short name',
        help: 'Optional, e.g. "CTVS". Used on cards and chips.',
      },
      { type: 'textarea', name: 'description', label: 'One-line description', rows: 2 },
      {
        type: 'checkbox',
        name: 'featured',
        label: 'Show as a chip on the /specialities group card',
      },
      {
        type: 'tag',
        name: 'badge',
        half: true,
        label: 'Badge',
        help: 'Optional, e.g. "New" (tone: lime) or "24/7" (tone: emergency).',
      },
      {
        type: 'select',
        name: 'tone',
        half: true,
        label: 'Icon colour',
        options: opts(TONES),
        optional: true,
        help: 'Leave as automatic to follow the page palette.',
      },
      { type: 'text', name: 'href', half: true, label: 'Department page link', help: 'Optional.' },
      { type: 'number', name: 'order', half: true, label: 'Display order' },
      { type: 'checkbox', name: 'published', half: true, label: 'Visible on the website' },
    ],
    schema: z.object({
      group: z.enum(GROUPS.map((g) => g.value) as [string, ...string[]]),
      name: required('Name', 120),
      shortName: text(40),
      description: text(200),
      featured: z.boolean(),
      badge: tag(),
      tone: z.enum(TONES).optional(),
      href: link(),
      ...listMeta,
    }),
  },
  {
    key: 'news',
    label: 'News',
    singular: 'News story',
    description: 'News & Updates page and the home-page news block. The featured story leads both.',
    titleField: 'title',
    columns: [
      { field: 'date', label: 'Date' },
      { field: 'featured', label: 'Featured' },
    ],
    fields: [
      { type: 'text', name: 'title', label: 'Headline', required: true },
      {
        type: 'slug',
        name: 'slug',
        half: true,
        label: 'URL slug',
        from: 'title',
        help: 'Used in /news/<slug>. Generated from the headline if empty.',
      },
      { type: 'date', name: 'date', half: true, label: 'Date' },
      {
        type: 'textarea',
        name: 'summary',
        label: 'Summary',
        rows: 3,
        help: 'One or two sentences shown on cards.',
      },
      {
        type: 'paragraphs',
        name: 'body',
        label: 'Full story',
        rows: 10,
        help: 'Separate paragraphs with a blank line. With a story, the card opens its own page.',
      },
      {
        type: 'tag',
        name: 'tag',
        half: true,
        label: 'Tag',
        help: 'e.g. "Cardiology" (tone: red).',
      },
      { type: 'text', name: 'readTime', half: true, label: 'Read time', placeholder: '3 min read' },
      {
        type: 'image',
        name: 'image',
        label: 'Image',
        help: 'Landscape photo. Without one, the illustration below is used.',
      },
      {
        type: 'select',
        name: 'illustration',
        half: true,
        label: 'Illustration',
        options: ILLUSTRATION_OPTIONS,
      },
      {
        type: 'text',
        name: 'link',
        half: true,
        label: 'External link',
        help: 'Used only when there is no full story.',
      },
      { type: 'checkbox', name: 'featured', label: 'Featured story' },
      {
        type: 'number',
        name: 'order',
        half: true,
        label: 'Display order',
        help: 'Lower numbers come first.',
      },
      { type: 'checkbox', name: 'published', half: true, label: 'Visible on the website' },
    ],
    schema: z.object({
      title: required('Headline', 200),
      slug: slug(),
      date: z.date().nullable(),
      summary: text(600),
      body: z.array(text(5000)),
      tag: tag(),
      readTime: text(30),
      illustration: z.enum(ILLUSTRATIONS),
      link: link(),
      featured: z.boolean(),
      ...listMeta,
    }),
  },
  {
    key: 'notices',
    label: 'Notices & tenders',
    singular: 'Notice',
    description: 'Notice board on the home and News pages: announcements and tenders (with PDF).',
    titleField: 'title',
    columns: [
      { field: 'kind', label: 'Type' },
      { field: 'date', label: 'Date' },
    ],
    fields: [
      {
        type: 'select',
        name: 'kind',
        half: true,
        label: 'Type',
        options: opts(['announcement', 'tender']),
      },
      { type: 'text', name: 'title', label: 'Title', required: true },
      {
        type: 'date',
        name: 'date',
        half: true,
        label: 'Date',
        help: 'Announcement date, or the closing date for a tender.',
      },
      {
        type: 'text',
        name: 'status',
        half: true,
        label: 'Tender status',
        placeholder: 'Open',
        help: 'Tenders only, e.g. Open / Closed.',
      },
      {
        type: 'document',
        name: 'document',
        label: 'Document (PDF)',
        help: 'The notice or tender document. Opens when the notice is clicked.',
      },
      {
        type: 'text',
        name: 'link',
        half: true,
        label: 'Link',
        help: 'Used when there is no document.',
      },
      { type: 'number', name: 'order', half: true, label: 'Display order' },
      { type: 'checkbox', name: 'published', half: true, label: 'Visible on the website' },
    ],
    schema: z.object({
      kind: z.enum(['announcement', 'tender']),
      title: required('Title', 200),
      date: z.date().nullable(),
      status: text(30),
      link: link(),
      ...listMeta,
    }),
  },
  {
    key: 'articles',
    label: 'Wellness articles',
    singular: 'Article',
    description:
      'Wellness Library, the home-page article cards and the speciality page reading lists.',
    titleField: 'title',
    columns: [
      { field: 'category', label: 'Topic' },
      { field: 'featured', label: 'Featured' },
    ],
    fields: [
      { type: 'text', name: 'title', label: 'Title', required: true },
      {
        type: 'slug',
        name: 'slug',
        half: true,
        label: 'URL slug',
        from: 'title',
        help: 'Used in /wellness-library/<slug>.',
      },
      { type: 'select', name: 'category', half: true, label: 'Topic', options: CATEGORIES },
      { type: 'textarea', name: 'summary', label: 'Summary', rows: 3 },
      {
        type: 'paragraphs',
        name: 'body',
        label: 'Article',
        rows: 14,
        help: 'Separate paragraphs with a blank line.',
      },
      { type: 'text', name: 'readTime', half: true, label: 'Read time', placeholder: '5 min read' },
      {
        type: 'text',
        name: 'reviewedBy',
        half: true,
        label: 'Medical review line',
        placeholder: 'Reviewed by Dr. …, Cardiology',
      },
      { type: 'date', name: 'date', half: true, label: 'Published on' },
      {
        type: 'image',
        name: 'image',
        label: 'Image',
        help: 'Optional. Without one, the topic illustration is used.',
      },
      { type: 'checkbox', name: 'featured', label: 'Featured at the top of the Wellness Library' },
      {
        type: 'text',
        name: 'link',
        half: true,
        label: 'External link',
        help: 'Used only when there is no article text.',
      },
      { type: 'number', name: 'order', half: true, label: 'Display order' },
      { type: 'checkbox', name: 'published', half: true, label: 'Visible on the website' },
    ],
    schema: z.object({
      title: required('Title', 200),
      slug: slug(),
      category: z.enum(CATEGORIES.map((c) => c.value) as [string, ...string[]]),
      summary: text(600),
      body: z.array(text(10000)),
      readTime: text(30),
      reviewedBy: text(120),
      date: z.date().nullable(),
      featured: z.boolean(),
      link: link(),
      ...listMeta,
    }),
  },
  {
    key: 'faqs',
    label: 'FAQs',
    singular: 'FAQ',
    description:
      'Frequently asked questions on the home page (also published as FAQ structured data).',
    titleField: 'question',
    columns: [{ field: 'open', label: 'Open by default' }],
    fields: [
      { type: 'text', name: 'question', label: 'Question', required: true },
      {
        type: 'paragraphs',
        name: 'answer',
        label: 'Answer',
        rows: 6,
        help: 'Separate paragraphs with a blank line.',
      },
      { type: 'checkbox', name: 'open', label: 'Open by default' },
      { type: 'number', name: 'order', half: true, label: 'Display order' },
      { type: 'checkbox', name: 'published', half: true, label: 'Visible on the website' },
    ],
    schema: z.object({
      question: required('Question', 300),
      answer: z.array(text(3000)).min(1, 'Answer is required'),
      open: z.boolean(),
      ...listMeta,
    }),
  },
  {
    key: 'careers',
    label: 'Careers',
    singular: 'Job opening',
    description: 'Job openings on the Careers page, linked from About and the footer.',
    titleField: 'title',
    columns: [
      { field: 'department', label: 'Department' },
      { field: 'date', label: 'Apply by' },
    ],
    fields: [
      {
        type: 'text',
        name: 'title',
        label: 'Job title',
        required: true,
        placeholder: 'Staff Nurse – ICU',
      },
      { type: 'text', name: 'department', label: 'Department', half: true, suggest: 'departments' },
      {
        type: 'select',
        name: 'type',
        label: 'Employment type',
        half: true,
        options: opts(['Full-time', 'Part-time', 'Contract', 'Internship']),
      },
      {
        type: 'text',
        name: 'location',
        label: 'Location',
        half: true,
        placeholder: 'Kadavanthra, Kochi',
      },
      {
        type: 'text',
        name: 'experience',
        label: 'Experience',
        half: true,
        placeholder: '2+ years',
      },
      { type: 'date', name: 'date', label: 'Last date to apply', half: true },
      {
        type: 'text',
        name: 'applyLink',
        label: 'Apply link',
        half: true,
        help: 'Form URL or mailto:. Leave empty to use the careers email from Site settings.',
      },
      {
        type: 'textarea',
        name: 'summary',
        label: 'Summary',
        rows: 3,
        help: 'One or two sentences shown on the card.',
      },
      {
        type: 'paragraphs',
        name: 'body',
        label: 'Full description',
        rows: 10,
        help: 'Responsibilities, qualifications, how to apply. Separate paragraphs with a blank line.',
      },
      { type: 'number', name: 'order', label: 'Display order', half: true },
      { type: 'checkbox', name: 'published', label: 'Visible on the website', half: true },
    ],
    schema: z.object({
      title: required('Job title', 160),
      department: text(120),
      type: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']),
      location: text(120),
      experience: text(80),
      date: z.date().nullable(),
      applyLink: text(500).refine((v) => !v || /^(https?:\/\/|mailto:|\/)/.test(v), {
        message: 'Use a full URL (https://…), mailto:… or leave empty',
      }),
      summary: text(600),
      body: z.array(text(5000)),
      ...listMeta,
    }),
  },
]

export const getResource = (key: string) => RESOURCES.find((r) => r.key === key)
