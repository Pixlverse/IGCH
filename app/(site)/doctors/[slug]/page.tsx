import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { opdText } from '@/components/doctors/DoctorProfileCard'
import { RichBlocks } from '@/components/doctors/RichBlocks'
import { RevealOnScroll } from '@/components/motion/RevealOnScroll'
import { Breadcrumbs } from '@/components/page/Breadcrumbs'
import { CtaBand } from '@/components/page/CtaBand'
import { Button } from '@/components/ui/Button'
import { ContentImage } from '@/components/ui/ContentImage'
import { Initials } from '@/components/ui/Initials'
import { getDoctor, getDoctorsPage, getSiteSettings } from '@/lib/content'
import { buildPageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const doctor = await getDoctor(slug)
  const role = [doctor?.title || doctor?.department, 'IGCH, Kochi'].filter(Boolean).join(' at ')
  return buildPageMetadata(
    {
      title: doctor ? `${doctor.name} | ${role}` : '',
      description: doctor?.intro[0] ?? '',
    },
    `/doctors/${slug}`,
  )
}

/** A doctor's profile page (written in /admin → Doctors). */
export default function DoctorProfilePage({ params }: Props) {
  return (
    <main>
      <Suspense fallback={<div className="profile profile--loading" />}>
        <Profile params={params} />
      </Suspense>
      <RevealOnScroll />
    </main>
  )
}

async function Profile({ params }: Props) {
  const { slug } = await params
  const [doctor, page, site] = await Promise.all([
    getDoctor(slug),
    getDoctorsPage(),
    getSiteSettings(),
  ])
  if (!doctor) notFound()

  const { card, profile } = page
  const crumbs = [...page.hero.crumbs, { label: doctor.name, href: `/doctors/${slug}` }]
  const sections = profile.sections.filter((section) => doctor[section.key].length > 0)
  const facts = [
    { label: profile.designation, value: doctor.designation },
    { label: card.experience, value: doctor.experience },
    { label: card.languages, value: doctor.languages },
    { label: card.opd, value: opdText(doctor, card.opdFallback) },
  ].filter((fact) => fact.value)
  const { phone } = site.emergency

  return (
    <>
      <section className="profile-hero">
        <div className="profile-hero__photo">
          {doctor.image ? (
            <ContentImage
              image={doctor.image}
              sizes="(max-width: 960px) 100vw, 420px"
              priority
              className="cover-img"
            />
          ) : (
            <Initials name={doctor.name} />
          )}
        </div>
        <div className="profile-hero__main">
          <Breadcrumbs crumbs={crumbs} />
          {doctor.department && <span className="tag profile-hero__dept">{doctor.department}</span>}
          <h1 className="profile-hero__name">{doctor.name}</h1>
          {doctor.title && <p className="profile-hero__title">{doctor.title}</p>}
          {doctor.qualifications && <p className="profile-hero__quals">{doctor.qualifications}</p>}
          <dl className="profile-hero__facts">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
          <div className="btn-row">
            {card.book && (
              <Button href={site.booking.href} variant="primary">
                {card.book}
              </Button>
            )}
            {phone.tel && profile.callLabel && (
              <Button href={`tel:${phone.tel}`} variant="light">
                {profile.callLabel}
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="profile">
          {sections.length > 1 && (
            <nav className="profile__toc" aria-label={profile.tocLabel}>
              <p>{profile.tocLabel}</p>
              <ol>
                {sections.map((section) => (
                  <li key={section.key}>
                    <a href={`#${section.key}`}>{section.heading}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <div className="profile__body">
            {doctor.intro.length > 0 && (
              <div className="profile__intro" data-reveal="">
                <RichBlocks blocks={doctor.intro} />
              </div>
            )}
            {sections.map((section) => (
              <section
                key={section.key}
                id={section.key}
                className="profile__section"
                data-reveal=""
              >
                <h2>{section.heading}</h2>
                <RichBlocks blocks={doctor[section.key]} />
              </section>
            ))}
            {profile.note && <p className="profile__note">{profile.note}</p>}
            <Button href={page.hero.crumbs.at(-1)?.href ?? '/doctors'} variant="light">
              ← {profile.backLabel}
            </Button>
          </div>
        </div>
      </section>

      <CtaBand heading={page.cta.heading} site={site} />
    </>
  )
}
