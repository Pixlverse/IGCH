import clsx from 'clsx'
import type { ReactNode } from 'react'

import { Icon } from '@/components/icons/Icon'
import { Button } from '@/components/ui/Button'
import { SmartLink } from '@/components/ui/SmartLink'
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

function Facts({
  facts,
  site,
  className,
}: {
  facts: InfoSection['facts']
  site: SiteSettings
  className: string
}) {
  if (facts.length === 0) return null
  return (
    <dl className={className}>
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt>{fact.label}</dt>
          <dd>
            {fact.href ? (
              <SmartLink href={resolveHref(fact.href, site)}>{fact.value}</SmartLink>
            ) : (
              fact.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}

const Paragraphs = ({ items }: { items: string[] }) =>
  items.map((paragraph, i) => <p key={i}>{paragraph}</p>)

/** Bulleted list as a grid of tiles with a check mark. */
function Tiles({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return (
    <ul className="info__tiles">
      {items.map((item) => (
        <li key={item}>
          <span className="info__tick" aria-hidden="true">
            <Icon name="check" />
          </span>
          {item}
        </li>
      ))}
    </ul>
  )
}

type Layout = 'cta' | 'text' | 'split' | 'stack'

/**
 * Which layout a section's content suits, so wide screens never show one
 * narrow column on an empty panel:
 *
 * - cta: heading, short copy and buttons only. A bold card; consecutive CTA
 *   sections sit side by side instead of stacking as identical blocks
 * - text: paragraphs only. Heading on top, paragraphs flow in columns
 * - split: doctors or FAQs (tall). Text on the left, that content on the right
 * - stack: cards, lists, facts or stats. Heading and intro on top, content full width
 */
function layoutOf(section: InfoSection, hasDoctors: boolean): Layout {
  const hasCards = section.cards.length > 0
  const hasTallSide = section.faqs.length > 0 || hasDoctors
  const hasRow = section.stats.length > 0 || section.items.length > 0 || section.facts.length > 0
  if (hasTallSide && !hasCards) return 'split'
  if (hasCards || hasRow) return 'stack'
  if (section.ctas.length > 0 && section.heading && section.tone !== 'dark' && !section.note)
    return 'cta'
  return 'text'
}

export function InfoSections({
  sections,
  site,
  renderDoctors,
}: {
  sections: InfoSection[]
  site: SiteSettings
  /** doctor cards for a section's `doctors` departments */
  renderDoctors?: (departments: string[]) => ReactNode
}) {
  const items = sections.map((section, index) => {
    const doctors = section.doctors.length > 0 ? renderDoctors?.(section.doctors) : null
    return { section, index, doctors, layout: layoutOf(section, Boolean(doctors)) }
  })

  // runs of consecutive CTA sections share one row
  const blocks: (typeof items)[] = []
  for (const item of items) {
    const last = blocks.at(-1)
    if (item.layout === 'cta' && last?.[0]?.layout === 'cta' && last.length < 3) last.push(item)
    else blocks.push([item])
  }

  return blocks.map((block) => {
    const first = block[0]!
    if (first.layout === 'cta')
      return (
        <section
          key={first.section.id || first.section.heading || first.index}
          className="section section--tight"
        >
          <div className={clsx('cta-cards', block.length > 1 && 'cta-cards--row')} data-reveal="">
            {block.map(({ section, index }) => (
              <div
                key={section.id || section.heading || index}
                id={section.id || undefined}
                className="cta-card"
              >
                <div className="cta-card__copy">
                  {section.eyebrow && <p className="eyebrow">{section.eyebrow}</p>}
                  <h2>{section.heading}</h2>
                  <Paragraphs items={section.paragraphs} />
                  <Paragraphs items={section.after} />
                </div>
                <div className="cta-card__actions">
                  {section.ctas.map((cta, i) => (
                    <Button
                      key={cta.label}
                      href={resolveHref(cta.href, site)}
                      variant={i === 0 ? 'lime' : 'outline'}
                    >
                      {cta.label} {i === 0 && <Icon name="arrow" />}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )
    return renderSection(first)
  })

  function renderSection({
    section,
    index,
    doctors,
    layout,
  }: {
    section: InfoSection
    index: number
    doctors: ReactNode
    layout: Layout
  }) {
    const dark = section.tone === 'dark'
    const hasCards = section.cards.length > 0
    const title = (section.eyebrow || section.heading) && (
      <div className="info__title">
        {section.eyebrow && <p className="eyebrow">{section.eyebrow}</p>}
        {section.heading && <h2 className="h2 h2--sm">{section.heading}</h2>}
      </div>
    )
    const note = section.note && (
      <p className="info__note" role="note">
        <Icon name="shield" />
        <span>{section.note}</span>
      </p>
    )
    const stats = section.stats.length > 0 && (
      <ul className="info__stats">
        {section.stats.map((stat) => (
          <li key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </li>
        ))}
      </ul>
    )
    const faqs = section.faqs.length > 0 && (
      <div className="info__faq">
        {section.faqs.map((item) => (
          <details
            key={item.question}
            name={`faq-${section.id || index}`}
            open={item.open || undefined}
          >
            <summary>{item.question}</summary>
            <Paragraphs items={item.answer} />
          </details>
        ))}
      </div>
    )
    const after = section.after.length > 0 && (
      <div className="info__after">
        <Paragraphs items={section.after} />
      </div>
    )
    const ctas = <Ctas ctas={section.ctas} site={site} dark={dark} />

    return (
      <section
        key={section.id || section.heading || index}
        className="section section--tight"
        id={section.id || undefined}
      >
        <div className={clsx('info', `info--${layout}`, dark && 'info--dark')} data-reveal="">
          {layout === 'text' && (
            <>
              {title}
              <div className={clsx('info__columns', !title && 'info__columns--lead')}>
                <Paragraphs items={section.paragraphs} />
              </div>
              {note}
              {after}
              {ctas}
            </>
          )}

          {layout === 'split' && (
            <>
              <div className="info__main">
                {title}
                <div className="info__body">
                  <Paragraphs items={section.paragraphs} />
                </div>
                {after}
                {ctas}
              </div>
              <div className="info__side">
                {stats}
                <Tiles items={section.items} />
                <Facts facts={section.facts} site={site} className="info__facts" />
                {doctors}
                {faqs}
                {note}
              </div>
            </>
          )}

          {layout === 'stack' && (
            <>
              {(title || section.paragraphs.length > 0) && (
                <div className="info__head">
                  {title}
                  {section.paragraphs.length > 0 && (
                    <div className="info__body">
                      <Paragraphs items={section.paragraphs} />
                    </div>
                  )}
                </div>
              )}
              {hasCards && note}
              {stats}
              <Tiles items={section.items} />
              <Facts facts={section.facts} site={site} className="info__facts" />
              {hasCards && (
                <div className="info-cards">
                  {section.cards.map((card, i) => (
                    <article key={card.title || i} className="info-card">
                      {card.title && <h3>{card.title}</h3>}
                      <Paragraphs items={card.paragraphs} />
                      {card.items.length > 0 && (
                        <ul className="info-card__list">
                          {card.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      )}
                      <Paragraphs items={card.after} />
                      <Facts facts={card.facts} site={site} className="info-card__facts" />
                      <Ctas ctas={card.ctas} site={site} dark={false} />
                    </article>
                  ))}
                </div>
              )}
              {doctors}
              {faqs}
              {after}
              {!hasCards && note}
              {ctas}
            </>
          )}
        </div>
      </section>
    )
  }
}
