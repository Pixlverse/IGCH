'use client'

import clsx from 'clsx'
import type { ReactNode } from 'react'
import { useFormStatus } from 'react-dom'

import type { FormState } from '@/lib/admin/actions'

export function SubmitButton({
  children,
  variant = 'primary',
}: {
  children: ReactNode
  variant?: 'primary' | 'danger'
}) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      className={clsx('admin-btn', `admin-btn--${variant}`)}
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? 'Saving…' : children}
    </button>
  )
}

/** Form-level success / error message, announced to screen readers. */
export function FormMessage({ state }: { state: FormState }) {
  const fieldCount = Object.keys(state.errors ?? {}).length
  const message = state.message ?? (fieldCount > 0 ? 'Please fix the highlighted fields.' : '')
  if (!message) return null
  return (
    <p
      className={clsx('admin-alert', state.ok ? 'admin-alert--ok' : 'admin-alert--error')}
      role={state.ok ? 'status' : 'alert'}
    >
      {message}
    </p>
  )
}
