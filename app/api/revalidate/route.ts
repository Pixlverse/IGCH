import { timingSafeEqual } from 'node:crypto'

import { revalidatePath, revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'
import { z } from 'zod'

import { CONTENT_TAG, CONTENT_TAGS, tagFor } from '@/lib/content/tags'

/*
 * On-demand revalidation for the admin panel / CMS webhooks.
 *
 *   POST /api/revalidate
 *   x-revalidate-secret: <REVALIDATE_SECRET>
 *   { "documents": ["doctors"], "paths": ["/"] }
 *
 * `documents` are content keys (see lib/content/tags.ts). An empty body
 * refreshes all content.
 */

const BodySchema = z.object({
  documents: z.array(z.enum(CONTENT_TAGS)).max(CONTENT_TAGS.length).optional(),
  paths: z.array(z.string().startsWith('/').max(512)).max(50).optional(),
})

function authorised(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET
  const given = request.headers.get('x-revalidate-secret')
  if (!secret || !given) return false
  const a = Buffer.from(secret)
  const b = Buffer.from(given)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(request: NextRequest) {
  if (!authorised(request)) {
    return Response.json({ revalidated: false, error: 'Unauthorized' }, { status: 401 })
  }

  const text = await request.text()
  let json: unknown = {}
  try {
    json = text ? JSON.parse(text) : {}
  } catch {
    return Response.json({ revalidated: false, error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) {
    return Response.json(
      { revalidated: false, error: 'Invalid body', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const { documents, paths } = parsed.data
  // Webhooks need the old content gone immediately, not served stale.
  const tags = documents?.length ? documents.map(tagFor) : [CONTENT_TAG]
  tags.forEach((tag) => revalidateTag(tag, { expire: 0 }))
  paths?.forEach((path) => revalidatePath(path))

  return Response.json({ revalidated: true, tags, paths: paths ?? [], now: Date.now() })
}
