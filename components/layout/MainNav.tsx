'use client'

import clsx from 'clsx'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { Icon } from '@/components/icons/Icon'
import { SmartLink } from '@/components/ui/SmartLink'
import type { Navigation } from '@/lib/content/schemas'

import { useMenu } from './HeaderShell'

/** A nav item is current when the page is its route or a page beneath it. */
function isCurrent(href: string, pathname: string) {
  const path = href.split('#')[0]
  if (!path || path === '/') return false
  return pathname === path || pathname.startsWith(`${path}/`)
}

/**
 * Main navigation. Items with `hasMenu` reveal their links on hover and on
 * keyboard focus (CSS :focus-within), so the dropdowns need no JS state.
 */
export function MainNav({ items }: { items: Navigation['header'] }) {
  const pathname = usePathname()
  const { close } = useMenu()
  // close the mobile menu after client-side navigation to another page
  useEffect(() => close(), [pathname, close])
  return <NavList items={items} pathname={pathname} onNavigate={close} />
}

/** Same links without the current-page highlight, while the pathname is unknown. */
export function MainNavFallback({ items }: { items: Navigation['header'] }) {
  return <NavList items={items} pathname="" />
}

function NavList({
  items,
  pathname,
  onNavigate,
}: {
  items: Navigation['header']
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <nav className="nav" aria-label="Main" id="main-nav">
      {items.map((item) => {
        const current = isCurrent(item.href, pathname)
        const menu = item.hasMenu && item.children.length > 0
        return (
          <div key={item.label} className={clsx('nav__item', menu && 'nav__item--menu')}>
            <SmartLink
              href={item.href}
              className={clsx('nav__link', current && 'is-current')}
              aria-current={current ? 'page' : undefined}
              onClick={onNavigate}
            >
              {item.label}
              {item.hasMenu && <Icon name="chev" />}
            </SmartLink>
            {menu && (
              <ul className="nav__menu">
                {item.children.map((child) => (
                  <li key={child.label}>
                    <SmartLink href={child.href} onClick={onNavigate}>
                      {child.label}
                    </SmartLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </nav>
  )
}
