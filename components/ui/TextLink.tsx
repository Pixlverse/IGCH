import clsx from 'clsx'

import { Icon } from '@/components/icons/Icon'
import type { Link } from '@/lib/content/schemas'

import { SmartLink } from './SmartLink'

export function TextLink({ link, className }: { link: Link; className?: string }) {
  if (!link.label) return null
  return (
    <SmartLink href={link.href} className={clsx('text-link', className)}>
      {link.label} <Icon name="arrow" />
    </SmartLink>
  )
}
