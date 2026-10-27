import clsx from 'clsx'

import { Icon } from '@/components/icons/Icon'
import { Illustration } from '@/components/illustrations/Illustration'
import { SectionHead } from '@/components/ui/SectionHead'
import { SmartLink } from '@/components/ui/SmartLink'
import { Tag } from '@/components/ui/Tag'
import { TextLink } from '@/components/ui/TextLink'
import { fill } from '@/lib/content/format'
import type { Specialities, SpecialitiesHub } from '@/lib/content/schemas'

/** 1 · 2 · 3 journey strip under the hero. The last step is highlighted. */
export function HubSteps({ steps }: { steps: SpecialitiesHub['steps'] }) {
  if (steps.length === 0) return null
  return (
    <ol className="hub-steps">
      {steps.map((step, i) => (
        <li key={step.title}>
          <SmartLink
            href={step.href}
            className={clsx('hub-step', i === steps.length - 1 && 'is-lit')}
          >
            <span className="hub-step__no">{i + 1}</span>
            <span>
              <strong>{step.title}</strong>
              <small>{step.hint}</small>
            </span>
          </SmartLink>
        </li>
      ))}
    </ol>
  )
}

export function GroupCards({
  copy,
  specialities,
}: {
  copy: SpecialitiesHub['groups']
  specialities: Specialities
}) {
  if (specialities.groups.length === 0) return null
  return (
    <section className="section" id="groups">
      <SectionHead head={copy.head} />
      <div className="group-cards" data-reveal="">
        {specialities.groups.map((group) => {
          const href = group.viewAll.href
          const chips = group.departments.filter((d) => d.featured)
          const more = group.departments.length - chips.length
          return (
            <article key={group.title} className={`group-card group-card--${group.color}`}>
              <div className="group-card__art">
                <Illustration name={group.illustration} />
              </div>
              <div className="group-card__body">
                <h3>
                  <SmartLink href={href}>{group.title}</SmartLink>
                  <span className="group-card__count">{group.departments.length}</span>
                </h3>
                <p>{group.summary}</p>
                <ul className="group-card__chips">
                  {chips.map((dept) => (
                    <li key={dept.name}>{dept.shortName || dept.name}</li>
                  ))}
                  {more > 0 && <li>{fill(copy.moreLabel, { count: more })}</li>}
                </ul>
                <SmartLink href={href} className="group-card__link">
                  {fill(copy.viewAllLabel, { count: group.departments.length })}{' '}
                  <Icon name="arrow" />
                </SmartLink>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export function CentreCards({ centres }: { centres: SpecialitiesHub['centres'] }) {
  if (centres.items.length === 0) return null
  return (
    <section className="section">
      <SectionHead head={centres.head} />
      <div className="centre-cards" data-reveal="">
        {centres.items.map((centre) => (
          <article key={centre.title} className="centre-tile">
            <div className="centre-tile__art">
              <Illustration name={centre.illustration} />
            </div>
            <div className="centre-tile__body">
              <Tag {...centre.tag} />
              <h3>{centre.title}</h3>
              <p>{centre.body}</p>
              <TextLink link={centre.link} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
