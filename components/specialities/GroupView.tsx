import clsx from 'clsx'
import { notFound } from 'next/navigation'

import { Illustration } from '@/components/illustrations/Illustration'
import { RevealOnScroll } from '@/components/motion/RevealOnScroll'
import { ArticleCard } from '@/components/page/ArticleCard'
import { CtaBand } from '@/components/page/CtaBand'
import { DeptCard } from '@/components/page/DeptCard'
import { EmergencyCard } from '@/components/page/EmergencyCard'
import { PageHero } from '@/components/page/PageHero'
import { PillLinks } from '@/components/page/PillLinks'
import { QuickCheck } from '@/components/page/QuickCheck'
import { Doctors } from '@/components/sections/Doctors'
import { Button } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Tag'
import { TextLink } from '@/components/ui/TextLink'
import {
  getDoctors,
  getLibrary,
  getSiteSettings,
  getSpecialities,
  getSpecialitiesHub,
  getSpecialityGroupPages,
} from '@/lib/content'
import { articleCardData } from '@/lib/content/library'
import { buildPageMetadata } from '@/lib/seo'

const groupPath = (slug: string) => `/specialities/${slug}`

export async function buildGroupMetadata(slug: string) {
  const { pages } = await getSpecialityGroupPages()
  const page = pages.find((p) => p.slug === slug)
  return buildPageMetadata(page?.seo ?? { title: '', description: '' }, groupPath(slug))
}

/**
 * One speciality group (/specialities/<slug>). Every group page shares this
 * layout; sections without content (centres, camp, OPD…) are skipped.
 */
export async function GroupView({ slug }: { slug: string }) {
  const [site, specialities, hub, { pages }, doctors, library] = await Promise.all([
    getSiteSettings(),
    getSpecialities(),
    getSpecialitiesHub(),
    getSpecialityGroupPages(),
    getDoctors(),
    getLibrary(),
  ])
  const group = specialities.groups.find((g) => g.slug === slug)
  const page = pages.find((p) => p.slug === slug)
  if (!group || !page) notFound()

  const crumbs = [...hub.hero.crumbs, { label: group.title, href: groupPath(slug) }]
  const switcher = specialities.groups.map((g) => ({ label: g.title, href: groupPath(g.slug) }))
  const team = doctors.items.filter((doctor) => doctor.groups.includes(slug))
  const articles = page.wellness.articles
    .map((id) => library.articles.find((a) => a.id === id))
    .filter((a) => a !== undefined)
    .map((article) => articleCardData(article, library))
  const { phone } = site.emergency

  return (
    <main>
      <PageHero
        crumbs={crumbs}
        title={page.hero.title}
        lead={page.hero.lead}
        layout="wide"
        aside={
          <div className="group-aside">
            <div className={`count-card count-card--${page.count.tone}`}>
              <strong>{group.departments.length}</strong>
              <span>{page.count.label}</span>
            </div>
            {page.aside.kind === 'emergency' && phone.tel && (
              <a href={`tel:${phone.tel}`} className="aside-card aside-card--emergency">
                <small>{page.aside.eyebrow}</small>
                <strong>{phone.display}</strong>
              </a>
            )}
            {page.aside.kind === 'info' && (
              <div className="aside-card">
                <small>{page.aside.eyebrow}</small>
                <strong>{page.aside.text}</strong>
              </div>
            )}
          </div>
        }
      >
        <PillLinks
          links={switcher}
          active={switcher.findIndex((link) => link.href === groupPath(slug))}
          label="Speciality groups"
          className="page-hero__links"
        />
      </PageHero>

      {page.emergency.heading && (
        <section className="section section--tight">
          <EmergencyCard
            site={site}
            tag={page.emergency.tag}
            heading={page.emergency.heading}
            body={page.emergency.body}
            layout="row"
          />
        </section>
      )}

      <section className="section" id="departments">
        <div className="section-head" data-reveal="">
          <div>
            {page.departments.eyebrow && <p className="eyebrow">{page.departments.eyebrow}</p>}
            <h2 className="h2">{page.departments.heading}</h2>
          </div>
        </div>
        {/* five across for the long lists, four when there are eight or fewer */}
        <div
          className={clsx('dept-grid', group.departments.length <= 8 && 'dept-grid--4')}
          data-reveal=""
        >
          {group.departments.map((dept, i) => (
            <DeptCard
              key={dept.name}
              department={dept}
              index={i}
              linkLabel={page.departments.linkLabel}
            />
          ))}
        </div>
        {page.centres.length > 0 && (
          <div className="group-centres" data-reveal="">
            {page.centres.map((centre) => (
              <article key={centre.title} className={`group-centre group-centre--${centre.tone}`}>
                <div className="group-centre__art">
                  <Illustration name={centre.illustration} />
                </div>
                <div className="group-centre__body">
                  <Tag {...centre.tag} />
                  <h3>{centre.title}</h3>
                  {centre.body && <p>{centre.body}</p>}
                  <TextLink link={centre.link} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {page.camp.heading && (
        <section className="section">
          <div className="split-banner split-banner--sage" data-reveal="">
            <div className="split-banner__art split-banner__art--peach">
              <Illustration name={page.camp.illustration} />
            </div>
            <div className="split-banner__body">
              {page.camp.tag && <span className="tag tag--white">{page.camp.tag}</span>}
              <h2 className="h2 h2--sm">{page.camp.heading}</h2>
              {page.camp.body && <p>{page.camp.body}</p>}
              {page.camp.cta.label && (
                <Button href={page.camp.cta.href} variant="dark">
                  {page.camp.cta.label}
                </Button>
              )}
            </div>
          </div>
        </section>
      )}

      {page.how.steps.length > 0 && (
        <section className="section section--tight">
          <div className="how" data-reveal="">
            {page.how.eyebrow && <p className="eyebrow">{page.how.eyebrow}</p>}
            <h2 className="h2">{page.how.heading}</h2>
            <ol className="how__steps">
              {page.how.steps.map((step) => (
                <li key={step.title}>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {page.opd.slots.length > 0 && (
        <section className="section" id="opd">
          <div className="section-head" data-reveal="">
            <div>
              {page.opd.eyebrow && <p className="eyebrow">{page.opd.eyebrow}</p>}
              <h2 className="h2">{page.opd.heading}</h2>
            </div>
          </div>
          <div className="opd" data-reveal="">
            {page.opd.slots.map((slot) => (
              <div key={slot.title} className="opd__slot">
                <h3>{slot.title}</h3>
                <p>{slot.text}</p>
              </div>
            ))}
            {site.booking.label && (
              <div className="opd__slot opd__slot--book">
                <h3>{page.opd.bookingTitle}</h3>
                <Button href={site.booking.href} variant="lime">
                  {site.booking.label}
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      <Doctors head={page.doctors} doctors={{ items: team }} />

      {articles.length > 0 && (
        <section className="section">
          <div
            className={clsx('wellness', page.quickCheck.items.length > 0 && 'wellness--with-faq')}
            data-reveal=""
          >
            <div>
              <h2 className="h2 wellness__title">{page.wellness.heading}</h2>
              <div className="article-grid article-grid--3">
                {articles.map((article) => (
                  <ArticleCard
                    key={article.href + article.title}
                    article={{ ...article, meta: undefined }}
                    size={page.quickCheck.items.length > 0 ? 'sm' : 'md'}
                  />
                ))}
              </div>
            </div>
            <QuickCheck content={page.quickCheck} name={`${slug}-faq`} />
          </div>
        </section>
      )}

      <CtaBand heading={page.cta.heading} site={site} />
      <RevealOnScroll />
    </main>
  )
}
