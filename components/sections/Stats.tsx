import clsx from 'clsx'

import type { HomePage } from '@/lib/content/schemas'

export function Stats({ stats, className }: { stats: HomePage['stats']; className?: string }) {
  if (stats.items.length === 0) return null
  return (
    <section className={clsx('stats', className)} aria-label={stats.ariaLabel || undefined}>
      {stats.items.map((stat) => (
        <div
          key={stat.value + stat.caption}
          className={clsx('stat', stat.style !== 'plain' && `stat--${stat.style}`)}
        >
          <strong>{stat.value}</strong>
          <p>{stat.caption}</p>
        </div>
      ))}
    </section>
  )
}
