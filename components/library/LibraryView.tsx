'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Icon } from '@/components/icons/Icon'
import { Illustration } from '@/components/illustrations/Illustration'
import { ArticleCard } from '@/components/page/ArticleCard'
import { PageHero } from '@/components/page/PageHero'
import { Pagination } from '@/components/page/Pagination'
import { SmartLink } from '@/components/ui/SmartLink'
import { Tag } from '@/components/ui/Tag'
import { articleCardData } from '@/lib/content/library'
import type { Library } from '@/lib/content/schemas'

const SearchSchema = z.object({ q: z.string().trim().max(200) })
type SearchValues = z.infer<typeof SearchSchema>

/** Wellness Library: search + category filter over the article list, paged in the browser. */
export function LibraryView({ library }: { library: Library }) {
  const [category, setCategory] = useState('')
  const [query, setQuery] = useState('')
  const [pageNo, setPageNo] = useState(1)
  const { register, handleSubmit } = useForm<SearchValues>({
    resolver: zodResolver(SearchSchema),
    defaultValues: { q: '' },
  })

  const { hero } = library
  const needle = query.toLowerCase()
  const labelOf = (key: string) => library.categories.find((c) => c.key === key)?.label ?? ''
  const matches = library.articles.filter(
    (article) =>
      (!category || article.category === category) &&
      (!needle ||
        `${article.title} ${article.summary} ${labelOf(article.category)}`
          .toLowerCase()
          .includes(needle)),
  )
  const pageCount = Math.max(1, Math.ceil(matches.length / library.pageSize))
  const visible = matches.slice((pageNo - 1) * library.pageSize, pageNo * library.pageSize)
  const featured = !category && !needle ? library.articles.find((a) => a.featured) : undefined
  const featuredCategory = library.categories.find((c) => c.key === featured?.category)

  const choose = (key: string) => {
    setCategory(key)
    setPageNo(1)
  }

  return (
    <>
      <PageHero crumbs={hero.crumbs} title={hero.title} lead={hero.lead}>
        <form
          className="search-form library-search"
          role="search"
          onSubmit={handleSubmit(({ q }) => {
            setQuery(q)
            setPageNo(1)
          })}
        >
          <label className="search-label" htmlFor="library-q">
            {hero.search.label}
          </label>
          <div className="search">
            <input
              id="library-q"
              type="search"
              placeholder={hero.search.placeholder}
              {...register('q', { onChange: (e) => !e.target.value && setQuery('') })}
            />
            <button className="btn btn--dark" type="submit" aria-label={hero.search.buttonLabel}>
              <Icon name="search" />
              <span>{hero.search.buttonLabel}</span>
            </button>
          </div>
        </form>
        <div className="pills library-filters" role="group" aria-label={hero.filterLabel}>
          {[{ key: '', label: hero.allLabel }, ...library.categories].map((c) => (
            <button
              key={c.key || 'all'}
              type="button"
              className="pill"
              aria-pressed={category === c.key}
              onClick={() => choose(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </PageHero>

      {featured && (
        <SmartLink href={featured.href} className="library-feature">
          <span className="library-feature__art">
            <Illustration
              name={featured.illustration ?? featuredCategory?.illustration ?? 'heart'}
            />
          </span>
          <span className="library-feature__body">
            <span className="news-meta">
              {featuredCategory && (
                <Tag label={featuredCategory.label} tone={featuredCategory.tone} />
              )}
              {featured.readTime}
            </span>
            <h2>{featured.title}</h2>
            {featured.summary && <p>{featured.summary}</p>}
            {featured.reviewedBy && <small>{featured.reviewedBy}</small>}
            <span className="library-feature__link">{library.featuredLinkLabel}</span>
          </span>
        </SmartLink>
      )}

      <section className="section" aria-live="polite">
        <h2 className="h2 library__title">{library.latestHeading}</h2>
        {visible.length > 0 ? (
          <div className="article-grid">
            {visible.map((article) => (
              <ArticleCard key={article.id} article={articleCardData(article, library)} />
            ))}
          </div>
        ) : (
          <p className="finder__empty">{library.emptyText}</p>
        )}
        <Pagination
          page={pageNo}
          pageCount={pageCount}
          onChange={setPageNo}
          label={library.latestHeading}
        />
      </section>
    </>
  )
}
