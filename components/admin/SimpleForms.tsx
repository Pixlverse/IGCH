'use client'

import { useActionState } from 'react'

import {
  changePassword,
  createUser,
  login,
  saveSettings,
  type FormState,
} from '@/lib/admin/actions'

import { FormMessage, SubmitButton } from './FormBits'

type Values = Record<string, string>

function Input({
  name,
  label,
  state,
  defaultValue,
  type = 'text',
  help,
  autoComplete,
  textarea,
}: {
  name: string
  label: string
  state: FormState
  defaultValue?: string
  type?: string
  help?: string
  autoComplete?: string
  textarea?: boolean
}) {
  const id = `f-${name}`
  const err = state.errors?.[name]
  const submitted = state.values?.[name]
  const value = typeof submitted === 'string' ? submitted : defaultValue
  const describedBy =
    [help && `${id}-help`, err && `${id}-err`].filter(Boolean).join(' ') || undefined
  const common = {
    id,
    name,
    defaultValue: value,
    'aria-describedby': describedBy,
    'aria-invalid': err ? true : undefined,
  }
  return (
    <div className="admin-field">
      <label htmlFor={id}>{label}</label>
      {textarea ? (
        <textarea rows={3} {...common} />
      ) : (
        <input type={type} autoComplete={autoComplete} {...common} />
      )}
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
    </div>
  )
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(login, {})
  return (
    <form action={action} className="admin-form" noValidate>
      <FormMessage state={state} />
      <input type="hidden" name="next" value={next ?? ''} />
      <Input name="email" label="Email" type="email" autoComplete="username" state={state} />
      <Input
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        state={state}
      />
      <div className="admin-actions">
        <SubmitButton>Sign in</SubmitButton>
      </div>
    </form>
  )
}

export function SettingsForm({ initial }: { initial: Values }) {
  const [state, action] = useActionState(saveSettings, {})
  const f = (name: string, label: string, help?: string, textarea?: boolean) => (
    <Input
      name={name}
      label={label}
      help={help}
      state={state}
      defaultValue={initial[name]}
      textarea={textarea}
    />
  )
  return (
    <form action={action} className="admin-form" noValidate>
      <FormMessage state={state} />
      <fieldset className="admin-group">
        <legend>Announcement bar</legend>
        {f(
          'announcementLabel',
          'Message',
          'Shown above the header on every page. Leave empty to hide it.',
        )}
        {f('announcementBadge', 'Badge', 'e.g. NEW')}
        {f('announcementHref', 'Link')}
      </fieldset>
      <fieldset className="admin-group">
        <legend>Emergency & booking</legend>
        {f(
          'phoneDisplay',
          'Emergency phone',
          'As shown on the site, e.g. 0484 294 1600. Call links are updated automatically.',
        )}
        {f(
          'phoneInternational',
          'Phone in international format',
          'For search engines, e.g. +91-484-294-1600',
        )}
        {f('hours', 'Opening hours line')}
        {f('bookingLabel', 'Booking button text')}
        {f('bookingHref', 'Booking link', 'Online booking page, or a site path.')}
      </fieldset>
      <fieldset className="admin-group">
        <legend>Address & registration</legend>
        {f('addressFull', 'Full address', undefined, true)}
        {f('shortAddress', 'Short address', 'Shown in the announcement bar.')}
        {f('postalCode', 'PIN code')}
        {f('unitLine', 'Society line', 'Shown in the footer.')}
        {f('accreditations', 'Accreditations', 'One per line, e.g. NABH Accredited.', true)}
      </fieldset>
      <fieldset className="admin-group">
        <legend>Careers</legend>
        {f(
          'careersEmail',
          'Careers / HR email',
          '"Send your CV" on the Careers page opens an email to this address.',
        )}
      </fieldset>
      <fieldset className="admin-group">
        <legend>Social links</legend>
        {f('social.Facebook', 'Facebook URL')}
        {f('social.Instagram', 'Instagram URL')}
        {f('social.YouTube', 'YouTube URL', 'Leave a link empty to hide it.')}
      </fieldset>
      <div className="admin-actions">
        <SubmitButton>Save settings</SubmitButton>
      </div>
    </form>
  )
}

export function NewUserForm() {
  const [state, action] = useActionState(createUser, {})
  return (
    <form action={action} className="admin-form" noValidate>
      <FormMessage state={state} />
      <Input name="name" label="Name" state={state} />
      <Input name="email" label="Email" type="email" autoComplete="off" state={state} />
      <Input
        name="password"
        label="Temporary password"
        type="password"
        autoComplete="new-password"
        help="At least 10 characters. Share it privately; they can change it under My account."
        state={state}
      />
      <div className="admin-actions">
        <SubmitButton>Add user</SubmitButton>
      </div>
    </form>
  )
}

export function PasswordForm() {
  const [state, action] = useActionState(changePassword, {})
  return (
    <form key={state.ok ? 'done' : 'edit'} action={action} className="admin-form" noValidate>
      <FormMessage state={state} />
      <Input
        name="current"
        label="Current password"
        type="password"
        autoComplete="current-password"
        state={state}
      />
      <Input
        name="next"
        label="New password"
        type="password"
        autoComplete="new-password"
        help="At least 10 characters."
        state={state}
      />
      <Input
        name="confirm"
        label="Repeat new password"
        type="password"
        autoComplete="new-password"
        state={state}
      />
      <div className="admin-actions">
        <SubmitButton>Change password</SubmitButton>
      </div>
    </form>
  )
}
