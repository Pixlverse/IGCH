import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { StoryPage } from '@/components/page/StoryPage'
import { getArticle } from '@/lib/content'
import { buildPageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const found = await getArticle(slug)
  return buildPageMetadata(
    { title: found?.article.title ?? '', description: found?.article.summary ?? '' },
    `/wellness-library/${slug}`,
  )
}

/** A Wellness Library article (written in /admin). */
export default function ArticlePage({ params }: Props) {
  return (
    <main>
      <Suspense fallback={<div className="story-page story-page--loading" />}>
        <Article params={params} />
      </Suspense>
    </main>
  )
}

async function Article({ params }: Props) {
  const { slug } = await params
  const found = await getArticle(slug)
  if (!found) notFound()
  const { article, library } = found
  const category = library.categories.find((c) => c.key === article.category)
  const index = library.hero.crumbs.at(-1)
  return (
    <StoryPage
      crumbs={library.hero.crumbs}
      title={article.title}
      tag={category && { label: category.label, tone: category.tone }}
      meta={[article.date, article.readTime]}
      summary={article.summary}
      image={article.image}
      illustration={article.illustration ?? category?.illustration ?? 'consult'}
      body={article.body}
      footnote={[article.reviewedBy, library.askDoctor.note].filter(Boolean).join(' — ')}
      back={{
        label: `Back to the ${index?.label ?? 'library'}`,
        href: index?.href ?? '/wellness-library',
      }}
    />
  )
}
