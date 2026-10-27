import clsx from 'clsx'

import { SmartLink } from '@/components/ui/SmartLink'
import type { Link } from '@/lib/content/schemas'

type PillLinksProps = {
  links: Link[]
  /** index of the dark (current / primary) pill; -1 for none */
  active?: number
  label?: string
  className?: string
}

/** Row of rounded jump links / section switchers under a page title. */
export function PillLinks({ links, active = 0, label, className }: PillLinksProps) {
  if (links.length === 0) return null
  return (
    <nav className={clsx('pills', className)} aria-label={label}>
      {links.map((link, i) => (
        <SmartLink
          key={link.label}
          href={link.href}
          className={clsx('pill', i === active && 'is-active')}
          aria-current={label && i === active ? 'page' : undefined}
        >
          {link.label}
        </SmartLink>
      ))}
    </nav>
  )
}
