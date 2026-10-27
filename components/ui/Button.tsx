import clsx from 'clsx'
import type { ReactNode } from 'react'

import { SmartLink } from './SmartLink'

export type ButtonVariant = 'primary' | 'light' | 'white' | 'outline' | 'red' | 'dark' | 'lime'

type ButtonProps = {
  href: string
  variant: ButtonVariant
  children: ReactNode
  className?: string
  'aria-label'?: string
}

export function Button({ href, variant, children, className, ...rest }: ButtonProps) {
  return (
    <SmartLink href={href} className={clsx('btn', `btn--${variant}`, className)} {...rest}>
      {children}
    </SmartLink>
  )
}
