'use client'

import clsx from 'clsx'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { AdminIcon } from './AdminIcon'

const MAX_BYTES = 3 * 1024 * 1024

const formatSize = (bytes: number) =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`

/**
 * File picker for an image or PDF field: shows what is stored now, lets the
 * editor upload a replacement or mark the current file for removal, and
 * previews the new choice before saving. Submits `<name>.file` and
 * `<name>.remove` (see lib/admin/form-data.ts).
 */
export function UploadField({
  name,
  label,
  kind,
  current,
  currentName,
  describedBy,
  error,
  children,
}: {
  name: string
  label: string
  kind: 'image' | 'document'
  /** URL of the stored file, if any */
  current?: string
  /** stored document file name */
  currentName?: string
  describedBy?: string
  error?: ReactNode
  /** extra inputs under the picker (alt text) */
  children?: ReactNode
}) {
  const input = useRef<HTMLInputElement>(null)
  const [picked, setPicked] = useState<{ name: string; size: number; preview?: string } | null>(
    null,
  )
  const [removing, setRemoving] = useState(false)
  const [tooBig, setTooBig] = useState(false)

  // free the object URL of a previous preview
  useEffect(() => () => void (picked?.preview && URL.revokeObjectURL(picked.preview)), [picked])

  const choose = (file: File | undefined) => {
    setTooBig(false)
    if (!file) return setPicked(null)
    if (file.size > MAX_BYTES) {
      setTooBig(true)
      if (input.current) input.current.value = ''
      return setPicked(null)
    }
    setRemoving(false)
    setPicked({
      name: file.name,
      size: file.size,
      preview: kind === 'image' ? URL.createObjectURL(file) : undefined,
    })
  }
  const clearPick = () => {
    if (input.current) input.current.value = ''
    setPicked(null)
  }

  const shownImage = picked?.preview ?? (!removing ? current : undefined)
  const hasFile = Boolean(picked || (current && !removing))
  const isImage = kind === 'image'
  const noun = isImage ? 'image' : 'document'

  let status: string
  if (picked)
    status = `New ${noun} selected: ${picked.name} (${formatSize(picked.size)}). Saved when you save the form.`
  else if (removing) status = `The current ${noun} will be removed when you save.`
  else if (current) status = isImage ? 'Current image' : currentName || 'Current document'
  else status = isImage ? 'No image yet' : 'No document yet'

  return (
    <fieldset className="admin-field admin-upload">
      <legend>{label}</legend>
      <div className={clsx('admin-upload__box', removing && 'is-removing', picked && 'is-new')}>
        {isImage ? (
          <div className="admin-upload__thumb">
            {shownImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- local preview / any uploaded URL
              <img src={shownImage} alt="" />
            ) : (
              <AdminIcon name="image" />
            )}
          </div>
        ) : (
          <div className="admin-upload__thumb admin-upload__thumb--doc">
            <AdminIcon name="file" />
          </div>
        )}

        <div className="admin-upload__body">
          <p className="admin-upload__status" aria-live="polite">
            {current && !picked && !removing && !isImage ? (
              <a href={current} target="_blank" rel="noreferrer">
                {status}
              </a>
            ) : (
              status
            )}
          </p>
          <div className="admin-upload__actions">
            <label className="admin-btn admin-btn--ghost admin-btn--sm">
              <AdminIcon name="upload" />
              {hasFile ? `Replace ${noun}` : `Upload ${noun}`}
              <input
                ref={input}
                type="file"
                name={`${name}.file`}
                className="visually-hidden"
                accept={isImage ? 'image/jpeg,image/png,image/webp,image/avif' : 'application/pdf'}
                aria-describedby={describedBy}
                onChange={(e) => choose(e.target.files?.[0])}
              />
            </label>
            {picked && (
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--sm"
                onClick={clearPick}
              >
                Cancel
              </button>
            )}
            {current && !picked && (
              <button
                type="button"
                className={clsx(
                  'admin-btn admin-btn--sm',
                  removing ? 'admin-btn--ghost' : 'admin-btn--danger',
                )}
                aria-pressed={removing}
                onClick={() => setRemoving((r) => !r)}
              >
                {removing ? (
                  'Undo remove'
                ) : (
                  <>
                    <AdminIcon name="trash" /> Remove
                  </>
                )}
              </button>
            )}
          </div>
          <p className="admin-help">{isImage ? 'JPG, PNG, WebP or AVIF' : 'PDF'}, up to 3 MB.</p>
        </div>
        {removing && <input type="hidden" name={`${name}.remove`} value="on" />}
      </div>
      {tooBig && (
        <p className="admin-error" role="alert">
          That file is larger than 3 MB. Please choose a smaller one.
        </p>
      )}
      {children}
      {error}
    </fieldset>
  )
}
