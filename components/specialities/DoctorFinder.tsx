'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { DoctorCard } from '@/components/sections/DoctorCard'
import { fill } from '@/lib/content/format'
import type { Doctor, SpecialitiesHub } from '@/lib/content/schemas'

const FinderSchema = z.object({
  speciality: z.string(),
  name: z.string().trim().max(100),
  day: z.string(),
})
type FinderValues = z.infer<typeof FinderSchema>

function matches(doctor: Doctor, { speciality, name, day }: FinderValues) {
  if (speciality && doctor.department !== speciality) return false
  if (name && !doctor.name.toLowerCase().includes(name.toLowerCase())) return false
  // No OPD days on record yet means "ask us", so the doctor stays in the list.
  if (day && doctor.days.length > 0 && !doctor.days.includes(day)) return false
  return true
}

/**
 * "Already know who you need?" — filters the doctor list in the browser.
 * Before a search it shows the featured doctors, as in the design.
 */
export function DoctorFinder({
  copy,
  doctors,
}: {
  copy: SpecialitiesHub['finder']
  doctors: Doctor[]
}) {
  const [filters, setFilters] = useState<FinderValues | null>(null)
  const { register, handleSubmit } = useForm<FinderValues>({
    resolver: zodResolver(FinderSchema),
    defaultValues: { speciality: '', name: '', day: '' },
  })

  const specialities = [...new Set(doctors.map((d) => d.department).filter(Boolean))].sort()
  const shown = filters
    ? doctors.filter((doctor) => matches(doctor, filters))
    : doctors.filter((doctor) => doctor.featured)

  return (
    <section className="section" id="find-a-doctor">
      <div className="finder" data-reveal="">
        {copy.eyebrow && <p className="eyebrow">{copy.eyebrow}</p>}
        <h2 className="h2">{copy.heading}</h2>
        <form className="finder__form" onSubmit={handleSubmit(setFilters)}>
          <label>
            <span>{copy.specialityLabel}</span>
            <select {...register('speciality')}>
              <option value="">{copy.allSpecialities}</option>
              {specialities.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{copy.nameLabel}</span>
            <input type="search" placeholder={copy.namePlaceholder} {...register('name')} />
          </label>
          <label>
            <span>{copy.dayLabel}</span>
            <select {...register('day')}>
              <option value="">{copy.anyDay}</option>
              {copy.days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn btn--lime">
            {copy.buttonLabel}
          </button>
        </form>
      </div>
      <p className="visually-hidden" role="status">
        {filters ? fill(copy.resultsLabel, { count: shown.length }) : ''}
      </p>
      {shown.length > 0 ? (
        <div className="doctors finder__results">
          {shown.map((doctor, i) => (
            <DoctorCard
              key={`${doctor.name}-${doctor.department}-${i}`}
              doctor={doctor}
              index={i}
            />
          ))}
        </div>
      ) : (
        <p className="finder__empty">{copy.emptyText}</p>
      )}
    </section>
  )
}
