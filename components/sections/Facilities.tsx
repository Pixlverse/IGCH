import type { CSSProperties } from 'react'

import { Icon } from '@/components/icons/Icon'
import { Button } from '@/components/ui/Button'
import { ContentImage } from '@/components/ui/ContentImage'
import { SectionHead } from '@/components/ui/SectionHead'
import { SmartLink } from '@/components/ui/SmartLink'
import { Tag } from '@/components/ui/Tag'
import { fill } from '@/lib/content/format'
import type { Facilities as FacilitiesContent, HomePage, SiteSettings } from '@/lib/content/schemas'

/** Design tokens for facility tiles; content picks a tone by name. */
const TONES = {
  green: { tone: '#0e6e58', tint: '#e3f3ea' },
  amber: { tone: '#b07a10', tint: '#fdf1d6' },
  red: { tone: '#c4302b', tint: '#fde8e6' },
  blue: { tone: '#1d5e73', tint: '#e2eef7' },
} as const

type Props = {
  copy: HomePage['facilities']
  facilities: FacilitiesContent
  site: SiteSettings
}

export function Facilities({ copy, facilities, site }: Props) {
  const { ambulance } = copy
  const phone = site.emergency.phone
  return (
    <section className="section" id="facilities">
      <SectionHead head={copy.head} />

      <div className="ambulance" id="ambulance" data-reveal="">
        <div className="ambulance__body">
          <Tag {...ambulance.tag} />
          <h3>{ambulance.heading}</h3>
          {phone.tel && (
            <Button href={`tel:${phone.tel}`} variant="red">
              <Icon name="phone" />
              {fill(ambulance.callLabel, { phone: phone.display })}
            </Button>
          )}
        </div>
        <div className="ambulance__art">
          <ContentImage
            image={ambulance.image}
            sizes="(max-width: 960px) 100vw, (min-width: 1560px) 590px, 39vw"
          />
        </div>
      </div>

      {facilities.items.length > 0 && (
        <div className="facilities" data-reveal="">
          {facilities.items.map((item) => {
            const { tone, tint } = TONES[item.tone]
            return (
              <SmartLink
                key={item.title}
                href={item.href}
                className="facility"
                style={{ '--tone': tone, '--tint': tint } as CSSProperties}
              >
                <svg className="facility__bg" aria-hidden="true">
                  <use href={`#i-${item.icon}`} />
                </svg>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </SmartLink>
            )
          })}
        </div>
      )}
    </section>
  )
}
