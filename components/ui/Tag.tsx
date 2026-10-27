import clsx from 'clsx'

import type { Tag as TagContent } from '@/lib/content/schemas'

type TagProps = TagContent & { className?: string }

export function Tag({ label, tone, className }: TagProps) {
  if (!label) return null
  return <span className={clsx('tag', tone !== 'green' && `tag--${tone}`, className)}>{label}</span>
}
