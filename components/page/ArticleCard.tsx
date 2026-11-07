import clsx from 'clsx'

import { ContentImage } from '@/components/ui/ContentImage'
import { SmartLink } from '@/components/ui/SmartLink'
import { Tag } from '@/components/ui/Tag'
import type { ArticleCardData } from '@/lib/content/library'

/** Card for library articles and news items; the photo area shows only with a photo. */
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
    <SmartLink
      href={article.href}
      className={clsx(
        'article-card',
        `article-card--${size}`,
        !article.image && 'article-card--text',
      )}
    >
      {article.image && (
        <span className="article-card__art">
          <ContentImage
            image={article.image}
            sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 25vw"
            className="cover-img"
          />
        </span>
      )}
      <span className="article-card__body">
        {article.tag && <Tag {...article.tag} />}
        <Heading>{article.title}</Heading>
        {article.meta && <span className="article-card__meta">{article.meta}</span>}
      </span>
    </SmartLink>
  )
}
