import clsx from 'clsx'

import type { SectionHead as SectionHeadContent } from '@/lib/content/schemas'

import { SmartLink } from './SmartLink'

export function SectionHead({ head }: { head: SectionHeadContent }) {
  return (
    <div className="section-head" data-reveal="">
      <div>
        {head.eyebrow && <p className="eyebrow">{head.eyebrow}</p>}
        <h2 className={clsx('h2', head.wide && 'h2--wide')}>{head.heading}</h2>
      </div>
      {head.link.label && (
        <SmartLink href={head.link.href} className="pill-link">
          {head.link.label}
        </SmartLink>
      )}
    </div>
  )
}
