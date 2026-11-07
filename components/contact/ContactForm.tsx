'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, type FieldPath } from 'react-hook-form'

import { Icon } from '@/components/icons/Icon'
import { fill } from '@/lib/content/format'
import type { ContactPage } from '@/lib/content/schemas'
import { sendMessage } from '@/lib/requests/actions'
import { MessageSchema, TOPICS, type MessageInput } from '@/lib/requests/schemas'

/** Focus the confirmation once, when it appears (module-level so it never re-runs). */
const focusOnMount = (el: HTMLElement | null) => el?.focus()

/** Contact form: name, mobile, optional email, topic and message. */
export function ContactForm({ copy }: { copy: Pick<ContactPage, 'form' | 'success'> }) {
  const t = (key: string) => copy.form.labels[key] ?? key
  const [done, setDone] = useState<{ reference: string; phone: string } | null>(null)
  const [serverError, setServerError] = useState('')
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MessageInput>({
    resolver: zodResolver(MessageSchema),
    // show errors on send, then re-check each field as it is corrected
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { name: '', phone: '', email: '', message: '', website: '' },
  })

  const onSubmit = async (values: MessageInput) => {
    setServerError('')
    const res = await sendMessage(values)
    if (res.ok) {
      setDone({ reference: res.reference, phone: values.phone })
      return
    }
    setServerError(res.error)
    for (const [name, message] of Object.entries(res.fields ?? {}))
      setError(name as FieldPath<MessageInput>, { message })
  }

  if (done)
    return (
      <div className="booking__done" role="status">
        <span className="booking__done-icon" aria-hidden="true">
          <Icon name="check" />
        </span>
        {/* focus the confirmation so screen readers announce it */}
        <h3 ref={focusOnMount} tabIndex={-1}>
          {copy.success.title}
        </h3>
        <p>{fill(copy.success.body, { phone: done.phone })}</p>
        <p className="booking__ref">
          <small>{copy.success.referenceLabel}</small>
          <strong>{done.reference}</strong>
        </p>
        <button
          type="button"
          className="btn btn--light"
          onClick={() => {
            reset()
            setDone(null)
          }}
        >
          {copy.success.again}
        </button>
      </div>
    )

  const field = (name: FieldPath<MessageInput>) => {
    const error = errors[name as keyof typeof errors]?.message
    return {
      props: {
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? `${name}-error` : undefined,
      },
      error: error ? (
        <p className="field__error" id={`${name}-error`}>
          {String(error)}
        </p>
      ) : null,
    }
  }
  const name = field('name')
  const phone = field('phone')
  const email = field('email')
  const topic = field('topic')
  const message = field('message')
  const consent = field('consent')

  return (
    <form className="field-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="field">
        <label htmlFor="c-name">{t('name')}</label>
        <input id="c-name" autoComplete="name" {...register('name')} {...name.props} />
        {name.error}
      </div>
      <div className="field">
        <label htmlFor="c-phone">{t('phone')}</label>
        <input
          id="c-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          {...register('phone')}
          {...phone.props}
        />
        {phone.error}
      </div>
      <div className="field">
        <label htmlFor="c-email">{t('email')}</label>
        <input
          id="c-email"
          type="email"
          autoComplete="email"
          {...register('email')}
          {...email.props}
        />
        {email.error}
      </div>
      <div className="field">
        <label htmlFor="c-topic">{t('topic')}</label>
        <select id="c-topic" defaultValue="" {...register('topic')} {...topic.props}>
          <option value="" disabled>
            {t('topicNone')}
          </option>
          {TOPICS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        {topic.error}
      </div>
      <div className="field field--wide">
        <label htmlFor="c-message">{t('message')}</label>
        <textarea
          id="c-message"
          rows={5}
          maxLength={2000}
          {...register('message')}
          {...message.props}
        />
        {message.error}
      </div>
      <div className="field field--wide">
        <label className="check">
          <input type="checkbox" {...register('consent')} {...consent.props} />
          <span>{t('consent')}</span>
        </label>
        {consent.error}
      </div>
      <div className="hp" aria-hidden="true">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" {...register('website')} />
        </label>
      </div>
      {serverError && (
        <p className="booking__error field--wide" role="alert">
          {serverError}
        </p>
      )}
      <div className="field--wide">
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {isSubmitting ? t('sending') : t('submit')}
        </button>
      </div>
    </form>
  )
}
