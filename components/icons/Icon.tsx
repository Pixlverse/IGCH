import type { IconName } from '@/lib/content/schemas'

type IconProps = {
  name: IconName
  className?: string
  /** marks the icon as a trailing arrow that nudges right on .btn hover */
  arrow?: boolean
}

/** Renders `<svg><use href="#i-name"/></svg>` exactly as the original markup did. */
export function Icon({ name, className, arrow }: IconProps) {
  return (
    <svg className={className} data-arrow={arrow ? '' : undefined} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  )
}
