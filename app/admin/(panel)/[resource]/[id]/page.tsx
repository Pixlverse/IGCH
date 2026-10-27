import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AdminIcon } from '@/components/admin/AdminIcon'
import { ConfirmAction } from '@/components/admin/ConfirmAction'
import { ResourceForm } from '@/components/admin/ResourceForm'
import { deleteItem, saveItem } from '@/lib/admin/actions'
import { departmentNames, getItem, toFormValues } from '@/lib/admin/data'
import { getResource } from '@/lib/admin/resources'
import { requireUser } from '@/lib/auth/dal'

// Private, per-request page (reads the session): navigation waits for the server by design.
export const instant = false

export default async function EditItem({
  params,
}: {
  params: Promise<{ resource: string; id: string }>
}) {
  await requireUser()
  const { resource: key, id } = await params
  const resource = getResource(key)
  if (!resource) notFound()
  const [item, departments] = await Promise.all([getItem(resource.key, id), departmentNames()])
  if (!item) notFound()
  const title = String(item[resource.titleField] ?? resource.singular)

  return (
    <>
      <header className="admin-head">
        <div>
          <Link href={`/admin/${resource.key}`} className="admin-link">
            ← {resource.label}
          </Link>
          <h1>{title}</h1>
        </div>
        <ConfirmAction
          action={deleteItem.bind(null, resource.key, item.id)}
          className="admin-btn admin-btn--danger"
          tone="danger"
          title={`Delete this ${resource.singular.toLowerCase()}?`}
          message={
            <p>
              <strong>{title}</strong> will be removed from the admin and the website. This cannot
              be undone. To take it down temporarily, untick “Visible on the website” instead.
            </p>
          }
          confirmLabel="Delete"
        >
          <AdminIcon name="trash" /> Delete {resource.singular.toLowerCase()}
        </ConfirmAction>
      </header>
      <div className="admin-card">
        <ResourceForm
          action={saveItem.bind(null, resource.key, item.id)}
          fields={resource.fields}
          initial={toFormValues(resource.fields, item)}
          suggestions={{ departments }}
          submitLabel="Save changes"
        />
      </div>
    </>
  )
}
