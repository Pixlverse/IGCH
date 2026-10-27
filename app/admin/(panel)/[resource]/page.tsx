import clsx from 'clsx'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AdminIcon } from '@/components/admin/AdminIcon'
import { ConfirmAction } from '@/components/admin/ConfirmAction'
import { Pager } from '@/components/admin/Pager'
import { deleteItem, togglePublished } from '@/lib/admin/actions'
import { listPage, PAGE_SIZE } from '@/lib/admin/data'
import { getResource } from '@/lib/admin/resources'
import { requireUser } from '@/lib/auth/dal'
import { formatDate } from '@/lib/content/format'

// Private, per-request page (reads the session): navigation waits for the server by design.
export const instant = false

type Props = {
  params: Promise<{ resource: string }>
  searchParams: Promise<{ saved?: string; deleted?: string; page?: string; q?: string }>
}

export async function generateMetadata({ params }: Pick<Props, 'params'>) {
  return { title: getResource((await params).resource)?.label ?? 'Not found' }
}

/** Renders a stored value in a list cell. */
function cell(value: unknown) {
  if (typeof value === 'boolean') return value ? 'Yes' : '—'
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) return formatDate(value)
  if (Array.isArray(value)) return value.join(', ') || '—'
  return value ? String(value) : '—'
}

export default async function ResourceList({ params, searchParams }: Props) {
  await requireUser()
  const [{ resource: key }, search] = await Promise.all([params, searchParams])
  const resource = getResource(key)
  if (!resource) notFound()

  const query = (search.q ?? '').trim().slice(0, 100)
  const { items, total, page, pages } = await listPage(resource.key, {
    page: Number(search.page) || 1,
    query,
    titleField: resource.titleField,
    sort: resource.sort,
  })
  const titleLabel = resource.fields.find((f) => f.name === resource.titleField)?.label ?? 'Title'
  const pageHref = (n: number) => {
    const qs = new URLSearchParams({
      ...(query && { q: query }),
      ...(n > 1 && { page: String(n) }),
    })
    return `/admin/${resource.key}${qs.size ? `?${qs}` : ''}`
  }

  return (
    <>
      <header className="admin-head">
        <div>
          <h1>{resource.label}</h1>
          <p className="admin-lead">{resource.description}</p>
        </div>
        <Link href={`/admin/${resource.key}/new`} className="admin-btn admin-btn--primary">
          <AdminIcon name="plus" /> Add {resource.singular.toLowerCase()}
        </Link>
      </header>
      {search.saved && (
        <p className="admin-alert admin-alert--ok" role="status">
          Saved. The website is updated.
        </p>
      )}
      {search.deleted && (
        <p className="admin-alert admin-alert--ok" role="status">
          Deleted.
        </p>
      )}

      <div className="admin-card admin-table-card">
        <form className="admin-toolbar" role="search" action={`/admin/${resource.key}`}>
          <label className="admin-search">
            <AdminIcon name="search" />
            <span className="visually-hidden">Search {resource.label.toLowerCase()}</span>
            <input
              name="q"
              type="search"
              defaultValue={query}
              placeholder={`Search by ${titleLabel.toLowerCase()}…`}
            />
          </label>
          <button type="submit" className="admin-btn admin-btn--ghost admin-btn--sm">
            Search
          </button>
          {query && (
            <Link href={`/admin/${resource.key}`} className="admin-link">
              Clear
            </Link>
          )}
        </form>

        {items.length === 0 ? (
          <p className="admin-empty">
            {query ? `No ${resource.label.toLowerCase()} match “${query}”.` : 'Nothing here yet.'}
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col" className="admin-table__num">
                    Order
                  </th>
                  <th scope="col">{titleLabel}</th>
                  {resource.columns.map((column) => (
                    <th key={column.field} scope="col">
                      {column.label}
                    </th>
                  ))}
                  <th scope="col">On website</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const published = item.published !== false
                  const title = cell(item[resource.titleField])
                  return (
                    <tr
                      key={item.id}
                      className={clsx(
                        !published && 'is-hidden',
                        search.saved === item.id && 'is-saved',
                      )}
                    >
                      <td className="admin-table__num">{cell(item.order)}</td>
                      <th scope="row">
                        <Link href={`/admin/${resource.key}/${item.id}`}>{title}</Link>
                      </th>
                      {resource.columns.map((column) => (
                        <td key={column.field}>{cell(item[column.field])}</td>
                      ))}
                      <td>
                        <ConfirmAction
                          action={togglePublished.bind(null, resource.key, item.id, !published)}
                          className="admin-switch"
                          aria-pressed={published}
                          icon={published ? 'eyeOff' : 'eye'}
                          title={published ? 'Hide from the website?' : 'Show on the website?'}
                          message={
                            published ? (
                              <p>
                                <strong>{title}</strong> will no longer appear on the public
                                website. You can show it again at any time.
                              </p>
                            ) : (
                              <p>
                                <strong>{title}</strong> will appear on the public website straight
                                away.
                              </p>
                            )
                          }
                          confirmLabel={published ? 'Hide' : 'Show on website'}
                        >
                          <span className="admin-switch__dot" aria-hidden="true" />
                          {published ? 'Visible' : 'Hidden'}
                          <span className="visually-hidden">
                            , click to {published ? 'hide' : 'show'}
                          </span>
                        </ConfirmAction>
                      </td>
                      <td className="admin-table__actions">
                        <Link
                          href={`/admin/${resource.key}/${item.id}`}
                          className="admin-icon-btn"
                          aria-label={`Edit ${title}`}
                          title="Edit"
                        >
                          <AdminIcon name="edit" />
                        </Link>
                        <ConfirmAction
                          action={deleteItem.bind(null, resource.key, item.id)}
                          className="admin-icon-btn admin-icon-btn--danger"
                          aria-label={`Delete ${title}`}
                          tooltip="Delete"
                          tone="danger"
                          title={`Delete this ${resource.singular.toLowerCase()}?`}
                          message={
                            <p>
                              <strong>{title}</strong> will be removed from the admin and the
                              website. This cannot be undone. To take it down temporarily, hide it
                              instead.
                            </p>
                          }
                          confirmLabel="Delete"
                        >
                          <AdminIcon name="trash" />
                        </ConfirmAction>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={page} pages={pages} total={total} pageSize={PAGE_SIZE} href={pageHref} />
      </div>
    </>
  )
}
