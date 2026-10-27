import { Illustration } from '@/components/illustrations/Illustration'
import { ContentImage } from '@/components/ui/ContentImage'
import { Tag } from '@/components/ui/Tag'
import { TextLink } from '@/components/ui/TextLink'
import type { IllustrationName, Image, Link, TagTone } from '@/lib/content/schemas'

import { Breadcrumbs } from './Breadcrumbs'

/** A news story or library article: title block, picture and body paragraphs. */
export function StoryPage({
  crumbs,
  title,
  tag,
  meta,
  summary,
  image,
  illustration,
  body,
  footnote,
  back,
}: {
  crumbs: Link[]
  title: string
  tag?: { label: string; tone: TagTone }
  meta: string[]
  summary?: string
  image?: Image
  illustration: IllustrationName
  body: string[]
  footnote?: string
  back: Link
}) {
  return (
    <article className="story-page">
      <header className="story-page__head">
        <Breadcrumbs crumbs={[...crumbs, { label: title, href: '#' }]} />
        <p className="news-meta">
          {tag?.label && <Tag {...tag} />}
          {meta.filter(Boolean).join(' · ')}
        </p>
        <h1>{title}</h1>
        {summary && <p className="story-page__summary">{summary}</p>}
      </header>
      <div className="story-page__art">
        {image ? (
          <ContentImage
            image={image}
            sizes="(max-width: 960px) 100vw, 900px"
            priority
            className="cover-img"
          />
        ) : (
          <Illustration name={illustration} />
        )}
      </div>
      <div className="story-page__body">
        {body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
        {footnote && <p className="story-page__footnote">{footnote}</p>}
        <TextLink link={back} />
      </div>
    </article>
  )
}
