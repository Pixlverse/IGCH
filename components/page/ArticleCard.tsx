import clsx from 'clsx'

import { Illustration } from '@/components/illustrations/Illustration'
import { ContentImage } from '@/components/ui/ContentImage'
import { SmartLink } from '@/components/ui/SmartLink'
import { Tag } from '@/components/ui/Tag'
import type { ArticleCardData } from '@/lib/content/library'

/** Illustrated card used for library articles and news items. */
export function ArticleCard({
  article,
  size = 'md',
  headingLevel = 3,
}: {
  article: ArticleCardData
  size?: 'sm' | 'md'
  headingLevel?: 2 | 3
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <SmartLink href={article.href} className={clsx('article-card', `article-card--${size}`)}>
      <span className="article-card__art">
        {article.image ? (
          <ContentImage
            image={article.image}
            sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 25vw"
            className="cover-img"
          />
        ) : (
          <Illustration name={article.illustration} />
        )}
      </span>
      <span className="article-card__body">
        {article.tag && <Tag {...article.tag} />}
        <Heading>{article.title}</Heading>
        {article.meta && <span className="article-card__meta">{article.meta}</span>}
      </span>
    </SmartLink>
  )
}
