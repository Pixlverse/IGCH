'use client'

import clsx from 'clsx'
import { useId, useRef, useState, useTransition, type ReactNode } from 'react'

import { AdminIcon, type AdminIconName } from './AdminIcon'

type Tone = 'danger' | 'default'

/**
 * A button that asks for confirmation in an in-page modal before running a
 * server action. Built on <dialog>: focus is trapped, Esc and the backdrop
 * cancel, and focus returns to the button afterwards.
 */
export function ConfirmAction({
  action,
  title,
  message,
  confirmLabel,
  tone = 'default',
  icon,
  children,
  className,
  ...buttonProps
}: {
  /** a bound server action */
  action: () => Promise<void>
  title: string
  message: ReactNode
  confirmLabel: string
  tone?: Tone
  /** icon in the modal header */
  icon?: AdminIconName
  /** trigger button content */
  children: ReactNode
  className?: string
  'aria-label'?: string
  'aria-pressed'?: boolean
  /** native tooltip on the trigger */
  tooltip?: string
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [pending, startTransition] = useTransition()
  const [failed, setFailed] = useState(false)
  const id = useId()
  const { tooltip, ...ariaProps } = buttonProps

  const open = () => {
    setFailed(false)
    dialog.current?.showModal()
  }
  const close = () => {
    if (!pending) dialog.current?.close()
  }
  const confirm = () =>
    startTransition(async () => {
      try {
        // a redirecting action navigates away; others re-render the page in place
        await action()
        dialog.current?.close()
      } catch (error) {
        // redirect() is delivered as a thrown control-flow error: let Next handle it
        if (error && typeof error === 'object' && 'digest' in error) throw error
        setFailed(true)
      }
    })

  return (
    <>
      <button type="button" className={className} onClick={open} title={tooltip} {...ariaProps}>
        {children}
      </button>
      <dialog
        ref={dialog}
        className={clsx('admin-modal', `admin-modal--${tone}`)}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-message`}
        onCancel={(event) => pending && event.preventDefault()}
        // a click on the backdrop lands on the <dialog> element itself
        onClick={(event) => event.target === event.currentTarget && close()}
      >
        <div className="admin-modal__card">
          <span className="admin-modal__icon" aria-hidden="true">
            <AdminIcon name={icon ?? (tone === 'danger' ? 'trash' : 'alert')} />
          </span>
          <h2 id={`${id}-title`}>{title}</h2>
          <div id={`${id}-message`} className="admin-modal__message">
            {message}
          </div>
          {failed && (
            <p className="admin-error" role="alert">
              Something went wrong. Please try again.
            </p>
          )}
          <div className="admin-modal__actions">
            {/* Cancel gets focus first, so Enter never confirms by accident */}
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={close}
              autoFocus
              disabled={pending}
            >
              Cancel
            </button>
            <button
              type="button"
              className={clsx(
                'admin-btn',
                tone === 'danger' ? 'admin-btn--solid-danger' : 'admin-btn--primary',
              )}
              onClick={confirm}
              disabled={pending}
              aria-busy={pending}
            >
              {pending ? 'Working…' : confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}
