import { NewsView } from '@/components/news/NewsView'
import { getNewsItems, getNewsPage, getNotices } from '@/lib/content'
import { buildPageMetadata } from '@/lib/seo'

export async function generateMetadata() {
  const page = await getNewsPage()
  return buildPageMetadata(page.seo, '/news')
}

export default async function NewsPage() {
  const [page, items, notices] = await Promise.all([getNewsPage(), getNewsItems(), getNotices()])
  return (
    <main>
      <NewsView page={page} items={items} notices={notices} />
    </main>
  )
}
