'use client'

import { useRef, useState, type KeyboardEvent } from 'react'

import { Icon } from '@/components/icons/Icon'
import type { Notices } from '@/lib/content/schemas'

/**
 * Announcements / Tenders tabs. Mirrors the original script: roving tabindex,
 * sliding pill via data-active, and the "View all" link follows the tab.
 * As in the original, both arrow keys move to the next tab (wrapping).
 */
export function NoticeBoard({ notices }: { notices: Notices }) {
  const tabs = [
    { id: 'ann', icon: 'megaphone' as const, ...notices.announcements },
    { id: 'ten', icon: 'file' as const, ...notices.tenders },
  ]
  const [active, setActive] = useState(0)
  const [touched, setTouched] = useState(false)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const select = (index: number) => {
    setActive(index)
    setTouched(true)
  }
  const onKeyDown = (e: KeyboardEvent, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const next = (index + 1) % tabs.length
    tabRefs.current[next]?.focus()
    select(next)
  }
  const current = tabs[active] ?? tabs[0]!

  return (
    <aside className="board" aria-label={notices.ariaLabel || undefined}>
      <div className="board__head">
        <h3>{notices.title}</h3>
        <div className="board__tabs" role="tablist" data-active={touched ? active : undefined}>
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-controls={`panel-${tab.id}`}
              aria-selected={i === active}
              tabIndex={i === active ? (touched ? 0 : undefined) : -1}
              onClick={() => select(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              <Icon name={tab.icon} />
              {tab.tabLabel} <b>{tab.items.length}</b>
            </button>
          ))}
          <span className="board__pill" aria-hidden="true"></span>
        </div>
      </div>

      <div
        className="board__list"
        role="tabpanel"
        id="panel-ann"
        aria-labelledby="tab-ann"
        hidden={active !== 0}
      >
        <ul>
          {notices.announcements.items.map((item, i) => (
            <li key={i}>
              <a href={item.href}>
                <span className="board__date">
                  <b>{item.day}</b>
                  {item.month}
                </span>
                <span className="board__text">
                  <strong>{item.title}</strong>
                  <small>{item.kind}</small>
                </span>
                <Icon name="arrow" />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div
        className="board__list"
        role="tabpanel"
        id="panel-ten"
        aria-labelledby="tab-ten"
        hidden={active !== 1}
      >
        <ul>
          {notices.tenders.items.map((item, i) => (
            <li key={i}>
              <a href={item.href}>
                <span className="board__date board__date--tender">
                  <b>{item.day}</b>
                  {item.month}
                </span>
                <span className="board__text">
                  <strong>{item.title}</strong>
                  <small>
                    {item.status && <span className="status">{item.status}</span>} {item.lastDate}
                  </small>
                </span>
                <Icon name="arrow" />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <a href={current.viewAll.href} className="board__all" id="board-all">
        {current.viewAll.label} <Icon name="arrow" />
      </a>
    </aside>
  )
}
