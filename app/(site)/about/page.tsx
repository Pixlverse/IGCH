import {
  Achievements,
  Careers,
  CoopBanner,
  Leadership,
  Story,
} from '@/components/about/AboutSections'
import { Illustration } from '@/components/illustrations/Illustration'
import { RevealOnScroll } from '@/components/motion/RevealOnScroll'
import { PageHero } from '@/components/page/PageHero'
import { PillLinks } from '@/components/page/PillLinks'
import { Doctors } from '@/components/sections/Doctors'
import { Stats } from '@/components/sections/Stats'
import { getAboutPage, getDoctors, getSiteSettings } from '@/lib/content'
import { buildPageMetadata } from '@/lib/seo'

export async function generateMetadata() {
  const about = await getAboutPage()
  return buildPageMetadata(about.seo, '/about')
}

export default async function AboutPage() {
  const [site, about, doctors] = await Promise.all([
    getSiteSettings(),
    getAboutPage(),
    getDoctors(),
  ])
  const { hero } = about

  return (
    <main>
      <PageHero
        crumbs={hero.crumbs}
        tag={hero.tag}
        title={hero.title}
        lead={hero.lead}
        aside={
          <div className="page-hero__art">
            <Illustration name={hero.illustration} />
            {site.accreditations.length > 0 && (
              <div className="page-hero__badges">
                {site.accreditations.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            )}
          </div>
        }
      >
        <PillLinks links={hero.links} className="page-hero__links" />
      </PageHero>
      <Stats stats={about.stats} className="stats--4" />
      <Story story={about.story} />
      <CoopBanner coop={about.coop} />
      <Leadership leadership={about.leadership} />
      <Doctors
        id="team"
        head={about.team.head}
        doctors={{ items: doctors.items.filter((doctor) => doctor.featured) }}
      />
      <Achievements achievements={about.achievements} />
      <Careers careers={about.careers} nursing={about.nursing} />
      <RevealOnScroll />
    </main>
  )
}
