import type { ArticleItem, IllustrationName, Image, Library, TagTone } from './schemas'

/** What an illustrated article / news card needs. */
export type ArticleCardData = {
  href: string
  title: string
  illustration: IllustrationName
  /** uploaded photo; shown instead of the illustration */
  image?: Image
  tag?: { label: string; tone: TagTone }
  /** small line under the title: read time or date */
  meta?: string
}

/** Card props for a library article: its category's tag and illustration. */
export function articleCardData(article: ArticleItem, library: Library): ArticleCardData {
  const category = library.categories.find((c) => c.key === article.category)
  return {
    href: article.href,
    title: article.title,
    illustration: article.illustration ?? category?.illustration ?? 'consult',
    image: article.image,
    tag: category ? { label: category.label, tone: category.tone } : undefined,
    meta: article.readTime,
  }
}
