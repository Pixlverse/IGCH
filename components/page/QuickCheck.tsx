import clsx from 'clsx'

import type { QuickCheck as QuickCheckContent } from '@/lib/content/schemas'

/** "Quick check" card: a native exclusive accordion (<details name>), no JS. */
export function QuickCheck({
  content,
  name,
  className,
}: {
  content: QuickCheckContent
  /** groups the <details> so only one is open; unique per page */
  name: string
  className?: string
}) {
  if (content.items.length === 0) return null
  return (
    <div className={clsx('quick-check', className)}>
      {content.eyebrow && <p className="eyebrow">{content.eyebrow}</p>}
      {content.heading && <h2 className="quick-check__title">{content.heading}</h2>}
      <div className="quick-check__list">
        {content.items.map((item) => (
          <details key={item.question} name={name} open={item.open || undefined}>
            <summary>{item.question}</summary>
            {item.answer.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </details>
        ))}
      </div>
    </div>
  )
}
