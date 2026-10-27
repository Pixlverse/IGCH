'use client'

import clsx from 'clsx'

type PaginationProps = {
  page: number
  pageCount: number
  onChange: (page: number) => void
  label: string
}

/** ‹ 1 2 3 › page switcher for client-side lists. Hidden when there is one page. */
export function Pagination({ page, pageCount, onChange, label }: PaginationProps) {
  if (pageCount <= 1) return null
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1)
  return (
    <nav className="pagination" aria-label={label}>
      <button
        type="button"
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        ‹
      </button>
      {pages.map((n) => (
        <button
          key={n}
          type="button"
          className={clsx(n === page && 'is-active')}
          aria-current={n === page ? 'page' : undefined}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        aria-label="Next page"
        disabled={page === pageCount}
        onClick={() => onChange(page + 1)}
      >
        ›
      </button>
    </nav>
  )
}
