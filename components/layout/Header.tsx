import { Suspense } from 'react'

import { Icon } from '@/components/icons/Icon'
import { Brand } from '@/components/ui/Brand'
import { Button } from '@/components/ui/Button'
import { SmartLink } from '@/components/ui/SmartLink'
import type { Navigation, SiteSettings } from '@/lib/content/schemas'

import { HeaderShell, MenuToggle } from './HeaderShell'
import { LanguageToggle } from './LanguageToggle'
import { MainNav, MainNavFallback } from './MainNav'

export function Header({ site, nav }: { site: SiteSettings; nav: Navigation }) {
  const { emergency, booking, announcement } = site
  return (
    <>
      <aside className="topbar" aria-label={announcement.ariaLabel || undefined}>
        {announcement.label && (
          <SmartLink href={announcement.href} className="topbar__news">
            {announcement.badge && <span className="topbar__badge">{announcement.badge}</span>}
            <span>
              {announcement.label} <span aria-hidden="true">→</span>
            </span>
          </SmartLink>
        )}
        {site.shortAddress && <span className="topbar__address">{site.shortAddress}</span>}
      </aside>
      <HeaderShell>
        <div className="header__top">
          <Brand site={site} />
          <div className="header__actions">
            <LanguageToggle languages={site.languages} label={site.languageGroupLabel} />
            {emergency.phone.tel && (
              <a href={`tel:${emergency.phone.tel}`} className="emergency-pill">
                <span className="ep-dot" aria-hidden="true"></span>
                <span className="ep-ico">
                  <Icon name="phone" />
                </span>
                <span className="ep-text">
                  {emergency.headerLabel} · {emergency.phone.display}
                </span>
              </a>
            )}
            {booking.label && (
              <Button href={booking.href} variant="dark" className="header__book">
                <Icon name="calendar" />
                {booking.label}
              </Button>
            )}
            <MenuToggle label={site.menuLabel} />
          </div>
        </div>
        {/* usePathname can suspend on pages with runtime params (news / article pages) */}
        <Suspense fallback={<MainNavFallback items={nav.header} />}>
          <MainNav items={nav.header} />
        </Suspense>
      </HeaderShell>
    </>
  )
}
