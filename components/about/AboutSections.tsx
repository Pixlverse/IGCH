import clsx from 'clsx'

import { Button } from '@/components/ui/Button'
import { ContentImage } from '@/components/ui/ContentImage'
import { Initials } from '@/components/ui/Initials'
import { SectionHead } from '@/components/ui/SectionHead'
import { SmartLink } from '@/components/ui/SmartLink'
import type { AboutPage } from '@/lib/content/schemas'

export function Story({ story }: { story: AboutPage['story'] }) {
  return (
    <section className="section" id="story">
      <SectionHead head={story.head} />
      <div className="story" data-reveal="">
        <div className="story__text">
          {story.paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
          {story.society.name && (
            <div className="story__society">
              <strong>{story.society.name}</strong>
              <span>{story.society.note}</span>
            </div>
          )}
        </div>
        {story.timeline.length > 0 && (
          <ol className="timeline">
            {story.timeline.map((step) => (
              <li key={step.title}>
                <span className="timeline__year">{step.year}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}

export function CoopBanner({ coop }: { coop: AboutPage['coop'] }) {
  if (!coop.heading) return null
  return (
    <section className="section section--tight">
      <div
        className={clsx('split-banner split-banner--sage', !coop.image && 'split-banner--text')}
        data-reveal=""
      >
        {coop.image && (
          <div className="split-banner__art">
            <ContentImage
              image={coop.image}
              sizes="(max-width: 960px) 100vw, 38vw"
              className="art-photo"
            />
          </div>
        )}
        <div className="split-banner__body">
          {coop.tag && <span className="tag tag--white">{coop.tag}</span>}
          <h2 className="h2 h2--sm">{coop.heading}</h2>
          {coop.points.length > 0 && (
            <ul className="mini-cards">
              {coop.points.map((point) => (
                <li key={point.title}>
                  <strong>{point.title}</strong>
                  <span>{point.caption}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="btn-row">
            {coop.ctas.map((cta) => (
              <Button key={cta.label} href={cta.href} variant={cta.style}>
                {cta.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function Leadership({ leadership }: { leadership: AboutPage['leadership'] }) {
  if (leadership.items.length === 0) return null
  return (
    <section className="section" id="leadership">
      <SectionHead head={leadership.head} />
      <div className="leaders" data-reveal="">
        {leadership.items.map((leader) => (
          <figure key={leader.role} className="leader">
            <div className="leader__art">
              <Initials name={leader.name} />
            </div>
            <blockquote>“{leader.quote}”</blockquote>
            <figcaption>
              <strong>{leader.name}</strong>
              <span>{leader.role}</span>
            </figcaption>
            {leader.message.length > 0 && (
              <details className="leader__more">
                <summary>{leader.moreLabel || 'Read full message'}</summary>
                <div className="leader__letter">
                  {leader.message.map((paragraph, j) => (
                    <p key={j}>{paragraph}</p>
                  ))}
                </div>
              </details>
            )}
          </figure>
        ))}
      </div>
    </section>
  )
}

export function Achievements({ achievements }: { achievements: AboutPage['achievements'] }) {
  const { accreditation, empanelment, first, pacemaker, stat } = achievements
  return (
    <section className="section" id="achievements">
      <SectionHead head={achievements.head} />
      <div className="feats" data-reveal="">
        <div className="feat feat--lime">
          <span className="tag tag--white">{accreditation.tag}</span>
          <h3>{accreditation.title}</h3>
        </div>
        <div className="feat feat--white">
          <span className="tag">{empanelment.tag}</span>
          <h3>{empanelment.title}</h3>
        </div>
        <div className="feat feat--story">
          {first.image && (
            <div className="feat__art">
              <ContentImage
                image={first.image}
                sizes="(max-width: 960px) 100vw, 33vw"
                className="art-photo"
              />
            </div>
          )}
          <div className="feat__body">
            <span className="tag tag--red">{first.tag}</span>
            <h3>{first.title}</h3>
            <p>{first.body}</p>
          </div>
        </div>
        <div className="feat feat--media">
          {pacemaker.image && (
            <div className="feat__art">
              <ContentImage
                image={pacemaker.image}
                sizes="(max-width: 960px) 40vw, 14vw"
                className="art-photo"
              />
            </div>
          )}
          <h3>{pacemaker.title}</h3>
        </div>
        <div className="feat feat--dark">
          <strong>{stat.value}</strong>
          <p>{stat.caption}</p>
        </div>
      </div>
    </section>
  )
}

export function Careers({
  careers,
  nursing,
}: {
  careers: AboutPage['careers']
  nursing: AboutPage['nursing']
}) {
  return (
    <section className="section" id="careers">
      <div className="careers" data-reveal="">
        <div className="careers__main">
          {careers.tag && <span className="tag tag--glass">{careers.tag}</span>}
          <h2 className="h2">{careers.heading}</h2>
          <p>{careers.body}</p>
          <div className="btn-row">
            {careers.ctas.map((cta) => (
              <Button key={cta.label} href={cta.href} variant={cta.style}>
                {cta.label}
              </Button>
            ))}
          </div>
        </div>
        {nursing.heading && (
          <SmartLink href={nursing.link.href} className="careers__nursing">
            {nursing.image && (
              <span className="careers__art">
                <ContentImage
                  image={nursing.image}
                  sizes="(max-width: 960px) 100vw, 38vw"
                  className="art-photo"
                />
              </span>
            )}
            <span className="careers__nursing-body">
              {nursing.tag && <span className="tag tag--white">{nursing.tag}</span>}
              <h3>{nursing.heading}</h3>
              <span className="careers__link">{nursing.link.label}</span>
            </span>
          </SmartLink>
        )}
      </div>
    </section>
  )
}
