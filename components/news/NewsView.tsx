'use client'

import clsx from 'clsx'
import { useState } from 'react'

import { Illustration } from '@/components/illustrations/Illustration'
import { ArticleCard } from '@/components/page/ArticleCard'
import { PageHero } from '@/components/page/PageHero'
import { ContentImage } from '@/components/ui/ContentImage'
import { Pagination } from '@/components/page/Pagination'
import { SmartLink } from '@/components/ui/SmartLink'
import type { NewsItem, NewsPage, Notices } from '@/lib/content/schemas'

const FILTERS = ['all', 'news', 'announcements', 'tenders'] as const
type Filter = (typeof FILTERS)[number]

/** News & Updates: featured story, latest news and the notice board, filterable by type. */
export function NewsView({
  page,
  items,
  notices,
}: {
  page: NewsPage
  items: NewsItem[]
  notices: Notices
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const [pageNo, setPageNo] = useState(1)

  const showNews = filter === 'all' || filter === 'news'
  const showAnnouncements = filter === 'all' || filter === 'announcements'
  const showTenders = filter === 'all' || filter === 'tenders'

  const { latest, board } = page
  // featured story, the next two as highlights, everything else under "Latest news"
  const featured = items.find((item) => item.featured) ?? items[0]
  const rest = items.filter((item) => item !== featured)
  const highlights = rest.slice(0, 2)
  const older = rest.slice(2)
  const pageCount = Math.max(1, Math.ceil(older.length / latest.pageSize))
  const visible = older.slice((pageNo - 1) * latest.pageSize, pageNo * latest.pageSize)

  return (
    <>
      <PageHero
        crumbs={page.hero.crumbs}
        title={page.hero.title}
        lead={page.hero.lead}
        side={
          <div className="pills" role="group" aria-label={page.filters.ariaLabel}>
            {FILTERS.map((key) => (
              <button
                key={key}
                type="button"
                className="pill"
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
              >
                {page.filters[key]}
              </button>
            ))}
          </div>
        }
      />

      {showNews && featured && (
        <section className="news-top">
          <SmartLink href={featured.href} className="news-feature">
            <span className="news-feature__art">
              <NewsArt item={featured} sizes="(max-width: 960px) 100vw, 60vw" />
            </span>
            <span className="news-feature__body">
              <span className="news-meta">
                {page.featured.badge && (
                  <span className="tag tag--lime">{page.featured.badge}</span>
                )}
                {featured.date}
              </span>
              <h2>{featured.title}</h2>
              {featured.summary && <p>{featured.summary}</p>}
              <span className="news-feature__link">{page.featured.linkLabel}</span>
            </span>
          </SmartLink>
          <div className="news-highlights">
            {highlights.map((item) => (
              <SmartLink key={item.id} href={item.href} className="news-highlight">
                <span className="news-highlight__art">
                  <NewsArt item={item} sizes="(max-width: 960px) 100vw, 38vw" />
                </span>
                <span className="news-highlight__body">
                  <span className="news-meta">{item.date}</span>
                  <h2>{item.title}</h2>
                </span>
              </SmartLink>
            ))}
          </div>
        </section>
      )}

      <section className={clsx('section news-body', !showNews && 'news-body--board-only')}>
        {showNews && older.length > 0 && (
          <div className="news-latest">
            <h2 className="h2 news-body__title">{latest.heading}</h2>
            <div className="article-grid article-grid--3">
              {visible.map((item) => (
                <ArticleCard
                  key={item.id}
                  size="sm"
                  article={{
                    href: item.href,
                    title: item.title,
                    illustration: item.illustration,
                    image: item.image,
                    tag: item.tag.label ? item.tag : undefined,
                    meta: item.date,
                  }}
                />
              ))}
            </div>
            <Pagination
              page={pageNo}
              pageCount={pageCount}
              onChange={setPageNo}
              label={latest.heading}
            />
          </div>
        )}

        {(showAnnouncements || showTenders) && (
          <div className="board-col">
            <h2 className="h2 news-body__title">{board.heading}</h2>
            {showAnnouncements && notices.announcements.items.length > 0 && (
              <div className="board-card" id="announcements">
                <h3 className="board-card__title">{board.announcementsHeading}</h3>
                <ul>
                  {notices.announcements.items.map((item, i) => (
                    <li key={i}>
                      <SmartLink href={item.href}>
                        <span>
                          <small>
                            {item.day} {item.month}
                          </small>
                          <strong>{item.title}</strong>
                        </span>
                        <span aria-hidden="true">→</span>
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {showTenders && notices.tenders.items.length > 0 && (
              <div className="board-card board-card--tenders" id="tenders">
                <h3 className="board-card__title">{board.tendersHeading}</h3>
                <ul>
                  {notices.tenders.items.map((item, i) => (
                    <li key={i}>
                      <SmartLink href={item.href}>
                        <span>
                          <small>{item.lastDate}</small>
                          <strong>{item.title}</strong>
                        </span>
                        <span className="board-card__doc">
                          {board.documentLabel} <span aria-hidden="true">↓</span>
                        </span>
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  )
}

/** Uploaded photo when there is one, otherwise the item's illustration. */
function NewsArt({ item, sizes }: { item: NewsItem; sizes: string }) {
  return item.image ? (
    <ContentImage image={item.image} sizes={sizes} className="cover-img" />
  ) : (
    <Illustration name={item.illustration} />
  )
}
