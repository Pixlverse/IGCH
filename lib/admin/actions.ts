'use server'

import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { endSession, getCurrentUser, LOGIN_PATH, requireUser, startSession } from '@/lib/auth/dal'
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from '@/lib/auth/password'
import { tagFor } from '@/lib/content/tags'
import { collectionModel, Setting, User } from '@/lib/db/models'
import { connectDb } from '@/lib/db/mongo'

import { pageOf } from './data'
import { parseForm } from './form-data'
import { getResource } from './resources'
import { settingsFromForm } from './settings'
import { UploadError, uploadDocument, uploadImage } from './storage'

/*
 * Every action authorises itself (requireUser) — server actions are public
 * HTTP endpoints, so the page being protected is not enough.
 */

export type FormState = {
  ok?: boolean
  message?: string
  errors?: Record<string, string>
  /** submitted values, so the form keeps them when validation fails */
  values?: Record<string, string | string[]>
}

const rawValues = (fd: FormData) => {
  const values: Record<string, string | string[]> = {}
  for (const key of new Set(fd.keys())) {
    if (key.startsWith('$')) continue
    const all = fd.getAll(key).filter((v): v is string => typeof v === 'string')
    values[key] = all.length > 1 ? all : (all[0] ?? '')
  }
  return values
}

const fieldErrors = (error: z.ZodError) =>
  Object.fromEntries(error.issues.map((issue) => [issue.path.join('.') || 'form', issue.message]))

const isDuplicateKey = (error: unknown) =>
  typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000

// ---------- auth ----------

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
})

const MAX_FAILED_LOGINS = 5
const LOCK_MINUTES = 15
// verified against when the email is unknown, so timing does not reveal accounts
const DUMMY_HASH =
  'scrypt$16384$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=='

export async function login(_prev: FormState, fd: FormData): Promise<FormState> {
  const parsed = LoginSchema.safeParse({ email: fd.get('email'), password: fd.get('password') })
  const values = { email: String(fd.get('email') ?? '') }
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values }

  await connectDb()
  const user = await User.findOne({ email: parsed.data.email })
  if (user?.lockedUntil && user.lockedUntil > new Date())
    return { message: `Too many attempts. Try again in ${LOCK_MINUTES} minutes.`, values }

  const valid = await verifyPassword(parsed.data.password, user?.passwordHash ?? DUMMY_HASH)
  if (!user || !valid) {
    if (user) {
      user.failedLogins = (user.failedLogins ?? 0) + 1
      if (user.failedLogins >= MAX_FAILED_LOGINS) {
        user.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60_000)
        user.failedLogins = 0
      }
      await user.save()
    }
    return { message: 'Email or password is incorrect.', values }
  }

  user.failedLogins = 0
  user.lockedUntil = undefined
  user.lastLoginAt = new Date()
  await user.save()
  await startSession(String(user._id))

  const next = String(fd.get('next') ?? '')
  redirect(next.startsWith('/admin') && !next.startsWith('//') ? next : '/admin')
}

export async function logout() {
  await endSession()
  redirect(LOGIN_PATH)
}

// ---------- content lists ----------

export async function saveItem(
  resourceKey: string,
  id: string | null,
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await requireUser()
  const resource = getResource(resourceKey)
  if (!resource) return { message: 'Unknown section.' }

  const values = rawValues(fd)
  const { data, uploads } = parseForm(resource.fields, fd)
  const parsed = resource.schema.safeParse(data)
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values }

  await connectDb()
  const model = collectionModel(resource.key)
  const existing = id
    ? await model
        .findById(id)
        .lean()
        .catch(() => null)
    : null
  if (id && !existing) return { message: 'This item no longer exists.', values }

  const update: Record<string, unknown> = { ...(parsed.data as object) }
  const unset: Record<string, ''> = {}
  try {
    for (const upload of uploads.images) {
      const current = (existing as Record<string, unknown> | null)?.[upload.name] as
        Record<string, unknown> | undefined
      if (upload.file) update[upload.name] = await uploadImage(upload.file, upload.alt)
      else if (upload.remove) unset[upload.name] = ''
      else if (current) update[upload.name] = { ...current, alt: upload.alt }
    }
    for (const upload of uploads.documents) {
      if (upload.file) update[upload.name] = await uploadDocument(upload.file)
      else if (upload.remove) unset[upload.name] = ''
    }
  } catch (error) {
    if (error instanceof UploadError) return { message: error.message, values }
    console.error('[admin] upload failed', error)
    return { message: 'Upload failed. Please try again.', values }
  }
  // optional selects left empty are removed rather than stored as ''
  for (const [key, value] of Object.entries(update))
    if (value === undefined) {
      delete update[key]
      unset[key] = ''
    }

  let savedId = id ?? ''
  try {
    if (id)
      await model.updateOne(
        { _id: id },
        { $set: update, ...(Object.keys(unset).length && { $unset: unset }) },
      )
    else savedId = String((await model.create(update))._id)
  } catch (error) {
    if (isDuplicateKey(error))
      return { errors: { slug: 'Another item already uses this URL slug.' }, values }
    throw error
  }

  updateTag(tagFor(resource.key))
  // open the list on the page that shows the saved item, highlighted
  const page = await pageOf(resource.key, savedId, resource.sort)
  redirect(`/admin/${resource.key}?saved=${savedId}${page > 1 ? `&page=${page}` : ''}`)
}

