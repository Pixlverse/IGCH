import { Suspense } from 'react'

import { LoginForm } from '@/components/admin/SimpleForms'
import { adminConfigError } from '@/lib/admin/data'

export const metadata = { title: 'Sign in' }

export default function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return (
    <main className="admin-login">
      <div className="admin-card admin-login__card">
        <p className="admin-eyebrow">Indira Gandhi Co-operative Hospital</p>
        <h1>Website admin</h1>
        <Suspense fallback={<p className="admin-help">Loading…</p>}>
          <Login searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  )
}

async function Login({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  const configError = adminConfigError()
  if (configError) return <p className="admin-alert admin-alert--error">{configError}</p>
  return <LoginForm next={typeof next === 'string' ? next : undefined} />
}
