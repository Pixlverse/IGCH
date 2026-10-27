import Link from 'next/link'

import { AdminIcon } from '@/components/admin/AdminIcon'
import { dashboardData, getStoredSettings } from '@/lib/admin/data'
import { getResource, RESOURCES } from '@/lib/admin/resources'
import { currentSettings } from '@/lib/admin/settings'
import { requireUser } from '@/lib/auth/dal'

// Private, per-request page (reads the session): navigation waits for the server by design.
export const instant = false

export const metadata = { title: 'Dashboard' }

const IST = 'Asia/Kolkata'

function greeting(now: Date) {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: IST }).format(
      now,
    ),
  )
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
}

/** Shortcuts for the things added most often. */
const QUICK_ADD = ['news', 'notices', 'doctors'] as const

export default async function Dashboard() {
  const user = await requireUser()
  const [data, stored] = await Promise.all([dashboardData(RESOURCES), getStoredSettings()])
  const site = currentSettings(stored)
  const now = new Date()
  const today = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: IST,
  }).format(now)
  const firstName = user.name.split(' ')[0]

  return (
    <>
      <header className="admin-head admin-dash__head">
        <div>
          <p className="admin-eyebrow">{today}</p>
          <h1>
            {greeting(now)}, {firstName}
          </h1>
          <p className="admin-lead">
            Here is the website at a glance. Changes go live as soon as you save.
          </p>
        </div>
        <div className="admin-dash__quick">
          {QUICK_ADD.map((key) => {
            const resource = getResource(key)!
            return (
              <Link key={key} href={`/admin/${key}/new`} className="admin-btn admin-btn--ghost">
                <AdminIcon name="plus" /> {resource.singular}
              </Link>
            )
          })}
        </div>
      </header>

      <section aria-labelledby="dash-content" className="admin-dash__section">
        <h2 id="dash-content" className="visually-hidden">
          Content
        </h2>
        <div className="admin-stats">
          {RESOURCES.map((resource) => {
            const { total, hidden } = data.counts[resource.key]
            return (
              <article
                key={resource.key}
                className={`admin-card admin-stat admin-stat--${resource.key}`}
              >
                <div className="admin-stat__top">
                  <span className="admin-stat__icon">
                    <AdminIcon name={resource.key} />
                  </span>
                  {hidden > 0 && (
                    <span className="admin-pill admin-pill--amber">{hidden} hidden</span>
                  )}
                </div>
                <p className="admin-stat__count">{total}</p>
                <h3>
                  <Link href={`/admin/${resource.key}`} className="admin-stat__link">
                    {resource.label}
                  </Link>
                </h3>
                <p className="admin-help">{resource.description}</p>
                <div className="admin-stat__foot">
                  <Link href={`/admin/${resource.key}`} className="admin-link">
                    Manage
                  </Link>
                  <Link href={`/admin/${resource.key}/new`} className="admin-link">
                    <AdminIcon name="plus" /> Add
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <div className="admin-dash__row">
        <section className="admin-card admin-panel" aria-labelledby="dash-attention">
          <h2 id="dash-attention" className="admin-panel__title">
            <AdminIcon name="alert" /> Needs attention
          </h2>
          {data.placeholders.length === 0 ? (
            <p className="admin-help">All clear: no placeholder text left on the website.</p>
          ) : (
            <>
              <p className="admin-help">
                These items still show template text such as <code>[Doctor name]</code>. Replace it
                with the real details, or hide the item until they are ready.
              </p>
              <ul className="admin-list">
                {data.placeholders.map(({ name, count }) => {
                  const resource = getResource(name)!
                  return (
                    <li key={name}>
                      <span className="admin-list__icon">
                        <AdminIcon name={name} />
                      </span>
                      <span className="admin-list__text">
                        <strong>{resource.label}</strong>
                        <span>
                          {count} item{count === 1 ? '' : 's'} with placeholders
                        </span>
                      </span>
                      <Link
                        href={`/admin/${name}?q=${encodeURIComponent('[')}`}
                        className="admin-link"
                      >
                        Review
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </section>

        <section className="admin-card admin-panel" aria-labelledby="dash-recent">
          <h2 id="dash-recent" className="admin-panel__title">
            <AdminIcon name="clock" /> Recently updated
          </h2>
          {data.recent.length === 0 ? (
            <p className="admin-help">No changes yet.</p>
          ) : (
            <ul className="admin-list">
              {data.recent.map((item) => (
                <li key={`${item.name}-${item.id}`}>
                  <span className="admin-list__icon">
                    <AdminIcon name={item.name} />
                  </span>
                  <span className="admin-list__text">
                    <Link href={`/admin/${item.name}/${item.id}`}>
                      <strong>{item.title || 'Untitled'}</strong>
                    </Link>
                    <span>{getResource(item.name)!.singular}</span>
                  </span>
                  <span className="admin-list__time">{item.updated}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="admin-card admin-panel admin-dash__site" aria-labelledby="dash-site">
        <div className="admin-panel__head">
          <h2 id="dash-site" className="admin-panel__title">
            <AdminIcon name="settings" /> Site settings
          </h2>
          <Link href="/admin/settings" className="admin-btn admin-btn--ghost admin-btn--sm">
            <AdminIcon name="edit" /> Edit
          </Link>
        </div>
        <dl className="admin-facts">
          <div>
            <dt>Emergency number</dt>
            <dd>
              <AdminIcon name="phone" /> {site.emergency.phone.display || '—'}
            </dd>
          </div>
          <div>
            <dt>Announcement bar</dt>
            <dd>{site.announcement.label || 'Hidden'}</dd>
          </div>
          <div>
            <dt>Booking link</dt>
            <dd>{site.booking.href === '#' ? 'Not set yet' : site.booking.href}</dd>
          </div>
        </dl>
      </section>
    </>
  )
}
