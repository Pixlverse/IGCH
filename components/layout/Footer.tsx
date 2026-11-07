import { Button } from '@/components/ui/Button'
import { ContentImage } from '@/components/ui/ContentImage'
import { SmartLink } from '@/components/ui/SmartLink'
import type { Navigation, SiteSettings } from '@/lib/content/schemas'

export function Footer({ site, nav }: { site: SiteSettings; nav: Navigation }) {
  const { emergency, booking } = site
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__brand">
          <div className="footer__identity">
            <ContentImage
              image={site.logo}
              sizes="56px"
              width={56}
              height={59}
              alt=""
              className="footer__logo"
            />
            <p className="footer__name">{site.name}</p>
          </div>
          <address>{site.address.full}</address>
          {site.unitLine && <p className="unit">{site.unitLine}</p>}
        </div>

        <div className="footer__emergency">
          <div>
            <h3>{emergency.footerLabel}</h3>
            <a href={`tel:${emergency.phone.tel}`} className="phone">
              {emergency.phone.display}
            </a>
            <p className="open">{emergency.hours}</p>
          </div>
          <div className="footer__ctas">
            {booking.label && (
              <Button href={booking.href} variant="lime">
                {booking.label}
              </Button>
            )}
            <Button href={`tel:${emergency.phone.tel}`} variant="outline">
              {emergency.callNowLabel}
            </Button>
          </div>
        </div>
      </div>

      {nav.footer.length > 0 && (
        <nav className="footer__links" aria-label="Footer">
          {nav.footer.map((column) => (
            <div key={column.heading} className="footer__col">
              <h3>{column.heading}</h3>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <SmartLink href={link.href}>{link.label}</SmartLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      )}

      <div className="footer__bottom">
        {/* Decorative wordmark, drawn via CSS content so it is not page text */}
        {site.shortName && <div className="footer__wordmark" data-wordmark={site.shortName} />}
        <div className="footer__meta">
          <span>{site.copyright}</span>
          {site.social.length > 0 && (
            <div className="footer__social">
              {site.social.map((link) => (
                <SmartLink key={link.label} href={link.href}>
                  {link.label}
                </SmartLink>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
