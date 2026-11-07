import type { ArticleItem, Image, Library, TagTone } from './schemas'

/** What an article / news card needs. */
export type ArticleCardData = {
  href: string
  title: string
  /** uploaded photo; without one the card is text only */
  image?: Image
  tag?: { label: string; tone: TagTone }
  /** small line under the title: read time or date */
  meta?: string
}

/** Card props for a library article: its category's tag. */
export function articleCardData(article: ArticleItem, library: Library): ArticleCardData {
  const category = library.categories.find((c) => c.key === article.category)
  return {
    href: article.href,
    title: article.title,
    image: article.image,
    tag: category ? { label: category.label, tone: category.tone } : undefined,
    meta: article.readTime,
  }
}
