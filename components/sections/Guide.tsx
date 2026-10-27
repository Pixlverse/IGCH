import clsx from 'clsx'

import { Icon } from '@/components/icons/Icon'
import { Button } from '@/components/ui/Button'
import { ContentImage } from '@/components/ui/ContentImage'
import { SectionHead } from '@/components/ui/SectionHead'
import { SmartLink } from '@/components/ui/SmartLink'
import { Tag } from '@/components/ui/Tag'
import type { Guide as GuideContent, HomePage, SectionHead as Head } from '@/lib/content/schemas'

type Props = { head: Head; guide: GuideContent; walkthrough: HomePage['walkthrough'] }

export function Guide({ head, guide, walkthrough }: Props) {
  return (
    <section className="section" id="guide">
      <SectionHead head={head} />

      <div className="guide" data-reveal="">
        <div className="guide-hero">
          <div className="guide-hero__art">
            <ContentImage
              image={guide.hero.image}
              sizes="(max-width: 1180px) 100vw, (min-width: 1560px) 520px, 34vw"
            />
          </div>
          <div className="guide-hero__body">
            <h3>{guide.hero.title}</h3>
            <p>{guide.hero.body}</p>
          </div>
        </div>

        {guide.cards.map((card) => (
          <SmartLink key={card.title} href={card.href} className="guide-card">
            <span className={clsx('icon-box', `icon-box--${card.tone}`)}>
              <Icon name={card.icon} />
            </span>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
            {card.tag && <span className="tag">{card.tag}</span>}
            {card.steps.length > 0 && (
              <div className="steps">
                {card.steps.map((step, i) => (
                  <span key={step}>
                    <b>{i + 1}</b>
                    {step}
                  </span>
                ))}
              </div>
            )}
          </SmartLink>
        ))}
        {guide.cta.label && (
          <SmartLink href={guide.cta.href} className="guide-cta">
            <h3>{guide.cta.label}</h3>
            <span className="round">
              <Icon name="arrow" />
            </span>
          </SmartLink>
        )}
      </div>

      {/* Walk-through */}
      <div className="walk" id="walkthrough" data-reveal="">
        <div className="walk__body">
          <span>
            <Tag {...walkthrough.tag} />
          </span>
          <h3 className="h3">{walkthrough.title}</h3>
          <p>{walkthrough.body}</p>
          {walkthrough.cta.label && (
            <Button href={walkthrough.cta.href} variant="primary">
              <Icon name="play" />
              {walkthrough.cta.label}
            </Button>
          )}
        </div>
        <div className="walk__art">
          <ContentImage
            image={walkthrough.image}
            sizes="(max-width: 960px) 100vw, (min-width: 1560px) 650px, 43vw"
          />
          <SmartLink
            href={walkthrough.cta.href}
            className="walk__play"
            aria-label={walkthrough.playLabel || undefined}
          >
            <Icon name="play" />
          </SmartLink>
        </div>
      </div>
    </section>
  )
}
