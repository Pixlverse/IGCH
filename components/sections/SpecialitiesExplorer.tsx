'use client'

import clsx from 'clsx'
import { useState, type CSSProperties, type MouseEvent } from 'react'

import { Icon } from '@/components/icons/Icon'
import { fill, splitAround } from '@/lib/content/format'
import type { HomePage, SpecialityGroup } from '@/lib/content/schemas'

type Copy = HomePage['specialities']

type Props = {
  groups: SpecialityGroup[]
  copy: Copy
  phone: { display: string; tel: string }
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Department filter + live "How it works" tracker. The server render matches
 * the original's initial DOM. Behaviour mirrors the original script:
 *   hover a group → step 1, hover/focus a department → step 2, click → step 3.
 */
export function SpecialitiesExplorer({ groups, copy, phone }: Props) {
  const steps = copy.journey.steps
  const stepCount = Math.max(steps.length, 1)

  const [query, setQuery] = useState('')
  const [done, setDone] = useState(0)
  const [groupHint, setGroupHint] = useState(steps[0]?.hint ?? '')
  const [deptHint, setDeptHint] = useState(steps[1]?.hint ?? '')

  const q = query.trim().toLowerCase()
  const total = groups.reduce((sum, g) => sum + g.departments.length, 0)
  const help = splitAround(copy.helpText, 'phone')

  const enterGroup = (group: SpecialityGroup) => {
    setGroupHint(group.title)
    setDeptHint(steps[1]?.hint ?? '')
    setDone(1)
  }
  const pickDept = (group: SpecialityGroup, name: string) => {
    setGroupHint(group.title)
    setDeptHint(name)
    setDone(2)
  }
  const clickDept = (e: MouseEvent<HTMLAnchorElement>, group: SpecialityGroup, name: string) => {
    // Placeholder links stay on the page (as in the original); real URLs navigate.
    if (e.currentTarget.getAttribute('href') === '#') e.preventDefault()
    pickDept(group, name)
    setDone(3)
  }

  return (
    <div className="spec" data-reveal="">
      <div className="spec__bar">
        <div className="journey" aria-live="polite">
          <div className="journey__head">
            <span>{copy.journey.heading}</span>
            <span className="journey__count">
              <b id="journey-step">{Math.min(done + 1, stepCount)}</b>
              {` / ${stepCount}`}
            </span>
          </div>
          <div className="journey__bar">
            <i id="journey-bar" style={{ width: `${(done / stepCount) * 100}%` }}></i>
          </div>
          <ol className="journey__steps">
            {steps.map((step, i) => (
              <li
                key={step.label}
                className={clsx(i < done && 'is-done', i === done && 'is-active') || undefined}
              >
                <span className="journey__icon">
                  <svg className="ico" aria-hidden="true">
                    <use href={`#i-${step.icon}`} />
                  </svg>
                  <svg className="chk" aria-hidden="true">
                    <use href="#i-check" />
                  </svg>
                </span>
                <span>
                  <small>{step.label}</small>
                  <strong>{step.title}</strong>
                  {i === 0 ? (
                    <em id="journey-group">{groupHint}</em>
                  ) : i === 1 ? (
                    <em id="journey-dept">{deptHint}</em>
                  ) : (
                    <em>{step.hint}</em>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="spec__search">
          <label className="spec__filter">
            <Icon name="search" />
            <input
              type="search"
              id="spec-filter"
              placeholder={fill(copy.filterPlaceholder, { count: total })}
              aria-label={copy.filterAriaLabel}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          {help && (
            <p>
              {help[0]}
              <a href={`tel:${phone.tel}`}>{phone.display}</a>
              {help[1]}
            </p>
          )}
        </div>
      </div>

      <div className="spec__cols">
        {groups.map((group) => {
          const matches = group.departments.map((d, i) =>
            `${pad(i + 1)}${d.name}`.toLowerCase().includes(q),
          )
          const shown = matches.filter(Boolean).length
          const count = group.departments.length
          return (
            <article
              key={group.title}
              className={clsx('spec-group', `spec-group--${group.color}`, q && !shown && 'is-dim')}
              data-title={group.title}
              onMouseEnter={() => enterGroup(group)}
            >
              <header className="spec-group__head">
                <span className="spec-group__icon">
                  <Icon name={group.icon} />
                </span>
                <span className="spec-group__count" data-total={count}>
                  {q ? `${shown} ${copy.countOf} ${count}` : `${count} ${copy.countSuffix}`}
                </span>
                <h3>{group.title}</h3>
                <p>{group.tagline}</p>
              </header>
              <ul className="dept-list">
                {group.departments.map((dept, i) => (
                  <li key={dept.name} hidden={!matches[i]}>
                    <a
                      href={dept.href}
                      className="dept"
                      style={{ '--i': i } as CSSProperties}
                      onMouseEnter={() => pickDept(group, dept.name)}
                      onFocus={() => pickDept(group, dept.name)}
                      onClick={(e) => clickDept(e, group, dept.name)}
                    >
                      <span className="dept__no">{pad(i + 1)}</span>
                      <span className="dept__name">{dept.name}</span>
                      <Icon name="arrow" />
                    </a>
                  </li>
                ))}
              </ul>
              <p className="spec-group__empty" hidden={shown > 0}>
                {copy.emptyText}
              </p>
              {group.viewAll.label && (
                <a href={group.viewAll.href} className="text-link spec-group__all">
                  {group.viewAll.label} <Icon name="arrow" />
                </a>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
