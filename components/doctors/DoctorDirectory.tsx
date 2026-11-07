'use client'

import clsx from 'clsx'
import { useMemo, useState, useSyncExternalStore } from 'react'

import { SmartLink } from '@/components/ui/SmartLink'
import { fill } from '@/lib/content/format'
import type { Doctor, DoctorsPage } from '@/lib/content/schemas'

import { DoctorProfileCard } from './DoctorProfileCard'

const TODAY = 'today'

/** Weekday name in Kochi, e.g. "Monday". */
const kochiToday = () =>
  new Date().toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'Asia/Kolkata' })

type Filters = { query: string; quick: string; speciality: string; day: string }
const EMPTY: Filters = { query: '', quick: '', speciality: '', day: '' }

// Browser-only values read without an effect; the server render sees ''.
const noSubscribe = () => () => {}
const useBrowserValue = (read: () => string) => useSyncExternalStore(noSubscribe, read, () => '')
const readQuery = () => new URLSearchParams(window.location.search).get('q') ?? ''

function matches(doctor: Doctor, filters: Filters, today: string) {
  const dept = doctor.department.toLowerCase()
  const query = filters.query.trim().toLowerCase()
  if (query && !doctor.name.toLowerCase().includes(query) && !dept.includes(query)) return false
  if (filters.quick && !dept.includes(filters.quick.toLowerCase())) return false
  if (filters.speciality && doctor.department !== filters.speciality) return false
  // no OPD days on record means "ask us", so the doctor stays in the list
  const day = filters.day === TODAY ? today : filters.day
  if (day && doctor.days.length > 0 && !doctor.days.includes(day)) return false
  return true
}

/**
 * /doctors: search by name or speciality, quick speciality chips, and filters
 * for speciality and consultation day. `?q=` pre-fills the search.
 */
export function DoctorDirectory({
  copy,
  labels,
  doctors,
  bookingHref,
}: {
  copy: DoctorsPage['directory']
  labels: DoctorsPage['card']
  doctors: Doctor[]
  bookingHref: string
}) {
  // `query: null` until the visitor types: falls back to the `?q=` in the URL
  const [state, setFilters] = useState<Omit<Filters, 'query'> & { query: string | null }>({
    ...EMPTY,
    query: null,
  })
  const urlQuery = useBrowserValue(readQuery)
  // the weekday is only known in the browser (the prerender must not guess it)
  const today = useBrowserValue(kochiToday)
  const filters: Filters = { ...state, query: state.query ?? urlQuery }

  const specialities = useMemo(
    () => [...new Set(doctors.map((d) => d.department).filter(Boolean))].sort(),
    [doctors],
  )
  const shown = doctors.filter((doctor) => matches(doctor, filters, today))
  const filtered = Object.values(filters).some(Boolean)
  const set = (patch: Partial<Filters>) => setFilters((current) => ({ ...current, ...patch }))

  return (
    <section className="section section--tight" id="directory">
      <div className="directory" data-reveal="">
        <div className="directory__head">
          <h2 className="h2 h2--sm">{copy.heading}</h2>
          {copy.lead && <p>{copy.lead}</p>}
        </div>

        <form className="directory__search" role="search" onSubmit={(e) => e.preventDefault()}>
          <label className="directory__query">
            <span className="visually-hidden">{copy.searchLabel}</span>
            <input
              type="search"
              value={filters.query}
              placeholder={copy.searchPlaceholder}
              maxLength={100}
              onChange={(e) => set({ query: e.target.value })}
            />
          </label>
          <label>
            <span>{copy.specialityLabel}</span>
            <select
              value={filters.speciality}
              onChange={(e) => set({ speciality: e.target.value, quick: '' })}
            >
              <option value="">{copy.allSpecialities}</option>
              {specialities.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{copy.availabilityLabel}</span>
            <select value={filters.day} onChange={(e) => set({ day: e.target.value })}>
              <option value="">{copy.anyDay}</option>
              {copy.todayOption && <option value={TODAY}>{copy.todayOption}</option>}
              {copy.days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </label>
        </form>

        {copy.quick.length > 0 && (
          <div className="directory__quick" role="group" aria-label={copy.quickLabel}>
            {copy.quick.map((chip) =>
              chip.href ? (
                <SmartLink key={chip.label} href={chip.href} className="chip chip--link">
                  {chip.label}
                </SmartLink>
              ) : (
                <button
                  key={chip.label}
                  type="button"
                  className={clsx('chip', filters.quick === chip.match && 'chip--active')}
                  aria-pressed={filters.quick === chip.match}
                  onClick={() =>
                    set({ quick: filters.quick === chip.match ? '' : chip.match, speciality: '' })
                  }
                >
                  {chip.label}
                </button>
              ),
            )}
            {filtered && (
              <button type="button" className="chip chip--reset" onClick={() => setFilters(EMPTY)}>
                {copy.resetLabel}
              </button>
            )}
          </div>
        )}
      </div>

      <p className="visually-hidden" role="status">
        {filtered ? fill(copy.resultsLabel, { count: shown.length }) : ''}
      </p>
      {shown.length > 0 ? (
        <div className="doc-grid">
          {shown.map((doctor) => (
            <DoctorProfileCard
              key={`${doctor.name}|${doctor.department}`}
              doctor={doctor}
              labels={labels}
              bookingHref={bookingHref}
              inToday={Boolean(today) && doctor.days.includes(today)}
            />
          ))}
        </div>
      ) : (
        <p className="finder__empty">{copy.emptyText}</p>
      )}
    </section>
  )
}
