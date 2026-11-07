import { DoctorProfileCard } from '@/components/doctors/DoctorProfileCard'
import { RevealOnScroll } from '@/components/motion/RevealOnScroll'
import { Button } from '@/components/ui/Button'
import {
  getDoctors,
  getDoctorsPage,
  getServicePage,
  getSiteSettings,
  SERVICE_PAGES,
  type ServicePageKey,
} from '@/lib/content'
import { buildPageMetadata } from '@/lib/seo'

import { CtaBand } from './CtaBand'
import { HeroPhoto } from './HeroPhoto'
import { InfoSections } from './InfoSections'
import { PageHero } from './PageHero'

export async function buildServiceMetadata(key: ServicePageKey) {
  const page = await getServicePage(key)
  return buildPageMetadata(page.seo, SERVICE_PAGES[key])
}

/**
 * Standalone service pages (Karunya Hridayalaya, Dialysis, Insurance, Canteen,
 * College of Nursing): hero, text sections from /content, closing band.
 */
export async function ServicePageView({ pageKey }: { pageKey: ServicePageKey }) {
  const [site, page, doctors, doctorsPage] = await Promise.all([
    getSiteSettings(),
    getServicePage(pageKey),
    getDoctors(),
    getDoctorsPage(),
  ])
  const { hero } = page

  const renderDoctors = (departments: string[]) => {
    const team = doctors.items.filter((doctor) => departments.includes(doctor.department))
    if (team.length === 0) return null
    return (
      <div className="doc-grid doc-grid--inline">
        {team.map((doctor) => (
          <DoctorProfileCard
            key={`${doctor.name}|${doctor.department}`}
            doctor={doctor}
            labels={doctorsPage.card}
            bookingHref={site.booking.href}
          />
        ))}
      </div>
    )
  }

  return (
    <main>
      <PageHero
        crumbs={hero.crumbs}
        tag={hero.tag}
        title={hero.title}
        lead={hero.lead}
        aside={hero.image && <HeroPhoto image={hero.image} />}
      >
        {hero.ctas.length > 0 && (
          <div className="btn-row page-hero__links">
            {hero.ctas.map((cta) => (
              <Button key={cta.label} href={cta.href} variant={cta.style}>
                {cta.label}
              </Button>
            ))}
          </div>
        )}
      </PageHero>

      <InfoSections sections={page.sections} site={site} renderDoctors={renderDoctors} />

      <CtaBand
        heading={page.cta.heading}
        site={site}
        link={page.cta.link.label ? page.cta.link : undefined}
      />
      <RevealOnScroll />
    </main>
  )
}
