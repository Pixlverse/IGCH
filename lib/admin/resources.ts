import { z } from 'zod'

import library from '@/content/library.json'
import specialities from '@/content/specialities.json'
import { PROFILE_SECTIONS, TAG_TONES, TONES } from '@/lib/content/schemas'
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
const PROFILE_LABELS: Record<(typeof PROFILE_SECTIONS)[number], string> = {
  overview: 'professional overview',
  education: 'educational qualifications',
  journey: 'professional journey',
  expertise: 'areas of expertise',
  interests: 'clinical interests',
  achievements: 'achievements and contributions',
  research: 'research and publications',
  memberships: 'professional memberships',
  awards: 'awards and recognition',
  approach: 'approach to patient care',
  community: 'community and social contributions',
  beyond: 'beyond medicine',
}

const REQUEST_STATUS_VALUES = ['new', 'contacted', 'confirmed', 'closed'] as const
const REQUEST_STATUS = opts(REQUEST_STATUS_VALUES)

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
      'Doctor cards on the home, About, Specialities and group pages, the /doctors directory and doctor profile pages.',
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
        help: 'Optional. A page or external profile. Ignored when the profile below is filled in.',
      },
      {
        type: 'text',
        name: 'title',
        half: true,
        label: 'Speciality title',
        placeholder: 'Medical & Paediatric Oncologist',
      },
      {
        type: 'text',
        name: 'designation',
        half: true,
        label: 'Designation',
        placeholder: 'Head of Department, Oncology',
      },
      {
        type: 'text',
        name: 'experience',
        half: true,
        label: 'Experience',
        placeholder: '15+ years',
      },
      {
        type: 'text',
        name: 'languages',
        half: true,
        label: 'Languages spoken',
        placeholder: 'English, Malayalam, Hindi',
      },
      {
        type: 'text',
        name: 'timings',
        label: 'OPD timings',
        placeholder: 'Mon, Wed, Fri · 9 am - 1 pm',
        help: 'Shown on the doctor card with the OPD days.',
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
        type: 'text',
        name: 'slug',
        label: 'Profile page address',
        placeholder: 'dr-firstname-lastname',
        help: 'Fill this in and add an introduction to give the doctor a page at /doctors/<address>.',
      },
      {
        type: 'paragraphs',
        name: 'intro',
        label: 'Profile: introduction',
        rows: 4,
        help: 'Separate paragraphs with a blank line.',
      },
      ...PROFILE_SECTIONS.map((name): Field => ({
        type: 'paragraphs',
        name,
        label: `Profile: ${PROFILE_LABELS[name]}`,
        rows: 4,
        help: 'Separate paragraphs with a blank line. Start lines with "- " for a bulleted list; a line just above the bullets becomes its heading. Leave empty to hide.',
      })),
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
      // profile fields are optional: older records and the seed may not have them
      title: text(120).default(''),
      designation: text(120).default(''),
      experience: text(60).default(''),
      languages: text(120).default(''),
      timings: text(200).default(''),
      slug: text(120)
        .toLowerCase()
        .refine((v) => !v || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v), {
          message: 'Use lowercase letters, numbers and hyphens',
        })
        .default(''),
      intro: z.array(text(3000)).default([]),
      ...Object.fromEntries(PROFILE_SECTIONS.map((key) => [key, z.array(text(5000)).default([])])),
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
      { type: 'textarea', name: 'description', label: 'Description', rows: 4 },
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
      description: text(500),
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
        help: 'Landscape photo. Without one, the card shows text only.',
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
        help: 'Optional. Without one, the card shows text only.',
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
    key: 'appointments',
    label: 'Appointment requests',
    singular: 'Appointment request',
    description:
      'Requests from the Book Appointment form. Call the patient to confirm a slot, then update the status.',
    titleField: 'name',
    columns: [
      { field: 'date', label: 'Preferred date' },
      { field: 'doctor', label: 'Doctor' },
      { field: 'status', label: 'Status' },
    ],
    sort: { createdAt: -1 },
    fields: [
      {
        type: 'select',
        name: 'status',
        half: true,
        label: 'Status',
        options: REQUEST_STATUS,
      },
      { type: 'text', name: 'reference', half: true, label: 'Reference', required: true },
      { type: 'text', name: 'name', half: true, label: 'Patient name', required: true },
      { type: 'text', name: 'phone', half: true, label: 'Mobile', required: true },
      { type: 'number', name: 'age', half: true, label: 'Age' },
      { type: 'text', name: 'gender', half: true, label: 'Gender' },
      { type: 'text', name: 'speciality', half: true, label: 'Speciality', suggest: 'departments' },
      { type: 'text', name: 'doctor', half: true, label: 'Doctor' },
      { type: 'text', name: 'date', half: true, label: 'Preferred date', help: 'YYYY-MM-DD' },
      { type: 'text', name: 'slot', half: true, label: 'Preferred time' },
      { type: 'textarea', name: 'reason', label: 'Reason for consultation', rows: 3 },
      { type: 'textarea', name: 'notes', label: 'Staff notes', rows: 3, help: 'Internal only.' },
    ],
    schema: z.object({
      status: z.enum(REQUEST_STATUS_VALUES),
      reference: required('Reference', 20),
      name: required('Patient name', 120),
      phone: required('Mobile', 20),
      age: z.number().int().min(0).max(120),
      gender: text(30),
      speciality: text(120),
      doctor: text(120),
      date: text(10).regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
      slot: text(30),
      reason: text(600),
      notes: text(2000),
      ...listMeta,
    }),
  },
  {
    key: 'messages',
    label: 'Messages',
    singular: 'Message',
    description: 'Messages sent from the Contact page.',
    titleField: 'name',
    columns: [
      { field: 'topic', label: 'Topic' },
      { field: 'status', label: 'Status' },
    ],
    sort: { createdAt: -1 },
    fields: [
      {
        type: 'select',
        name: 'status',
        half: true,
        label: 'Status',
        options: REQUEST_STATUS,
      },
      { type: 'text', name: 'reference', half: true, label: 'Reference', required: true },
      { type: 'text', name: 'name', half: true, label: 'Name', required: true },
      { type: 'text', name: 'phone', half: true, label: 'Mobile', required: true },
      { type: 'text', name: 'email', half: true, label: 'Email' },
      { type: 'text', name: 'topic', half: true, label: 'Topic' },
      { type: 'textarea', name: 'message', label: 'Message', rows: 6, required: true },
      { type: 'textarea', name: 'notes', label: 'Staff notes', rows: 3, help: 'Internal only.' },
    ],
    schema: z.object({
      status: z.enum(REQUEST_STATUS_VALUES),
      reference: required('Reference', 20),
      name: required('Name', 120),
      phone: required('Mobile', 20),
      email: text(160),
      topic: text(60),
      message: required('Message', 2000),
      notes: text(2000),
      ...listMeta,
    }),
  },
  {
    key: 'figures',
    label: 'Key figures',
    singular: 'Key figure',
    description:
      'Numbers shown across the site (dialysis sessions, doctors, beds…). Change a value here and every page that shows it updates.',
    titleField: 'label',
    columns: [
      { field: 'value', label: 'Value' },
      { field: 'note', label: 'Shown on' },
    ],
    sort: { order: 1, createdAt: -1 },
    fields: [
      {
        type: 'text',
        name: 'value',
        half: true,
        label: 'Value',
        required: true,
        placeholder: '15,000+',
        help: 'As it should read, e.g. "15,000+". Sentences like "more than 15,000" drop the "+" automatically.',
      },
      {
        type: 'text',
        name: 'label',
        half: true,
        label: 'Label',
        placeholder: 'Haemodialysis sessions completed',
        help: 'Shown under the number where a page uses it as a stat.',
      },
      {
        type: 'text',
        name: 'key',
        half: true,
        label: 'Key',
        required: true,
        placeholder: 'haemodialysis-sessions',
        help: 'Pages refer to the figure by this key. Do not change or delete a key that is in use.',
      },
      { type: 'text', name: 'note', half: true, label: 'Shown on', help: 'For reference only.' },
      { type: 'number', name: 'order', half: true, label: 'Display order' },
      { type: 'checkbox', name: 'published', half: true, label: 'Visible on the website' },
    ],
    schema: z.object({
      key: slug(),
      value: required('Value', 40),
      label: text(120),
      note: text(160),
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
