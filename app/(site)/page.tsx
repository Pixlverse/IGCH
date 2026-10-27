import { RevealOnScroll } from '@/components/motion/RevealOnScroll'
import { Blogs } from '@/components/sections/Blogs'
import { Centres } from '@/components/sections/Centres'
import { Coop } from '@/components/sections/Coop'
import { Doctors } from '@/components/sections/Doctors'
import { Facilities } from '@/components/sections/Facilities'
import { Faq } from '@/components/sections/Faq'
import { Guide } from '@/components/sections/Guide'
import { Hero } from '@/components/sections/Hero'
import { News } from '@/components/sections/News'
import { Nursing } from '@/components/sections/Nursing'
import { Specialities } from '@/components/sections/Specialities'
import { Stats } from '@/components/sections/Stats'
import {
  getBlogs,
  getCentres,
  getDoctors,
  getFacilities,
  getFaqs,
  getGuide,
  getHomePage,
  getNews,
  getNotices,
  getSiteSettings,
  getSpecialities,
} from '@/lib/content'
import { buildHomeMetadata, buildJsonLd } from '@/lib/seo'

export const generateMetadata = buildHomeMetadata

export default async function HomePage() {
  const [
    site,
    home,
    centres,
    specialities,
    doctors,
    guide,
    facilities,
    news,
    notices,
    blogs,
    faqs,
  ] = await Promise.all([
    getSiteSettings(),
    getHomePage(),
    getCentres(),
    getSpecialities(),
    getDoctors(),
    getGuide(),
    getFacilities(),
    getNews(),
    getNotices(),
    getBlogs(),
    getFaqs(),
  ])

  const jsonLd = buildJsonLd({
    site,
    faqs: faqs.items,
    specialities: specialities.groups.flatMap((g) => g.departments.map((d) => d.name)),
  })

  return (
    <main>
      <Hero hero={home.hero} site={site} />
      <Stats stats={home.stats} />
      <Centres head={home.centres.head} centres={centres} />
      <Specialities copy={home.specialities} specialities={specialities} site={site} />
      <Doctors
        head={home.doctors.head}
        doctors={{ items: doctors.items.filter((doctor) => doctor.featured) }}
      />
      <Guide head={home.guide.head} guide={guide} walkthrough={home.walkthrough} />
      <Facilities copy={home.facilities} facilities={facilities} site={site} />
      <Coop coop={home.coop} />
      <News head={home.news.head} news={news} notices={notices} />
      <Blogs head={home.blogs.head} blogs={blogs} />
      <Faq copy={home.faq} faqs={faqs} />
      <Nursing nursing={home.nursing} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      {/* Inside the page so it runs only after these sections have hydrated */}
      <RevealOnScroll />
    </main>
  )
}
