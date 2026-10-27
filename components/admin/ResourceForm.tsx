'use client'

import clsx from 'clsx'
import { useActionState } from 'react'

import type { FormState } from '@/lib/admin/actions'
import type { FormValues } from '@/lib/admin/data'
import { TAG_TONE_OPTIONS, type Field } from '@/lib/admin/resources'

import { FormMessage, SubmitButton } from './FormBits'
import { UploadField } from './UploadField'

type Action = (prev: FormState, fd: FormData) => Promise<FormState>

const str = (v: string | string[] | undefined) => (typeof v === 'string' && v ? v : undefined)

/**
 * Generic admin form: renders fields from a resource definition and submits
 * to a server action. On a validation error the submitted values come back
 * in `state.values`, and the form is remounted with them.
 */
export function ResourceForm({
  action,
  fields,
  initial,
  suggestions = {},
  submitLabel,
}: {
  action: Action
  fields: Field[]
  initial: FormValues
  suggestions?: Partial<Record<'departments', string[]>>
  submitLabel: string
}) {
  const [state, formAction] = useActionState(action, {})
  const submitted = state.values
  // after a failed submit, read what was sent (unchecked boxes are simply absent)
  const value = (name: string) => (submitted ? (submitted[name] ?? '') : (initial[name] ?? ''))
  const text = (name: string) => {
    const v = value(name)
    return Array.isArray(v) ? (v[0] ?? '') : v
  }
  const list = (name: string) => {
    const v = value(name)
    return Array.isArray(v) ? v : v ? [v] : []
  }
  const error = (name: string) => state.errors?.[name]
  const formKey = submitted ? JSON.stringify(submitted) : 'initial'

  return (
    <form key={formKey} action={formAction} className="admin-form" noValidate>
      <FormMessage state={state} />
      {fields.map((field) => {
        const id = `f-${field.name}`
        const width = field.half ? 'admin-field--half' : undefined
        const err = error(field.name)
        const help = 'help' in field && field.help
        const describedBy =
          [help && `${id}-help`, err && `${id}-err`].filter(Boolean).join(' ') || undefined
        const meta = (
          <>
            {help && (
              <p className="admin-help" id={`${id}-help`}>
                {help}
              </p>
            )}
            {err && (
              <p className="admin-error" id={`${id}-err`}>
                {err}
              </p>
            )}
          </>
        )

        switch (field.type) {
          case 'checkbox':
            return (
              <div key={field.name} className={clsx('admin-field admin-field--check', width)}>
                <label>
                  <input
                    type="checkbox"
                    name={field.name}
                    defaultChecked={text(field.name) === 'on'}
                    aria-describedby={describedBy}
                  />
                  {field.label}
                </label>
                {meta}
              </div>
            )
          case 'checkboxes':
            return (
              <fieldset key={field.name} className={clsx('admin-field', width)}>
                <legend>{field.label}</legend>
                <div className="admin-checks">
                  {field.options.map((option) => (
                    <label key={option.value}>
                      <input
                        type="checkbox"
                        name={field.name}
                        value={option.value}
                        defaultChecked={list(field.name).includes(option.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                {meta}
              </fieldset>
            )
          case 'select':
            return (
              <div key={field.name} className={clsx('admin-field', width)}>
                <label htmlFor={id}>{field.label}</label>
                <select
                  id={id}
                  name={field.name}
                  defaultValue={text(field.name)}
                  aria-describedby={describedBy}
                >
                  {field.optional && <option value="">Automatic</option>}
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {meta}
              </div>
            )
          case 'tag':
            return (
              <fieldset key={field.name} className={clsx('admin-field', width)}>
                <legend>{field.label}</legend>
                <div className="admin-row">
                  <input
                    name={`${field.name}.label`}
                    defaultValue={text(`${field.name}.label`)}
                    placeholder="Label"
                    aria-label={`${field.label} text`}
                  />
                  <select
                    name={`${field.name}.tone`}
                    defaultValue={text(`${field.name}.tone`) || 'green'}
                    aria-label={`${field.label} colour`}
                  >
                    {TAG_TONE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {meta}
              </fieldset>
            )
          case 'image':
            return (
              <UploadField
                key={field.name}
                name={field.name}
                label={field.label}
                kind="image"
                current={str(initial[`${field.name}.src`])}
                describedBy={describedBy}
                error={meta}
              >
                <div className="admin-field">
                  <label htmlFor={`${id}-alt`}>Image description (alt text)</label>
                  <input
                    id={`${id}-alt`}
                    name={`${field.name}.alt`}
                    defaultValue={text(`${field.name}.alt`)}
                    placeholder="e.g. Portrait of Dr. … in a white coat"
                  />
                </div>
              </UploadField>
            )
          case 'document':
            return (
              <UploadField
                key={field.name}
                name={field.name}
                label={field.label}
                kind="document"
                current={str(initial[`${field.name}.url`])}
                currentName={str(initial[`${field.name}.name`])}
                describedBy={describedBy}
                error={meta}
              />
            )
          case 'textarea':
          case 'paragraphs':
            return (
              <div key={field.name} className={clsx('admin-field', width)}>
                <label htmlFor={id}>{field.label}</label>
                <textarea
                  id={id}
                  name={field.name}
                  rows={field.rows ?? 4}
                  defaultValue={text(field.name)}
                  aria-describedby={describedBy}
                  aria-invalid={err ? true : undefined}
                />
                {meta}
              </div>
            )
          default: {
            const suggest =
              field.type === 'text' && field.suggest ? suggestions[field.suggest] : undefined
            return (
              <div key={field.name} className={clsx('admin-field', width)}>
                <label htmlFor={id}>
                  {field.label}
                  {field.type === 'text' && field.required && <span aria-hidden="true"> *</span>}
                </label>
                <input
                  id={id}
                  name={field.name}
                  type={
                    field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'
                  }
                  defaultValue={text(field.name)}
                  placeholder={field.type === 'text' ? field.placeholder : undefined}
                  list={suggest ? `${id}-list` : undefined}
                  aria-describedby={describedBy}
                  aria-invalid={err ? true : undefined}
                  required={field.type === 'text' && field.required}
                />
                {suggest && (
                  <datalist id={`${id}-list`}>
                    {suggest.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                )}
                {meta}
              </div>
            )
          }
        }
      })}
      <div className="admin-actions">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  )
}
