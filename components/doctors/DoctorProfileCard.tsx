import { Icon } from '@/components/icons/Icon'
import { Button } from '@/components/ui/Button'
import { ContentImage } from '@/components/ui/ContentImage'
import { Initials } from '@/components/ui/Initials'
import { SmartLink } from '@/components/ui/SmartLink'
import type { Doctor, DoctorsPage } from '@/lib/content/schemas'

const SIZES = '(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 400px'

/** Short day names for the OPD line ("Monday" → "Mon"). */
const shortDay = (day: string) => day.slice(0, 3)

/** OPD days and timings, or the fallback when neither is on record. */
export function opdText(doctor: Doctor, fallback: string) {
  const days = doctor.days.map(shortDay).join(', ')
  return [days, doctor.timings].filter(Boolean).join(' · ') || fallback
}

/**
 * Directory card: photo, name, designation, speciality, qualifications,
 * experience, languages, OPD days and timings, an "in today" badge, and
 * Book appointment / View profile.
 */
export function DoctorProfileCard({
  doctor,
  labels,
  bookingHref,
  inToday = false,
}: {
  doctor: Doctor
  labels: DoctorsPage['card']
  bookingHref: string
  inToday?: boolean
}) {
  const hasProfile = doctor.href.startsWith('/doctors/')
  const opd = opdText(doctor, labels.opdFallback)
  // the booking form pre-selects this doctor
  const bookHref = bookingHref.startsWith('/')
    ? `${bookingHref}?doctor=${encodeURIComponent(doctor.name)}`
    : bookingHref

  return (
    <article className="doc-card">
      <div className="doc-card__art">
        {doctor.image ? (
          <ContentImage image={doctor.image} sizes={SIZES} />
        ) : (
          <Initials name={doctor.name} />
        )}
        {inToday && <span className="doc-card__in">{labels.inToday}</span>}
      </div>
      {/* seven fixed rows (empty when unknown) so cards line up across a grid row */}
      <div className="doc-card__body">
        <span className="doc-card__dept">{doctor.department}</span>
        <h3>
          {hasProfile ? <SmartLink href={doctor.href}>{doctor.name}</SmartLink> : doctor.name}
        </h3>
        <p className="doc-card__role">{doctor.designation || doctor.title}</p>
        <p className="doc-card__quals">
          {doctor.qualifications && (
            <>
              <span className="visually-hidden">{labels.qualifications}: </span>
              {doctor.qualifications}
            </>
          )}
        </p>
        <p className="doc-card__badges">
          {doctor.experience && (
            <span>
              <strong>{doctor.experience}</strong> {labels.experience.toLowerCase()}
            </span>
          )}
          {doctor.languages && (
            <span>
              <span className="visually-hidden">{labels.languages}: </span>
              {doctor.languages}
            </span>
          )}
        </p>
        <p className="doc-card__opd">
          <Icon name="calendar" />
          <span>
            <small>{labels.opd}</small>
            {opd}
          </span>
        </p>
        <div className="doc-card__actions">
          {labels.book && (
            <Button href={bookHref} variant="dark">
              {labels.book}
            </Button>
          )}
          {hasProfile && labels.profile && (
            <Button
              href={doctor.href}
              variant="light"
              aria-label={`${labels.profile}: ${doctor.name}`}
            >
              {labels.profile}
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
