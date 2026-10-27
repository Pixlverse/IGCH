import { AdminIcon } from '@/components/admin/AdminIcon'
import { ConfirmAction } from '@/components/admin/ConfirmAction'
import { NewUserForm } from '@/components/admin/SimpleForms'
import { deleteUser } from '@/lib/admin/actions'
import { listUsers } from '@/lib/admin/data'
import { requireUser } from '@/lib/auth/dal'

// Private, per-request page (reads the session): navigation waits for the server by design.
export const instant = false

export const metadata = { title: 'Users' }

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>
}) {
  const me = await requireUser()
  const [users, flags] = await Promise.all([listUsers(), searchParams])
  return (
    <>
      <header className="admin-head">
        <div>
          <h1>Users</h1>
          <p className="admin-lead">
            Everyone listed here can sign in and edit all website content.
          </p>
        </div>
      </header>
      {flags.saved && (
        <p className="admin-alert admin-alert--ok" role="status">
          User added.
        </p>
      )}
      {flags.deleted && (
        <p className="admin-alert admin-alert--ok" role="status">
          User removed.
        </p>
      )}
      <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Last sign-in</th>
              <th scope="col">
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <th scope="row">
                  {user.name} {user.id === me.id && <span className="admin-pill">You</span>}
                </th>
                <td>{user.email}</td>
                <td>{user.lastLogin || '—'}</td>
                <td className="admin-table__actions">
                  {user.id !== me.id && users.length > 1 && (
                    <ConfirmAction
                      action={deleteUser.bind(null, user.id)}
                      className="admin-btn admin-btn--danger admin-btn--sm"
                      tone="danger"
                      icon="users"
                      title="Remove this user?"
                      message={
                        <p>
                          <strong>{user.name}</strong> ({user.email}) will no longer be able to sign
                          in to the admin.
                        </p>
                      }
                      confirmLabel="Remove user"
                    >
                      <AdminIcon name="trash" /> Remove
                    </ConfirmAction>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="admin-subhead">Add a user</h2>
      <div className="admin-card">
        <NewUserForm />
      </div>
    </>
  )
}
