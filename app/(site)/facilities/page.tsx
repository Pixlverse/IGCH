import { Icon } from '@/components/icons/Icon'
import { Illustration } from '@/components/illustrations/Illustration'
import { RevealOnScroll } from '@/components/motion/RevealOnScroll'
import { CtaBand } from '@/components/page/CtaBand'
import { PageHero } from '@/components/page/PageHero'
import { PillLinks } from '@/components/page/PillLinks'
import { Button } from '@/components/ui/Button'
import { SectionHead } from '@/components/ui/SectionHead'
import { SmartLink } from '@/components/ui/SmartLink'
import { getFacilitiesPage, getSiteSettings, TONES } from '@/lib/content'
import { fill } from '@/lib/content/format'
import { buildPageMetadata } from '@/lib/seo'

export async function generateMetadata() {
  const page = await getFacilitiesPage()
  return buildPageMetadata(page.seo, '/facilities')
}

export default async function FacilitiesPage() {
  const [site, page] = await Promise.all([getSiteSettings(), getFacilitiesPage()])
  const { hero, ambulance, critical, dialysis, insurance, canteen } = page
  const { phone, callLabel } = site.emergency

  return (
    <main>
      <PageHero
        crumbs={hero.crumbs}
        title={hero.title}
        lead={hero.lead}
        aside={
          <div className="page-hero__art page-hero__art--sky">
            <Illustration name={hero.illustration} />
          </div>
        }
      >
        <PillLinks links={hero.links} active={-1} className="page-hero__links" />
      </PageHero>

      {ambulance.heading && (
        <section className="section section--tight" id="ambulance">
          <div className="fac-ambulance">
            <div className="fac-ambulance__art">
              <Illustration name="ambulance" />
            </div>
            <div className="fac-ambulance__body">
              {ambulance.tag && <span className="tag tag--lime">{ambulance.tag}</span>}
              <h2>{ambulance.heading}</h2>
              <p>{ambulance.body}</p>
              <div className="btn-row">
                {phone.tel && (
                  <Button href={`tel:${phone.tel}`} variant="red">
                    {fill(callLabel, { phone: phone.display })}
                  </Button>
                )}
                {ambulance.link.label && (
                  <Button href={ambulance.link.href} variant="outline">
                    {ambulance.link.label}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {critical.items.length > 0 && (
        <section className="section" id="emergency">
          <SectionHead head={critical.head} />
          <div className="critical" data-reveal="">
            {critical.items.map((item) => (
              <SmartLink
                key={item.title}
                href={item.link.href}
                className={`critical__card critical__card--${item.tone}`}
              >
                <span className="critical__icon">
                  <Icon name="plus" />
                </span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <span className="critical__link">{item.link.label}</span>
              </SmartLink>
            ))}
          </div>
        </section>
      )}

      {dialysis.heading && (
        <section className="section" id="dialysis">
          <div className="fac-dialysis" data-reveal="">
            <div className="fac-dialysis__body">
              {dialysis.tag && <span className="tag tag--white">{dialysis.tag}</span>}
              <h2 className="h2 h2--sm">{dialysis.heading}</h2>
              <p>{dialysis.body}</p>
              <div className="btn-row">
                {dialysis.ctas.map((cta) => (
                  <Button key={cta.label} href={cta.href} variant={cta.style}>
                    {cta.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="fac-dialysis__art">
              <Illustration name="kidney" />
            </div>
          </div>
        </section>
      )}

      {insurance.steps.length > 0 && (
        <section className="section" id="insurance">
          <SectionHead head={insurance.head} />
          <ol className="tpa-steps" data-reveal="">
            {insurance.steps.map((step, i) => (
              <li key={step.title}>
                <span
                  className={`tpa-steps__no tpa-steps__no--${i === insurance.steps.length - 1 ? 'lime' : TONES[i % TONES.length]}`}
                >
                  {i + 1}
                </span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
          {(insurance.partners.length > 0 || insurance.badge) && (
            <div className="tpa-partners" data-reveal="">
              <strong>{insurance.partnersLabel}</strong>
              <ul>
                {insurance.partners.map((partner, i) => (
                  <li key={i}>{partner}</li>
                ))}
                {insurance.badge && <li className="tpa-partners__badge">{insurance.badge}</li>}
              </ul>
            </div>
          )}
        </section>
      )}

      {canteen.heading && (
        <section className="section section--tight" id="canteen">
          <div className="fac-canteen" data-reveal="">
            <div>
              {canteen.tag && <span className="tag tag--white">{canteen.tag}</span>}
              <h2 className="h2 h2--sm">{canteen.heading}</h2>
              <p>{canteen.body}</p>
            </div>
            {canteen.timings.title && (
              <div className="fac-canteen__timings">
                <small>{canteen.timings.eyebrow}</small>
                <strong>{canteen.timings.title}</strong>
                <span>{canteen.timings.note}</span>
              </div>
            )}
          </div>
        </section>
      )}

      <CtaBand heading={page.cta.heading} site={site} link={page.cta.link} />
      <RevealOnScroll />
    </main>
  )
}
