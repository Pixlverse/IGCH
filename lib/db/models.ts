import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose'

import { PROFILE_SECTIONS } from '@/lib/content/schemas'

/*
 * Collections the admin panel edits. Page copy (headings, hero text) stays in
 * /content JSON; these are the lists that change week to week.
 * Every list item has `order` (ascending on the site) and `published`.
 */

const image = new Schema(
  {
    src: { type: String, required: true },
    alt: { type: String, default: '' },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  { _id: false },
)

const tag = new Schema(
  { label: { type: String, default: '' }, tone: { type: String, default: 'green' } },
  { _id: false },
)

const listFields = {
  order: { type: Number, default: 0, index: true },
  published: { type: Boolean, default: true },
}

const doctorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    department: { type: String, default: '', trim: true },
    qualifications: { type: String, default: '', trim: true },
    groups: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    days: { type: [String], default: [] },
    image: { type: image, required: false },
    href: { type: String, default: '#' },
    /** profile page /doctors/<slug>; unique when set */
    slug: {
      type: String,
      default: '',
      trim: true,
      index: { unique: true, partialFilterExpression: { slug: { $gt: '' } } },
    },
    title: { type: String, default: '', trim: true },
    designation: { type: String, default: '', trim: true },
    experience: { type: String, default: '', trim: true },
    languages: { type: String, default: '', trim: true },
    timings: { type: String, default: '', trim: true },
    // profile text: lists of blocks (see PROFILE_SECTIONS in lib/content/schemas)
    ...Object.fromEntries(
      ['intro', ...PROFILE_SECTIONS].map((key) => [key, { type: [String], default: [] }]),
    ),
    ...listFields,
  },
  { timestamps: true },
)

const departmentSchema = new Schema(
  {
    group: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    shortName: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    featured: { type: Boolean, default: false },
    badge: { type: tag, default: () => ({}) },
    tone: { type: String, required: false },
    href: { type: String, default: '#' },
    ...listFields,
  },
  { timestamps: true },
)

const newsSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    summary: { type: String, default: '' },
    /** paragraphs; when present the item gets its own /news/<slug> page */
    body: { type: [String], default: [] },
    tag: { type: tag, default: () => ({}) },
    date: { type: Date, required: false },
    readTime: { type: String, default: '' },
    image: { type: image, required: false },
    /** external link used when there is no body */
    link: { type: String, default: '#' },
    featured: { type: Boolean, default: false },
    ...listFields,
  },
  { timestamps: true },
)

const noticeSchema = new Schema(
  {
    kind: { type: String, enum: ['announcement', 'tender'], required: true, index: true },
    title: { type: String, required: true, trim: true },
    /** announcement date / tender closing date */
    date: { type: Date, required: false },
    status: { type: String, default: '' },
    link: { type: String, default: '#' },
    document: {
      type: new Schema({ url: String, name: String }, { _id: false }),
      required: false,
    },
    ...listFields,
  },
  { timestamps: true },
)

const articleSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, default: 'general' },
    summary: { type: String, default: '' },
    body: { type: [String], default: [] },
    readTime: { type: String, default: '' },
    reviewedBy: { type: String, default: '' },
    date: { type: Date, required: false },
    image: { type: image, required: false },
    link: { type: String, default: '#' },
    featured: { type: Boolean, default: false },
    ...listFields,
  },
  { timestamps: true },
)

const faqSchema = new Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: [String], default: [] },
    open: { type: Boolean, default: false },
    ...listFields,
  },
  { timestamps: true },
)

const jobSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    department: { type: String, default: '', trim: true },
    /** Full-time / Part-time / Contract / Internship */
    type: { type: String, default: 'Full-time' },
    location: { type: String, default: '', trim: true },
    experience: { type: String, default: '', trim: true },
    summary: { type: String, default: '' },
    /** paragraphs: responsibilities, qualifications, how to apply */
    body: { type: [String], default: [] },
    /** last date to apply */
    date: { type: Date, required: false },
    /** application form URL or mailto:; empty → the careers email in site settings */
    applyLink: { type: String, default: '' },
    ...listFields,
  },
  { timestamps: true },
)

/** Key figures used in page copy as {{key}} (e.g. "15,000+" haemodialysis sessions). */
const figureSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: String, required: true, trim: true },
    label: { type: String, default: '', trim: true },
    /** admin-only: where the figure appears */
    note: { type: String, default: '', trim: true },
    ...listFields,
  },
  { timestamps: true },
)

const requestStatus = {
  type: String,
  enum: ['new', 'contacted', 'confirmed', 'closed'],
  default: 'new',
}

/** Appointment requests from /book-appointment (the desk calls back to confirm). */
const appointmentSchema = new Schema(
  {
    reference: { type: String, required: true, unique: true },
    speciality: { type: String, default: '' },
    doctor: { type: String, default: '' },
    date: { type: String, required: true },
    slot: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, default: '' },
    reason: { type: String, default: '' },
    status: requestStatus,
    /** staff notes, never shown on the site */
    notes: { type: String, default: '' },
    ...listFields,
  },
  { timestamps: true },
)

/** Messages from the /contact form. */
const messageSchema = new Schema(
  {
    reference: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    topic: { type: String, default: '' },
    message: { type: String, required: true },
    status: requestStatus,
    notes: { type: String, default: '' },
    ...listFields,
  },
  { timestamps: true },
)

/** Singleton documents (key "site"): stored whole, validated by the content schema. */
const settingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true, minimize: false },
)

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    lastLoginAt: { type: Date, required: false },
    failedLogins: { type: Number, default: 0 },
    lockedUntil: { type: Date, required: false },
  },
  { timestamps: true },
)

function model<S extends Schema>(name: string, schema: S): Model<InferSchemaType<S>> {
  // reuse the compiled model across dev hot reloads
  return (mongoose.models[name] as Model<InferSchemaType<S>>) ?? mongoose.model(name, schema)
}

export const Doctor = model('Doctor', doctorSchema)
export const Department = model('Department', departmentSchema)
export const NewsItem = model('NewsItem', newsSchema)
export const Notice = model('Notice', noticeSchema)
export const Article = model('Article', articleSchema)
export const Faq = model('Faq', faqSchema)
export const Job = model('Job', jobSchema)
export const Figure = model('Figure', figureSchema)
export const Appointment = model('Appointment', appointmentSchema)
export const Message = model('Message', messageSchema)
export const Setting = model('Setting', settingSchema)
export const User = model('User', userSchema)

/** Content collections, keyed by the name used in /content/seed and the admin. */
export const COLLECTIONS = {
  doctors: Doctor,
  departments: Department,
  news: NewsItem,
  notices: Notice,
  articles: Article,
  faqs: Faq,
  careers: Job,
  figures: Figure,
  appointments: Appointment,
  messages: Message,
} as const
export type CollectionName = keyof typeof COLLECTIONS

/**
 * A collection's model with a loose document type. The generic admin and the
 * content reader work on plain records; the per-collection schemas above and
 * the admin resource schemas do the validation.
 */
export function collectionModel(name: CollectionName): Model<Record<string, unknown>> {
  return COLLECTIONS[name] as unknown as Model<Record<string, unknown>>
}
