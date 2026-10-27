import clsx from 'clsx'

import { ContentImage } from '@/components/ui/ContentImage'
import { SectionHead } from '@/components/ui/SectionHead'
import { Tag } from '@/components/ui/Tag'
import { TextLink } from '@/components/ui/TextLink'
import type { Centres as CentresContent, SectionHead as Head } from '@/lib/content/schemas'

export function Centres({ head, centres }: { head: Head; centres: CentresContent }) {
  const { feature, cards } = centres
  return (
    <section className="section" id="centres">
      <SectionHead head={head} />

      <div className="centres" data-reveal="">
        <article className="centre-feature">
          <div className="centre-feature__art">
            <ContentImage
              image={feature.image}
              sizes="(max-width: 960px) 100vw, (min-width: 1560px) 810px, 53vw"
            />
          </div>
          <div className="centre-feature__body">
            <Tag {...feature.tag} />
            <h3 className="h3">{feature.title}</h3>
            <p>{feature.body}</p>
            <TextLink link={feature.link} />
          </div>
        </article>

        {cards.map((card) => (
          <article key={card.title} className={clsx('centre-card', `centre-card--${card.variant}`)}>
            <div className="centre-card__art">
              <ContentImage
                image={card.image}
                sizes="(max-width: 640px) 100vw, (max-width: 960px) 37vw, (min-width: 1560px) 260px, 17vw"
              />
            </div>
            <div className="centre-card__body">
              <span>
                <Tag {...card.tag} />
              </span>
              <h3 className="h3">{card.title}</h3>
              <p>{card.body}</p>
              <TextLink link={card.link} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
