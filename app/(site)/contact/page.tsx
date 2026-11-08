import { ContactForm } from '@/components/contact/ContactForm'
import { Icon } from '@/components/icons/Icon'
import { PageHero } from '@/components/page/PageHero'
import { SmartLink } from '@/components/ui/SmartLink'
import { getContactPage, getSiteSettings } from '@/lib/content'
import { buildPageMetadata } from '@/lib/seo'

export async function generateMetadata() {
  const page = await getContactPage()
  return buildPageMetadata(page.seo, '/contact')
}

/** Phone numbers, address with map and directions, opening hours and a message form. */
export default async function ContactPage() {
  const [site, page] = await Promise.all([getSiteSettings(), getContactPage()])
  const { visit } = page
  const resolve = (href: string) => {
    if (href === 'emergency')
      return site.emergency.phone.tel ? `tel:${site.emergency.phone.tel}` : ''
    if (href === 'booking') return site.booking.href
    return href
  }
  const query = encodeURIComponent(visit.mapQuery)

  return (
    <main>
      <PageHero crumbs={page.hero.crumbs} title={page.hero.title} lead={page.hero.lead} />

      {/* numbers on the left, address and map on the right: one compact block */}
      <section className="section section--tight contact-grid" id="visit">
        {/* a phone directory: emergency first, then every desk */}
        <div className="directory-panel" aria-label="Phone numbers">
          {page.cards.map((card) => {
            const href = resolve(card.href)
            const isPhone = href.startsWith('tel:')
            const body = (
              <>
                <span className="dir-row__text">
                  <strong>{card.title}</strong>
                  <span>{card.body}</span>
                </span>
                <span className="dir-row__value">
                  {isPhone && <Icon name="phone" />}
                  {card.value}
                </span>
              </>
            )
            return href ? (
              <SmartLink key={card.title} href={href} className={`dir-row dir-row--${card.tone}`}>
                {body}
              </SmartLink>
            ) : (
              <div key={card.title} className={`dir-row dir-row--${card.tone}`}>
                {body}
              </div>
            )
          })}
        </div>
        <div className="visit">
          <div className="visit__info">
            <h2 className="h2 h2--sm">{visit.title}</h2>
            <address>
              {visit.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
            {visit.landmark && <p className="visit__landmark">{visit.landmark}</p>}
            <a
              className="btn btn--dark"
              href={`https://www.google.com/maps/dir/?api=1&destination=${query}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="route" /> {visit.directionsLabel}
            </a>
            {visit.hours.length > 0 && (
              <div className="visit__hours">
                <h3>{visit.hoursTitle}</h3>
                <dl>
                  {visit.hours.map((row) => (
                    <div key={row.label}>
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
          <div className="visit__map">
            <iframe
              title={`Map: ${visit.mapQuery}`}
              src={`https://www.google.com/maps?q=${query}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <section className="section section--tight" id="message">
        <div className="contact-form">
          <div className="contact-form__intro">
            <h2 className="h2 h2--sm">{page.form.heading}</h2>
            <p>{page.form.lead}</p>
          </div>
          <ContactForm copy={{ form: page.form, success: page.success }} />
        </div>
      </section>
    </main>
  )
}
