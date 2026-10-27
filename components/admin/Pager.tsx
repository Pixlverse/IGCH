import clsx from 'clsx'
import Link from 'next/link'

import { AdminIcon } from './AdminIcon'

/** "Showing 11–20 of 31" + page links. Keeps other query params (search). */
export function Pager({
  page,
  pages,
  total,
  pageSize,
  href,
}: {
  page: number
  pages: number
  total: number
  pageSize: number
  href: (page: number) => string
}) {
  if (total === 0) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)
  // first, last, and the pages around the current one
  const shown = [...new Set([1, page - 1, page, page + 1, pages])]
    .filter((n) => n >= 1 && n <= pages)
    .sort((a, b) => a - b)

  return (
    <nav className="admin-pager" aria-label="Pagination">
      <p>
        Showing{' '}
        <strong>
          {from}–{to}
        </strong>{' '}
        of <strong>{total}</strong>
      </p>
      {pages > 1 && (
        <div className="admin-pager__links">
          {page > 1 ? (
            <Link href={href(page - 1)} className="admin-pager__step" aria-label="Previous page">
              <AdminIcon name="left" />
            </Link>
          ) : (
            <span className="admin-pager__step is-disabled" aria-hidden="true">
              <AdminIcon name="left" />
            </span>
          )}
          {shown.map((n, i) => (
            <span key={n} className="admin-pager__group">
              {i > 0 && n - shown[i - 1]! > 1 && <span className="admin-pager__gap">…</span>}
              <Link
                href={href(n)}
                className={clsx('admin-pager__page', n === page && 'is-current')}
                aria-current={n === page ? 'page' : undefined}
                aria-label={`Page ${n}`}
              >
                {n}
              </Link>
            </span>
          ))}
          {page < pages ? (
            <Link href={href(page + 1)} className="admin-pager__step" aria-label="Next page">
              <AdminIcon name="right" />
            </Link>
          ) : (
            <span className="admin-pager__step is-disabled" aria-hidden="true">
              <AdminIcon name="right" />
            </span>
          )}
        </div>
      )}
    </nav>
  )
}
