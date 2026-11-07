'use server'

import { randomBytes } from 'node:crypto'
import { appendFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

import { updateTag } from 'next/cache'
import type { z } from 'zod'

import { tagFor } from '@/lib/content/tags'
import { collectionModel } from '@/lib/db/models'
import { connectDb, isDbConfigured } from '@/lib/db/mongo'

import { AppointmentSchema, MessageSchema, type RequestResult } from './schemas'

/** Short, readable reference the desk can quote back, e.g. "AP-7K3Q9D". */
const reference = (prefix: string) =>
  `${prefix}-${randomBytes(4).toString('base64url').replace(/[-_]/g, '').slice(0, 6).toUpperCase()}`

/**
 * Stores a request: MongoDB when configured (staff see it in /admin), else a
 * JSON-lines file in .data/ for local development. Throws when neither works.
 */
async function store(collection: 'appointments' | 'messages', record: Record<string, unknown>) {
  if (isDbConfigured()) {
    await connectDb()
    await collectionModel(collection).create(record)
    updateTag(tagFor(collection))
    return
  }
  if (process.env.VERCEL) throw new Error('No database configured for requests')
  const dir = join(process.cwd(), '.data')
  await mkdir(dir, { recursive: true })
  await appendFile(
    join(dir, `${collection}.jsonl`),
    JSON.stringify({ ...record, createdAt: new Date().toISOString() }) + '\n',
  )
}

function invalid(error: z.ZodError): RequestResult {
  const fields = Object.fromEntries(error.issues.map((i) => [i.path.join('.'), i.message]))
  return { ok: false, error: 'Please check the highlighted fields.', fields }
}

const FAILED: RequestResult = {
  ok: false,
  error: 'We could not send your request just now. Please call the hospital instead.',
}

export async function requestAppointment(input: unknown): Promise<RequestResult> {
  const parsed = AppointmentSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  const { website, consent, ...data } = parsed.data
  void consent
  // a filled honeypot is a bot: pretend success, store nothing
  if (website) return { ok: true, reference: reference('AP') }
  const ref = reference('AP')
  try {
    await store('appointments', {
      ...data,
      age: Number(data.age),
      reference: ref,
      status: 'new',
      order: 0,
      published: true,
    })
  } catch (error) {
    console.error('[requests] appointment not stored', error)
    return FAILED
  }
  return { ok: true, reference: ref }
}

export async function sendMessage(input: unknown): Promise<RequestResult> {
  const parsed = MessageSchema.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)
  const { website, consent, ...data } = parsed.data
  void consent
  if (website) return { ok: true, reference: reference('MS') }
  const ref = reference('MS')
  try {
    await store('messages', { ...data, reference: ref, status: 'new', order: 0, published: true })
  } catch (error) {
    console.error('[requests] message not stored', error)
    return FAILED
  }
  return { ok: true, reference: ref }
}
