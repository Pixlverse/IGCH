import { DoctorDirectory } from '@/components/doctors/DoctorDirectory'
import { RevealOnScroll } from '@/components/motion/RevealOnScroll'
import { CtaBand } from '@/components/page/CtaBand'
import { HeroPhoto } from '@/components/page/HeroPhoto'
import { PageHero } from '@/components/page/PageHero'
import { getDoctors, getDoctorsPage, getSiteSettings } from '@/lib/content'
import { buildPageMetadata } from '@/lib/seo'

export async function generateMetadata() {
  const page = await getDoctorsPage()
  return buildPageMetadata(page.seo, '/doctors')
}

/** Doctor directory: search, speciality chips and filters, profile cards. */
export default async function DoctorsPage() {
  const [site, page, doctors] = await Promise.all([
    getSiteSettings(),
    getDoctorsPage(),
    getDoctors(),
  ])
  const { hero } = page

  return (
    <main>
      <PageHero
        crumbs={hero.crumbs}
        title={hero.title}
        lead={hero.lead}
        aside={hero.image && <HeroPhoto image={hero.image} />}
      />
      <DoctorDirectory
        copy={page.directory}
        labels={page.card}
        doctors={doctors.items}
        bookingHref={site.booking.href}
      />
      <CtaBand heading={page.cta.heading} site={site} />
      <RevealOnScroll />
    </main>
  )
}
