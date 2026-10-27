import { RevealOnScroll } from '@/components/motion/RevealOnScroll'
import { PageHero } from '@/components/page/PageHero'
import { Button } from '@/components/ui/Button'
import { getCareersPage, getJobs, getSiteSettings } from '@/lib/content'
import { fill, splitAround } from '@/lib/content/format'
import type { JobItem } from '@/lib/content/schemas'
import { buildPageMetadata } from '@/lib/seo'

export async function generateMetadata() {
  const page = await getCareersPage()
  return buildPageMetadata(page.seo, '/careers')
}

const mailto = (email: string, subject: string) =>
  `mailto:${email}?subject=${encodeURIComponent(subject)}`

/** Job openings (managed in /admin → Careers) and a general "send your CV" option. */
export default async function CareersPage() {
  const [page, jobs, site] = await Promise.all([getCareersPage(), getJobs(), getSiteSettings()])
  const { openings, cv } = page
  const count = splitAround(
    jobs.length === 1 ? openings.countLabelOne : openings.countLabel,
    'count',
  )
  const applyHref = (job: JobItem) =>
    job.applyLink ||
    (site.careersEmail ? mailto(site.careersEmail, `Application: ${job.title}`) : '')

  return (
    <main>
      <PageHero
        crumbs={page.hero.crumbs}
        title={page.hero.title}
        lead={page.hero.lead}
        side={
          // no badge when empty: the empty state below already says so
          count &&
          jobs.length > 0 && (
            <p className="jobs-count">
              {count[0]}
              <strong>{jobs.length}</strong>
              {count[1]}
            </p>
          )
        }
      />

      <section className="section" id="openings">
        <div className="section-head" data-reveal="">
          <div>
            {openings.eyebrow && <p className="eyebrow">{openings.eyebrow}</p>}
            <h2 className="h2">{openings.heading}</h2>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="jobs-empty" data-reveal="">
            <h3>{openings.emptyHeading}</h3>
            <p>{openings.emptyText}</p>
          </div>
        ) : (
          <ul className="jobs" data-reveal="">
            {jobs.map((job) => {
              const href = applyHref(job)
              const meta = [job.department, job.type, job.location, job.experience].filter(Boolean)
              return (
                <li key={job.id} id={`job-${job.id}`} className="job">
                  <div className="job__main">
                    <h3>{job.title}</h3>
                    {meta.length > 0 && (
                      <ul className="job__meta">
                        {meta.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
                    {job.summary && <p className="job__summary">{job.summary}</p>}
                    {job.body.length > 0 && (
                      <details className="job__details">
                        <summary>{openings.detailsLabel}</summary>
                        {job.body.map((paragraph, i) => (
                          <p key={i}>{paragraph}</p>
                        ))}
                      </details>
                    )}
                  </div>
                  <div className="job__side">
                    {job.date && (
                      <p className="job__date">
                        {fill(openings.lastDateLabel, { date: job.date })}
                      </p>
                    )}
                    {href && (
                      <Button href={href} variant="primary">
                        {openings.applyLabel}
                      </Button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="section" id="apply">
        <div className="cta-band" data-reveal="">
          <div className="jobs-cv">
            <h2>{cv.heading}</h2>
            <p>
              {site.careersEmail
                ? cv.text
                : fill(cv.fallbackText, { phone: site.emergency.phone.display })}
            </p>
          </div>
          <div className="cta-band__actions">
            {site.careersEmail ? (
              <Button href={mailto(site.careersEmail, 'CV for future openings')} variant="white">
                {cv.buttonLabel}
              </Button>
            ) : (
              site.emergency.phone.tel && (
                <Button href={`tel:${site.emergency.phone.tel}`} variant="white">
                  {fill(site.emergency.callLabel, { phone: site.emergency.phone.display })}
                </Button>
              )
            )}
          </div>
        </div>
      </section>
      <RevealOnScroll />
    </main>
  )
}
