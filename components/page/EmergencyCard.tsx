import clsx from 'clsx'

import { Button } from '@/components/ui/Button'
import type { SiteSettings } from '@/lib/content/schemas'

/** Pink emergency call-out: tag, heading, big number and a call button. */
export function EmergencyCard({
  site,
  tag,
  heading,
  body,
  layout = 'stack',
}: {
  site: SiteSettings
  tag: string
  heading: string
  body?: string
  /** `row` puts the number and button beside the copy (full-width banner) */
  layout?: 'stack' | 'row'
}) {
  const { phone, callNowLabel } = site.emergency
  if (!phone.tel) return null
  return (
    <div className={clsx('emergency-card', `emergency-card--${layout}`)}>
      <div>
        {tag && <span className="tag tag--white-red">{tag}</span>}
        <h2>{heading}</h2>
        {body && <p>{body}</p>}
      </div>
      <div className="emergency-card__call">
        <a href={`tel:${phone.tel}`} className="emergency-card__phone">
          {phone.display}
        </a>
        <Button href={`tel:${phone.tel}`} variant="red">
          {callNowLabel}
        </Button>
      </div>
    </div>
  )
}
