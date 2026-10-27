import { Illustration } from '@/components/illustrations/Illustration'
import { RevealOnScroll } from '@/components/motion/RevealOnScroll'
import { EmergencyCard } from '@/components/page/EmergencyCard'
import { PageHero } from '@/components/page/PageHero'
import { QuickCheck } from '@/components/page/QuickCheck'
import { DoctorFinder } from '@/components/specialities/DoctorFinder'
import { CentreCards, GroupCards, HubSteps } from '@/components/specialities/HubSections'
import { SpecialitySearch } from '@/components/specialities/SpecialitySearch'
import { SmartLink } from '@/components/ui/SmartLink'
import { getDoctors, getSiteSettings, getSpecialities, getSpecialitiesHub } from '@/lib/content'
import { slugify } from '@/lib/content/format'
import { buildPageMetadata } from '@/lib/seo'

export async function generateMetadata() {
  const hub = await getSpecialitiesHub()
  return buildPageMetadata(hub.seo, '/specialities')
}

export default async function SpecialitiesPage() {
  const [site, hub, specialities, doctors] = await Promise.all([
    getSiteSettings(),
    getSpecialitiesHub(),
    getSpecialities(),
    getDoctors(),
  ])
  const { hero } = hub
  const departments = specialities.groups.flatMap((group) =>
    group.departments.map((dept) => ({
      name: dept.name,
      group: group.title,
      href: `${group.viewAll.href}#dept-${slugify(dept.name)}`,
      keywords: `${dept.shortName} ${dept.description}`,
    })),
  )

  return (
    <main>
      <PageHero
        crumbs={hero.crumbs}
        title={hero.title}
        lead={hero.lead}
        aside={
          <div className="page-hero__art">
            <Illustration name={hero.illustration} />
            {departments.length > 0 && (
              <p className="count-chip">
                <strong>{departments.length}</strong>
                <span>{hero.countLabel}</span>
              </p>
            )}
          </div>
        }
      >
        <div className="page-hero__search">
          <SpecialitySearch {...hero.search} entries={departments} />
          {hero.chips.length > 0 && (
            <div className="chips chips--soft">
              {hero.chips.map((chip) => (
                <SmartLink key={chip.label} href={chip.href} className="chip">
                  {chip.label}
                </SmartLink>
              ))}
            </div>
          )}
        </div>
      </PageHero>
      <HubSteps steps={hub.steps} />
      <GroupCards copy={hub.groups} specialities={specialities} />
      <CentreCards centres={hub.centres} />
      <DoctorFinder copy={hub.finder} doctors={doctors.items} />
      <section className="section">
        <div className="help-row" data-reveal="">
          <QuickCheck content={hub.quickCheck} name="hub-faq" />
          <EmergencyCard site={site} tag={hub.emergency.tag} heading={hub.emergency.heading} />
        </div>
      </section>
      <RevealOnScroll />
    </main>
  )
}
