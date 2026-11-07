import { RevealOnScroll } from '@/components/motion/RevealOnScroll'
import { EmergencyCard } from '@/components/page/EmergencyCard'
import { HeroPhoto } from '@/components/page/HeroPhoto'
import { PageHero } from '@/components/page/PageHero'
import { QuickCheck } from '@/components/page/QuickCheck'
import { DoctorFinder } from '@/components/specialities/DoctorFinder'
import { CentreCards, GroupCards, HubSteps } from '@/components/specialities/HubSections'
import { SpecialitySearch } from '@/components/specialities/SpecialitySearch'
import { SmartLink } from '@/components/ui/SmartLink'
import { getDoctors, getSiteSettings, getSpecialities, getSpecialitiesHub } from '@/lib/content'
import { searchEntries } from '@/lib/content/search'
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
  const entries = searchEntries(specialities, doctors)
  const deptCount = specialities.groups.reduce((n, g) => n + g.departments.length, 0)

  return (
    <main>
      <PageHero
        crumbs={hero.crumbs}
        title={hero.title}
        lead={hero.lead}
        aside={
          hero.image && (
            <HeroPhoto image={hero.image}>
              {deptCount > 0 && (
                <p className="count-chip">
                  <strong>{deptCount}</strong>
                  <span>{hero.countLabel}</span>
                </p>
              )}
            </HeroPhoto>
          )
        }
      >
        <div className="page-hero__search">
          <SpecialitySearch {...hero.search} entries={entries} />
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
