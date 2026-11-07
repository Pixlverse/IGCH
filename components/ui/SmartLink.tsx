import Link from 'next/link'
import type { ComponentPropsWithoutRef } from 'react'

type SmartLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & { href: string }

/** `#` or empty: content that has no page to link to yet. */
export const isPlaceholder = (href: string | undefined) => !href || href === '#'

const isInternal = (href: string) =>
  (href.startsWith('/') && !href.startsWith('//')) || (href.startsWith('#') && href.length > 1)

/**
 * next/link for internal routes and in-page anchors, a plain <a> for tel:,
 * mailto: and external URLs, and plain text for placeholders (`#` / empty).
 */
export function SmartLink({ href, ...rest }: SmartLinkProps) {
  // no destination yet ('#' or empty): plain text, never a link that goes nowhere
  if (isPlaceholder(href)) {
    const { className, children, id, style } = rest
    return (
      <span className={className} id={id} style={style}>
        {children}
      </span>
    )
  }
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
