import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ResourceForm } from '@/components/admin/ResourceForm'
import { saveItem } from '@/lib/admin/actions'
import { departmentNames, listItems, toFormValues } from '@/lib/admin/data'
import { getResource } from '@/lib/admin/resources'
import { requireUser } from '@/lib/auth/dal'

// Private, per-request page (reads the session): navigation waits for the server by design.
export const instant = false

export default async function NewItem({ params }: { params: Promise<{ resource: string }> }) {
  await requireUser()
  const resource = getResource((await params).resource)
  if (!resource) notFound()
  const [existing, departments] = await Promise.all([listItems(resource.key), departmentNames()])
  const initial = toFormValues(resource.fields, null)
  // new items go to the end of the list
  initial.order = String(Math.max(0, ...existing.map((item) => Number(item.order) || 0)) + 1)

  return (
    <>
      <header className="admin-head">
        <div>
          <Link href={`/admin/${resource.key}`} className="admin-link">
            ← {resource.label}
          </Link>
          <h1>Add {resource.singular.toLowerCase()}</h1>
        </div>
      </header>
      <div className="admin-card">
        <ResourceForm
          action={saveItem.bind(null, resource.key, null)}
          fields={resource.fields}
          initial={initial}
          suggestions={{ departments }}
          submitLabel={`Add ${resource.singular.toLowerCase()}`}
        />
      </div>
    </>
  )
}
