import { BookingForm } from '@/components/booking/BookingForm'
import { PageHero } from '@/components/page/PageHero'
import { getBookingPage, getDoctors, getSiteSettings, getSpecialities } from '@/lib/content'
import { buildPageMetadata } from '@/lib/seo'

export async function generateMetadata() {
  const page = await getBookingPage()
  return buildPageMetadata(page.seo, '/book-appointment')
}

/** Appointment request form with a help panel (emergency, desk, what to bring, OPD hours). */
export default async function BookAppointmentPage() {
  const [site, page, doctors, specialities] = await Promise.all([
    getSiteSettings(),
    getBookingPage(),
    getDoctors(),
    getSpecialities(),
  ])
  const { side } = page
  const { phone } = site.emergency
  // placeholder doctors ("[Doctor name]") are not bookable
  const bookable = doctors.items
    .filter((d) => !d.name.startsWith('['))
    .map((d) => ({ name: d.name, department: d.department }))
  const departments = [
    ...new Set([
      ...specialities.groups.flatMap((g) => g.departments.map((d) => d.name)),
      ...bookable.map((d) => d.department),
    ]),
  ]
    .filter(Boolean)
    .sort()

  return (
    <main>
      <PageHero crumbs={page.hero.crumbs} title={page.hero.title} lead={page.hero.lead} />
      <section className="section section--tight">
        <div className="booking">
          <BookingForm
            copy={{ steps: page.steps, labels: page.labels, success: page.success }}
            specialities={departments}
            doctors={bookable}
          />
          <aside className="booking__aside" aria-label="Help with booking">
            {phone.tel && (
              <a href={`tel:${phone.tel}`} className="help-card help-card--red">
                <strong>{side.emergencyTitle}</strong>
                <span>{side.emergencyBody}</span>
                <span className="help-card__value">{phone.display}</span>
              </a>
            )}
            <div className="help-card">
              <strong>{side.helpTitle}</strong>
              <span>{side.helpBody}</span>
              <span className="help-card__row">
                <small>{side.deskLabel}</small>
                {side.deskTel ? (
                  <a href={`tel:${side.deskTel}`}>{side.deskDisplay}</a>
                ) : (
                  <b>{side.deskDisplay}</b>
                )}
              </span>
            </div>
          </aside>
        </div>
        <div className="booking__extra">
          {side.bring.length > 0 && (
            <div className="help-card">
              <strong>{side.bringTitle}</strong>
              <ul>
                {side.bring.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {side.hours.length > 0 && (
            <div className="help-card">
              <strong>{side.hoursTitle}</strong>
              <dl>
                {side.hours.map((row) => (
                  <div key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
