'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { AdminIcon, type AdminIconName } from './AdminIcon'

export type NavItem = {
  href: string
  label: string
  icon: AdminIconName
  /** starts a new labelled group in the sidebar */
  group?: string
}

export function AdminNav({ items }: { items: NavItem[] }) {
  return <NavLinks items={items} pathname={usePathname()} />
}

/** Sidebar links; `pathname` highlights the current section ('' while unknown). */
export function NavLinks({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <nav aria-label="Admin" className="admin-nav">
      {items.map((item) => {
        const current =
          item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
        return (
          <div key={item.href} className="admin-nav__item">
            {item.group && <p className="admin-nav__group">{item.group}</p>}
            <Link
              href={item.href}
              className={clsx(current && 'is-current')}
              aria-current={current ? 'page' : undefined}
            >
              <AdminIcon name={item.icon} />
              {item.label}
            </Link>
          </div>
        )
      })}
    </nav>
  )
}
