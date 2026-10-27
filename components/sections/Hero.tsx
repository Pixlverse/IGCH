import { Icon } from '@/components/icons/Icon'
import { Button } from '@/components/ui/Button'
import { ContentImage } from '@/components/ui/ContentImage'
import { SmartLink } from '@/components/ui/SmartLink'
import type { HomePage, SiteSettings } from '@/lib/content/schemas'

import { SearchForm } from './SearchForm'

export function Hero({ hero, site }: { hero: HomePage['hero']; site: SiteSettings }) {
  const { title, fiveG } = hero
  const phone = site.emergency.phone
  return (
    <section className="hero" id="about">
      <div className="hero__main">
        {hero.tag && <span className="tag">{hero.tag}</span>}
        <h1 className="hero__title">
          {title.line1}
          <br />
          <span className="nowrap">
            <span className="accent">{title.accent}</span> {title.rest}
          </span>
        </h1>
        <p className="hero__lead">{hero.lead}</p>
        <div className="hero__ctas">
          {site.booking.label && (
            <Button href={site.booking.href} variant="primary">
              {site.booking.label} <Icon name="arrow" arrow />
            </Button>
          )}
          {hero.secondaryCta.label && (
            <Button href={hero.secondaryCta.href} variant="light">
              {hero.secondaryCta.label}
            </Button>
          )}
        </div>
        <SearchForm
          label={hero.search.label}
          placeholder={hero.search.placeholder}
          buttonLabel={hero.search.buttonLabel}
        />
        {hero.chips.length > 0 && (
          <div className="chips">
            {hero.chips.map((chip) => (
              <SmartLink key={chip.label} href={chip.href} className="chip">
                {chip.label}
              </SmartLink>
            ))}
          </div>
        )}
      </div>

      <div className="hero__art">
        <ContentImage
          image={hero.image}
          className="hero__photo"
          sizes="(max-width: 960px) 100vw, (min-width: 1560px) 590px, 39vw"
          priority
        />
        {site.accreditations.length > 0 && (
          <div className="hero__badges">
            {site.accreditations.map((badge) => (
              <span key={badge}>{badge}</span>
            ))}
          </div>
        )}
        <div className="hero__5g">
          <SmartLink href={fiveG.href} className="hero__5g-main">
            <span className="hero__5g-text">
              <span className="hero__5g-chips">
                <span className="chip-5g">{fiveG.badge}</span>
                <span className="chip-new">{fiveG.newLabel}</span>
              </span>
              <strong>{fiveG.title}</strong>
              <span className="hero__5g-sub">
                {fiveG.subtitle} <u>{fiveG.linkLabel}</u>
              </span>
            </span>
            <span className="hero__5g-art" aria-hidden="true">
              <svg className="waves" viewBox="0 0 60 30">
                <path d="M18 24a12 12 0 0 1 24 0" />
                <path d="M10 24a20 20 0 0 1 40 0" />
                <path d="M2 24a28 28 0 0 1 56 0" />
              </svg>
              <svg className="amb" viewBox="50 74 230 112">
                <use href="#fig-ambulance" x="50" y="74" width="230" height="112" />
              </svg>
              <span className="road"></span>
            </span>
          </SmartLink>
          <a href={`tel:${phone.tel}`} className="hero__5g-call">
            <span>
              <small>
                <span className="dot"></span>
                {site.emergency.heroLabel}
              </small>
              <b>{phone.display}</b>
            </span>
            <span className="call-btn">
              <Icon name="phone" />
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
