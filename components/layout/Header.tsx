import clsx from 'clsx'
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
            {/* phones: icon-only emergency button beside the menu toggle */}
            {emergency.phone.tel && (
              <EmergencyPill site={site} className="emergency-pill--mobile" />
            )}
            <MenuToggle label={site.menuLabel} />
          </div>
        </div>
        <div className="header__bar">
          {/* usePathname can suspend on pages with runtime params (news / article pages) */}
          <Suspense fallback={<MainNavFallback items={nav.header} />}>
            <MainNav items={nav.header} />
          </Suspense>
          <div className="header__cta">
            {emergency.phone.tel && <EmergencyPill site={site} />}
            {booking.label && (
              <Button href={booking.href} variant="dark" className="header__book">
                <Icon name="calendar" />
                {booking.label}
              </Button>
            )}
          </div>
        </div>
      </HeaderShell>
    </>
  )
}

function EmergencyPill({ site, className }: { site: SiteSettings; className?: string }) {
  const { emergency } = site
  return (
    <a href={`tel:${emergency.phone.tel}`} className={clsx('emergency-pill', className)}>
      <span className="ep-dot" aria-hidden="true"></span>
      <span className="ep-ico">
        <Icon name="phone" />
      </span>
      <span className="ep-text">
        <span className="ep-label">{emergency.headerLabel} · </span>
        {emergency.phone.display}
      </span>
    </a>
  )
}
