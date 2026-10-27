import 'server-only'

import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'
import sharp from 'sharp'

import type { Image } from '@/lib/content/schemas'

/*
 * File uploads from the admin.
 *
 * - Production: Cloudinary (set CLOUDINARY_URL=cloudinary://key:secret@cloud).
 * - Local development without Cloudinary: files are written to .data/uploads
 *   and served by app/uploads/[file]/route.ts (public/ is only read at build
 *   time by `next start`). Not available on Vercel (read-only filesystem).
 */

export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const FOLDER = 'igch'

export class UploadError extends Error {}

const cloudinaryEnabled = () => Boolean(process.env.CLOUDINARY_URL)

function assertUploadsAvailable() {
  if (!cloudinaryEnabled() && process.env.VERCEL)
    throw new UploadError(
      'Uploads need Cloudinary: set CLOUDINARY_URL in the Vercel project settings.',
    )
}

function checkFile(file: File, types: string[], label: string) {
  if (!types.includes(file.type))
    throw new UploadError(`${label} must be ${types.map((t) => t.split('/')[1]).join(', ')}.`)
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError(`${label} must be 3 MB or smaller.`)
}

function toCloudinary(buffer: Buffer, resourceType: 'image' | 'raw', filename: string) {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: FOLDER,
          resource_type: resourceType,
          // raw files keep their extension so browsers open PDFs correctly
          ...(resourceType === 'raw' && { public_id: `${randomUUID()}-${safeName(filename)}` }),
        },
        (error, result) =>
          error || !result ? reject(error ?? new Error('Upload failed')) : resolve(result),
      )
      .end(buffer)
  })
}

const safeName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .slice(-80)

export const LOCAL_UPLOAD_DIR = join(process.cwd(), '.data', 'uploads')

async function toLocalUploads(buffer: Buffer, filename: string) {
  await mkdir(LOCAL_UPLOAD_DIR, { recursive: true })
  const name = `${randomUUID().slice(0, 8)}-${safeName(filename)}`
  await writeFile(join(LOCAL_UPLOAD_DIR, name), buffer)
  return `/uploads/${name}`
}

/** Uploads a photo and returns it with its intrinsic size (for next/image). */
export async function uploadImage(file: File, alt: string): Promise<Image> {
  assertUploadsAvailable()
  checkFile(file, IMAGE_TYPES, 'Image')
  const buffer = Buffer.from(await file.arrayBuffer())
  if (cloudinaryEnabled()) {
    const result = await toCloudinary(buffer, 'image', file.name)
    return { src: result.secure_url, width: result.width, height: result.height, alt }
  }
  const { width, height } = await sharp(buffer).metadata()
  if (!width || !height) throw new UploadError('Could not read the image size.')
  return { src: await toLocalUploads(buffer, file.name), width, height, alt }
}

/** Uploads a PDF (notice / tender document). */
export async function uploadDocument(file: File): Promise<{ url: string; name: string }> {
  assertUploadsAvailable()
  checkFile(file, ['application/pdf'], 'Document')
  const buffer = Buffer.from(await file.arrayBuffer())
  const url = cloudinaryEnabled()
    ? (await toCloudinary(buffer, 'raw', file.name)).secure_url
    : await toLocalUploads(buffer, file.name)
  return { url, name: file.name }
}
