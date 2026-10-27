import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense, type ReactNode } from 'react'

import { AdminIcon } from '@/components/admin/AdminIcon'
import { ConfirmAction } from '@/components/admin/ConfirmAction'
import { AdminNav, NavLinks, type NavItem } from '@/components/admin/AdminNav'
import { logout } from '@/lib/admin/actions'
import { adminConfigError } from '@/lib/admin/data'
import { RESOURCES } from '@/lib/admin/resources'
import { getCurrentUser } from '@/lib/auth/dal'

const NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
  ...RESOURCES.map((r, i) => ({
    href: `/admin/${r.key}`,
    label: r.label,
    icon: r.key,
    group: i === 0 ? 'Content' : undefined,
  })),
  { href: '/admin/settings', label: 'Site settings', icon: 'settings', group: 'Settings' },
  { href: '/admin/users', label: 'Users', icon: 'users' },
  { href: '/admin/account', label: 'My account', icon: 'account' },
]

/**
 * Admin shell. The sidebar is static; everything that reads the session
 * (the signed-in user, every page) streams in behind Suspense.
 */
export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link href="/admin" className="admin-brand">
          <span>IGCH</span> Website admin
        </Link>
        <Suspense fallback={<NavLinks items={NAV} pathname="" />}>
          <AdminNav items={NAV} />
        </Suspense>
        <div className="admin-side__foot">
          <Suspense fallback={null}>
            <SignedInAs />
          </Suspense>
          <Link href="/" className="admin-side__link" target="_blank">
            <AdminIcon name="external" /> View website
          </Link>
        </div>
      </aside>
      <main className="admin-main" id="admin-main">
        <Suspense fallback={<p className="admin-help">Loading…</p>}>
          <Configured>{children}</Configured>
        </Suspense>
      </main>
    </div>
  )
}

async function Configured({ children }: { children: ReactNode }) {
  // request time, so the check sees the server's env rather than the build's
  await connection()
  const error = adminConfigError()
  return error ? <p className="admin-alert admin-alert--error">{error}</p> : children
}

async function SignedInAs() {
  await connection()
  if (adminConfigError()) return null
  const user = await getCurrentUser()
  if (!user) return null
  return (
    <div className="admin-user">
      <span className="admin-user__avatar" aria-hidden="true">
        {user.name.trim().charAt(0).toUpperCase()}
      </span>
      <p>
        <strong>{user.name}</strong>
        <span>{user.email}</span>
      </p>
      <ConfirmAction
        action={logout}
        className="admin-side__link"
        icon="logout"
        title="Sign out?"
        message={<p>You will need your email and password to sign in again.</p>}
        confirmLabel="Sign out"
      >
        <AdminIcon name="logout" /> Sign out
      </ConfirmAction>
    </div>
  )
}
