import type { ReactNode } from 'react'

import { ContentImage } from '@/components/ui/ContentImage'
import type { Image } from '@/lib/content/schemas'

/**
 * Photo column of a page hero. Pages pass it as PageHero's `aside` only when
 * there is a photo; without one the hero is a full-width card.
 */
export function HeroPhoto({ image, children }: { image: Image; children?: ReactNode }) {
  return (
    <div className="page-hero__art">
      <ContentImage
        image={image}
        sizes="(max-width: 960px) 100vw, 40vw"
        priority
        className="art-photo"
      />
      {children}
    </div>
  )
}