export async function deleteItem(resourceKey: string, id: string) {
  await requireUser()
  const resource = getResource(resourceKey)
  if (!resource) return
  await connectDb()
  await collectionModel(resource.key).deleteOne({ _id: id })
  updateTag(tagFor(resource.key))
  redirect(`/admin/${resource.key}?deleted=1`)
}

/** Quick show/hide from the list without opening the form. */
export async function togglePublished(resourceKey: string, id: string, published: boolean) {
  await requireUser()
  const resource = getResource(resourceKey)
  if (!resource) return
  await connectDb()
  await collectionModel(resource.key).updateOne({ _id: id }, { $set: { published } })
  updateTag(tagFor(resource.key))
}

// ---------- site settings ----------

export async function saveSettings(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireUser()
  await connectDb()
  const current = await Setting.findOne({ key: 'site' }).lean()
  const result = settingsFromForm(current?.data ?? null, fd)
  if (!result.ok) return { errors: result.errors, values: rawValues(fd) }
  await Setting.updateOne({ key: 'site' }, { $set: { data: result.data } }, { upsert: true })
  // header, footer and contact details on every page
  updateTag(tagFor('site'))
  return { ok: true, message: 'Settings saved. The website is updated.' }
}

// ---------- users ----------

const password = () =>
  z.string().min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`).max(200)

const NewUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: password(),
})

export async function createUser(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireUser()
  const values = { name: String(fd.get('name') ?? ''), email: String(fd.get('email') ?? '') }
  const parsed = NewUserSchema.safeParse({
    name: fd.get('name'),
    email: fd.get('email'),
    password: fd.get('password'),
  })
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values }
  await connectDb()
  try {
    await User.create({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
    })
  } catch (error) {
    if (isDuplicateKey(error))
      return { errors: { email: 'A user with this email already exists.' }, values }
    throw error
  }
  redirect('/admin/users?saved=1')
}

export async function deleteUser(id: string) {
  const me = await requireUser()
  if (me.id === id) return
  await connectDb()
  // never remove the last account, or nobody could sign in again
  if ((await User.countDocuments()) <= 1) return
  await User.deleteOne({ _id: id })
  redirect('/admin/users?deleted=1')
}

const ChangePasswordSchema = z
  .object({
    current: z.string().min(1, 'Enter your current password'),
    next: password(),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { path: ['confirm'], message: 'Passwords do not match' })

export async function changePassword(_prev: FormState, fd: FormData): Promise<FormState> {
  const me = await getCurrentUser()
  if (!me) redirect(LOGIN_PATH)
  const parsed = ChangePasswordSchema.safeParse({
    current: fd.get('current'),
    next: fd.get('next'),
    confirm: fd.get('confirm'),
  })
  if (!parsed.success) return { errors: fieldErrors(parsed.error) }
  await connectDb()
  const user = await User.findById(me.id)
  if (!user || !(await verifyPassword(parsed.data.current, user.passwordHash)))
    return { errors: { current: 'Current password is incorrect' } }
  user.passwordHash = await hashPassword(parsed.data.next)
  await user.save()
  return { ok: true, message: 'Password changed.' }
}
