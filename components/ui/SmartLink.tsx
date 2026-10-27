import Link from 'next/link'
import type { ComponentPropsWithoutRef } from 'react'

type SmartLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & { href: string }

const isInternal = (href: string) =>
  (href.startsWith('/') && !href.startsWith('//')) || (href.startsWith('#') && href.length > 1)

/**
 * next/link for internal routes and in-page anchors. A plain <a> for
 * placeholders (`#`), tel:, mailto: and external URLs.
 */
export function SmartLink({ href, ...rest }: SmartLinkProps) {
  if (isInternal(href)) return <Link href={href} {...rest} />
  const external = /^https?:\/\//.test(href)
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
      {...rest}
    />
  )
}
