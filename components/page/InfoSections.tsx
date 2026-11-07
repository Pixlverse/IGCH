import clsx from 'clsx'

import { Button } from '@/components/ui/Button'
import type { Cta, InfoSection, SiteSettings } from '@/lib/content/schemas'

/** `booking` / `emergency` hrefs resolve to the site booking link and the emergency number. */
function resolveHref(href: string, site: SiteSettings) {
  if (href === 'booking') return site.booking.href
  if (href === 'emergency')
    return site.emergency.phone.tel ? `tel:${site.emergency.phone.tel}` : '#'
  return href
}

function Ctas({ ctas, site, dark }: { ctas: Cta[]; site: SiteSettings; dark: boolean }) {
  if (ctas.length === 0) return null
  return (
    <div className="btn-row">
      {ctas.map((cta) => (
        <Button
          key={cta.label}
          href={resolveHref(cta.href, site)}
          variant={dark && cta.style === 'primary' ? 'lime' : cta.style}
        >
          {cta.label}
        </Button>
      ))}
    </div>
  )
}

/** Text sections (heading, paragraphs, cards, buttons) for copy without a bespoke layout. */
export function InfoSections({ sections, site }: { sections: InfoSection[]; site: SiteSettings }) {
  return sections.map((section, index) => {
    const dark = section.tone === 'dark'
    return (
      <section
        key={section.heading || index}
        className="section section--tight"
        id={section.id || undefined}
      >
        <div className={clsx('info', dark && 'info--dark')} data-reveal="">
          <div className="info__head">
            {section.eyebrow && <p className="eyebrow">{section.eyebrow}</p>}
            {section.heading && <h2 className="h2 h2--sm">{section.heading}</h2>}
            {section.paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          {section.cards.length > 0 && (
            <div className="info-cards">
              {section.cards.map((card, i) => (
                <article key={card.title || i} className="info-card">
                  {card.title && <h3>{card.title}</h3>}
                  {card.paragraphs.map((paragraph, j) => (
                    <p key={j}>{paragraph}</p>
                  ))}
                  {card.items.length > 0 && (
                    <ul className="info-card__list">
                      {card.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {card.facts.length > 0 && (
                    <dl className="info-card__facts">
                      {card.facts.map((fact) => (
                        <div key={fact.label}>
                          <dt>{fact.label}</dt>
                          <dd>{fact.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <Ctas ctas={card.ctas} site={site} dark={false} />
                </article>
              ))}
            </div>
          )}
          <Ctas ctas={section.ctas} site={site} dark={dark} />
        </div>
      </section>
    )
  })
}
