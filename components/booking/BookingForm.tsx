'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import { useCallback, useEffect, useState } from 'react'
import { useForm, useWatch, type FieldPath } from 'react-hook-form'

import { Icon } from '@/components/icons/Icon'
import { fill } from '@/lib/content/format'
import type { BookingPage } from '@/lib/content/schemas'
import { requestAppointment } from '@/lib/requests/actions'
import {
  AppointmentSchema,
  GENDERS,
  kochiDate,
  SLOTS,
  type AppointmentInput,
} from '@/lib/requests/schemas'

type Values = AppointmentInput
type DoctorOption = { name: string; department: string }

/** Fields checked before leaving each step (the last step submits everything). */
const STEP_FIELDS: FieldPath<Values>[][] = [
  ['speciality', 'doctor'],
  ['date', 'slot'],
  ['name', 'phone', 'age', 'gender', 'reason', 'consent'],
  [],
]

/**
 * Four-step appointment request: doctor → date and time → patient details →
 * review. Each step is validated before moving on; the server validates again.
 * `?doctor=<name>` (from a doctor card) pre-selects the doctor.
 */
export function BookingForm({
  copy,
  specialities,
  doctors,
}: {
  copy: Pick<BookingPage, 'steps' | 'labels' | 'success'>
  specialities: string[]
  doctors: DoctorOption[]
}) {
  const t = (key: string, fallback = key) => copy.labels[key] ?? fallback
  const [step, setStep] = useState(0)
  const [result, setResult] = useState<{ reference: string; phone: string } | null>(null)
  const [serverError, setServerError] = useState('')
  // after the first step change, each new step's heading takes focus (announced by screen readers)
  const [moved, setMoved] = useState(false)
  // stable callback: a new function each render would re-run on every keystroke
  // and pull focus out of the field being typed in; it runs only when a step's
  // heading mounts (each step heading has its own key)
  const focusHeading = useCallback(
    (el: HTMLHeadingElement | null) => {
      if (el && moved) el.focus()
    },
    [moved],
  )

  const {
    register,
    handleSubmit,
    trigger,
    control,
    setValue,
    setError,
    reset,
    getValues,
    getFieldState,
    subscribe,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(AppointmentSchema),
    // errors appear when Continue is pressed and clear as soon as the field is
    // fixed; validating on blur would move the buttons under the pointer
    mode: 'onSubmit',
    defaultValues: {
      speciality: '',
      doctor: '',
      date: '',
      slot: undefined,
      name: '',
      phone: '',
      age: '',
      gender: '',
      reason: '',
      website: '',
    },
  })

  // a doctor card links here with ?doctor=…: pre-select the doctor and speciality
  useEffect(() => {
    const name = new URLSearchParams(window.location.search).get('doctor')
    const match = doctors.find((d) => d.name === name)
    if (!match) return
    setValue('speciality', match.department)
    setValue('doctor', match.name)
  }, [doctors, setValue])

  // re-check a field that shows an error as soon as its value changes
  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        callback: ({ name }) => {
          if (name && getFieldState(name as FieldPath<Values>).error)
            void trigger(name as FieldPath<Values>)
        },
      }),
    [subscribe, getFieldState, trigger],
  )

  const speciality = useWatch({ control, name: 'speciality' })
  const choices = doctors.filter((d) => !speciality || d.department === speciality)

  const go = (next: number) => {
    setMoved(true)
    setStep(next)
  }
  const nextStep = async () => {
    if (await trigger(STEP_FIELDS[step])) go(step + 1)
  }

  const lastStep = copy.steps.length - 1
  const onSubmit = async (values: Values) => {
    // only the review step sends; Enter on an earlier step just moves on
    if (step < lastStep) return nextStep()
    setServerError('')
    const res = await requestAppointment(values)
    if (res.ok) {
      setMoved(true)
      setResult({ reference: res.reference, phone: values.phone })
      return
    }
    setServerError(res.error)
    for (const [name, message] of Object.entries(res.fields ?? {}))
      setError(name as FieldPath<Values>, { message })
    // jump back to the first step with a problem
    const bad = STEP_FIELDS.findIndex((fields) => fields.some((f) => res.fields?.[f]))
    if (bad >= 0) go(bad)
  }

  if (result)
    return (
      <div className="booking__done" role="status">
        <span className="booking__done-icon" aria-hidden="true">
          <Icon name="check" />
        </span>
        <h2 ref={focusHeading} tabIndex={-1}>
          {copy.success.title}
        </h2>
        <p>{fill(copy.success.body, { phone: result.phone })}</p>
        <p className="booking__ref">
          <small>{copy.success.referenceLabel}</small>
          <strong>{result.reference}</strong>
        </p>
        {copy.success.note && <p className="booking__muted">{copy.success.note}</p>}
        <button
          type="button"
          className="btn btn--light"
          onClick={() => {
            reset()
            setResult(null)
            go(0)
          }}
        >
          {copy.success.again}
        </button>
      </div>
    )

  const err = (name: FieldPath<Values>) => {
    const message = errors[name as keyof typeof errors]?.message
    return message ? (
      <p className="field__error" id={`${name}-error`}>
        {String(message)}
      </p>
    ) : null
  }
  const aria = (name: FieldPath<Values>, hint = false) => ({
    'aria-invalid': errors[name as keyof typeof errors] ? true : undefined,
    'aria-describedby':
      [errors[name as keyof typeof errors] && `${name}-error`, hint && `${name}-hint`]
        .filter(Boolean)
        .join(' ') || undefined,
  })
  const values = getValues()
  const current = copy.steps[step]

  return (
    <form className="booking__form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <ol className="stepper" aria-label="Booking steps">
        {copy.steps.map((s, i) => (
          <li
            key={s.title}
            className={clsx(i === step && 'is-current', i < step && 'is-done')}
            aria-current={i === step ? 'step' : undefined}
          >
            <span className="stepper__no">{i < step ? <Icon name="check" /> : i + 1}</span>
            <span className="stepper__text">
              <strong>{s.title}</strong>
              <small>{s.hint}</small>
            </span>
          </li>
        ))}
      </ol>

      <div className="booking__panel">
        <p className="booking__count">
          {fill(t('stepOf', 'Step {step} of {total}'), {
            step: step + 1,
            total: copy.steps.length,
          })}
        </p>
        <h2 key={step} ref={focusHeading} tabIndex={-1} className="booking__title">
          {current?.title}
        </h2>

        {step === 0 && (
          <div className="field-grid">
            <div className="field">
              <label htmlFor="speciality">{t('speciality')}</label>
              <select
                id="speciality"
                {...register('speciality', {
                  onChange: (e) => {
                    const doctor = getValues('doctor')
                    if (
                      doctor &&
                      !doctors.some((d) => d.name === doctor && d.department === e.target.value)
                    )
                      setValue('doctor', '')
                  },
                })}
              >
                <option value="">{t('anySpeciality')}</option>
                {specialities.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="doctor">{t('doctor')}</label>
              <select id="doctor" {...register('doctor')} {...aria('doctor', true)}>
                <option value="">{t('anyDoctor')}</option>
                {choices.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name} · {d.department}
                  </option>
                ))}
              </select>
              <p className="field__hint" id="doctor-hint">
                {t('doctorHint')}
              </p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="field-grid">
            <div className="field">
              <label htmlFor="date">{t('date')}</label>
              <input
                id="date"
                type="date"
                min={kochiDate()}
                max={kochiDate(90)}
                {...register('date')}
                {...aria('date')}
              />
              {err('date')}
            </div>
            <fieldset className="field field--wide" {...aria('slot', true)}>
              <legend>{t('slot')}</legend>
              <div className="slots">
                {SLOTS.map((slot) => (
                  <label key={slot} className="slot">
                    <input type="radio" value={slot} {...register('slot')} />
                    <span>{t(`slot.${slot}`, slot)}</span>
                  </label>
                ))}
              </div>
              <p className="field__hint" id="slot-hint">
                {t('slotHint')}
              </p>
              {err('slot')}
            </fieldset>
          </div>
        )}

        {step === 2 && (
          <div className="field-grid">
            <div className="field field--wide">
              <label htmlFor="name">{t('name')}</label>
              <input id="name" autoComplete="name" {...register('name')} {...aria('name')} />
              {err('name')}
            </div>
            <div className="field">
              <label htmlFor="phone">{t('phone')}</label>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="98765 43210"
                {...register('phone')}
                {...aria('phone', true)}
              />
              <p className="field__hint" id="phone-hint">
                {t('phoneHint')}
              </p>
              {err('phone')}
            </div>
            <div className="field field--pair">
              <div className="field">
                <label htmlFor="age">{t('age')}</label>
                <input
                  id="age"
                  inputMode="numeric"
                  maxLength={3}
                  {...register('age')}
                  {...aria('age')}
                />
                {err('age')}
              </div>
              <div className="field">
                <label htmlFor="gender">{t('gender')}</label>
                <select id="gender" {...register('gender')}>
                  <option value="">{t('genderNone')}</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field field--wide">
              <label htmlFor="reason">{t('reason')}</label>
              <textarea
                id="reason"
                rows={3}
                maxLength={600}
                placeholder={t('reasonPlaceholder', '')}
                {...register('reason')}
              />
            </div>
            <div className="field field--wide">
              <label className="check">
                <input type="checkbox" {...register('consent')} {...aria('consent')} />
                <span>{t('consent')}</span>
              </label>
              {err('consent')}
            </div>
            {/* honeypot for bots: hidden from people and assistive tech */}
            <div className="hp" aria-hidden="true">
              <label>
                Website
                <input tabIndex={-1} autoComplete="off" {...register('website')} />
              </label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="review">
            <p className="booking__muted">{t('review')}</p>
            {[
              {
                step: 0,
                rows: [
                  [t('speciality'), values.speciality || t('anySpeciality')],
                  [t('doctor'), values.doctor || t('anyDoctor')],
                ],
              },
              {
                step: 1,
                rows: [
                  [
                    t('date'),
                    values.date
                      ? new Date(`${values.date}T00:00`).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '',
                  ],
                  [t('slot'), values.slot ? t(`slot.${values.slot}`, values.slot) : ''],
                ],
              },
              {
                step: 2,
                rows: [
                  [t('name'), values.name],
                  [t('phone'), values.phone],
                  [t('age'), [values.age, values.gender].filter(Boolean).join(' · ')],
                  ...(values.reason ? [[t('reason'), values.reason]] : []),
                ],
              },
            ].map((group) => (
              <div key={group.step} className="review__group">
                <dl>
                  {group.rows.map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <button type="button" className="review__edit" onClick={() => go(group.step)}>
                  {t('edit')}
                </button>
              </div>
            ))}
          </div>
        )}

        {serverError && (
          <p className="booking__error" role="alert">
            {serverError}
          </p>
        )}

        <div className="booking__nav">
          {step > 0 && (
            <button type="button" className="btn btn--light" onClick={() => go(step - 1)}>
              {t('back')}
            </button>
          )}
          {step < copy.steps.length - 1 ? (
            // distinct keys: React must not turn this same button into the submit button
            // mid-click, or the click would submit the form and skip the review step
            <button key="next" type="button" className="btn btn--dark" onClick={nextStep}>
              {t('next')} <Icon name="arrow" />
            </button>
          ) : (
            <button key="submit" type="submit" className="btn btn--primary" disabled={isSubmitting}>
              {isSubmitting ? t('sending') : t('submit')}
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
