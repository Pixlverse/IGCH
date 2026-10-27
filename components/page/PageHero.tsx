import clsx from 'clsx'
import type { ReactNode } from 'react'

import type { AccentTitle as AccentTitleContent, Link } from '@/lib/content/schemas'

import { Breadcrumbs } from './Breadcrumbs'

/** Renders `{before} <span class="accent">{accent}</span>{after}` with natural spacing. */
export function AccentTitle({ title }: { title: AccentTitleContent }) {
  return (
    <>
      {title.before}
      {title.before && title.accent && ' '}
      {title.accent && <span className="accent">{title.accent}</span>}
      {title.after}
    </>
  )
}

type PageHeroProps = {
  crumbs: Link[]
  title: AccentTitleContent
  lead?: string
  tag?: string
  /** right-hand column (illustration, count card…); omitted = full-width card */
  aside?: ReactNode
  /** `wide` gives the main card more of the row (group pages) */
  layout?: 'split' | 'wide'
  /** sits beside the title block on full-width heroes (e.g. filters) */
  side?: ReactNode
  children?: ReactNode
}

/** Shared top-of-page block: breadcrumb, H1 with one accented run, lead, extras. */
export function PageHero({
  crumbs,
  title,
  lead,
  tag,
  aside,
  layout = 'split',
  side,
  children,
}: PageHeroProps) {
  return (
    <section className={clsx('page-hero', aside ? `page-hero--${layout}` : 'page-hero--full')}>
      <div className={clsx('page-hero__main', side && 'page-hero__main--side')}>
        <div className="page-hero__body">
          <Breadcrumbs crumbs={crumbs} />
          {tag && <span className="tag page-hero__tag">{tag}</span>}
          <h1 className="page-hero__title">
            <AccentTitle title={title} />
          </h1>
          {lead && <p className="page-hero__lead">{lead}</p>}
          {children}
        </div>
        {side}
      </div>
      {aside}
    </section>
  )
}
