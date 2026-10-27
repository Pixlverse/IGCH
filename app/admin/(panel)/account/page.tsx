import { PasswordForm } from '@/components/admin/SimpleForms'
import { requireUser } from '@/lib/auth/dal'

// Private, per-request page (reads the session): navigation waits for the server by design.
export const instant = false

export const metadata = { title: 'My account' }

export default async function AccountPage() {
  const user = await requireUser()
  return (
    <>
      <header className="admin-head">
        <div>
          <h1>My account</h1>
          <p className="admin-lead">
            Signed in as {user.name} ({user.email}).
          </p>
        </div>
      </header>
      <h2 className="admin-subhead">Change password</h2>
      <div className="admin-card">
        <PasswordForm />
      </div>
    </>
  )
}
