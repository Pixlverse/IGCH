import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { StoryPage } from '@/components/page/StoryPage'
import { getNewsItem, getNewsPage } from '@/lib/content'
import { buildPageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const item = await getNewsItem(slug)
  return buildPageMetadata(
    { title: item?.title ?? '', description: item?.summary ?? '' },
    `/news/${slug}`,
  )
}

/** A news story with its own page (added in /admin with a full story). */
export default function NewsStoryPage({ params }: Props) {
  return (
    <main>
      <Suspense fallback={<div className="story-page story-page--loading" />}>
        <Story params={params} />
      </Suspense>
    </main>
  )
}

async function Story({ params }: Props) {
  const { slug } = await params
  const [item, page] = await Promise.all([getNewsItem(slug), getNewsPage()])
  if (!item) notFound()
  const index = page.hero.crumbs.at(-1)
  return (
    <StoryPage
      crumbs={page.hero.crumbs}
      title={item.title}
      tag={item.tag}
      meta={[item.date, item.readTime]}
      summary={item.summary}
      image={item.image}
      illustration={item.illustration}
      body={item.body}
      back={{ label: `All ${index?.label ?? 'news'}`, href: index?.href ?? '/news' }}
    />
  )
}
