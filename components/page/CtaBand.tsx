import { Button } from '@/components/ui/Button'
import { fill } from '@/lib/content/format'
import type { Link, SiteSettings } from '@/lib/content/schemas'

/** Green closing band: heading + primary action (booking by default) + call button. */
export function CtaBand({
  heading,
  site,
  link,
}: {
  heading: string
  site: SiteSettings
  link?: Link
}) {
  if (!heading) return null
  const primary = link?.label ? link : site.booking
  const { phone, callLabel } = site.emergency
  return (
    <section className="section">
      <div className="cta-band" data-reveal="">
        <h2>{heading}</h2>
        <div className="cta-band__actions">
          {primary.label && (
            <Button href={primary.href} variant="white">
              {primary.label}
            </Button>
          )}
          {phone.tel && (
            <Button href={`tel:${phone.tel}`} variant="outline">
              {fill(callLabel, { phone: phone.display })}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
