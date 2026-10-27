import { Icon } from '@/components/icons/Icon'
import { ContentImage } from '@/components/ui/ContentImage'
import { SectionHead } from '@/components/ui/SectionHead'
import { SmartLink } from '@/components/ui/SmartLink'
import { Tag } from '@/components/ui/Tag'
import type { News as NewsContent, Notices, SectionHead as Head } from '@/lib/content/schemas'

import { NoticeBoard } from './NoticeBoard'

type Props = { head: Head; news: NewsContent; notices: Notices }

export function News({ head, news, notices }: Props) {
  const { lead } = news
  if (!lead.title && notices.announcements.items.length + notices.tenders.items.length === 0)
    return null
  return (
    <section className="section" id="news">
      <SectionHead head={head} />

      <div className="news" data-reveal="">
        <div className="news__left">
          {lead.title && (
            <SmartLink href={lead.href} className="news-lead news-lead--split">
              <ContentImage
                image={lead.image}
                sizes="(max-width: 640px) 100vw, (max-width: 960px) 66vw, (min-width: 1560px) 600px, 40vw"
              />
              <span className="news-lead__shade"></span>
              <span className="news-lead__top">
                <Tag {...lead.tag} />
                {lead.badge && <span className="news-badge">{lead.badge}</span>}
              </span>
              <span className="news-lead__body">
                <small>{lead.meta}</small>
                <strong>{lead.title}</strong>
                <span className="news-lead__more">
                  {lead.teaser}{' '}
                  {lead.linkLabel && (
                    <u>
                      {lead.linkLabel} <Icon name="arrow" />
                    </u>
                  )}
                </span>
              </span>
            </SmartLink>
          )}

          {news.cards.length > 0 && (
            <div className="news__pair">
              {news.cards.map((card) => (
                <SmartLink key={card.title} href={card.href} className="news-card">
                  <span className="news-card__img">
                    <ContentImage image={card.image} sizes="120px" />
                  </span>
                  <span className="news-card__body">
                    <Tag {...card.tag} />
                    <strong>{card.title}</strong>
                    <small>
                      {card.date} <Icon name="arrow" />
                    </small>
                  </span>
                </SmartLink>
              ))}
            </div>
          )}
        </div>

        <NoticeBoard notices={notices} />
      </div>
    </section>
  )
}
