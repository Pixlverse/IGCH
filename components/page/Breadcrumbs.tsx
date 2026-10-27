import { SmartLink } from '@/components/ui/SmartLink'
import type { Link } from '@/lib/content/schemas'

/** Home / Section / Page. The last crumb is the current page and is not a link. */
export function Breadcrumbs({ crumbs }: { crumbs: Link[] }) {
  if (crumbs.length === 0) return null
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol>
        {crumbs.map((crumb, i) =>
          i === crumbs.length - 1 ? (
            <li key={crumb.href} aria-current="page">
              {crumb.label}
            </li>
          ) : (
            <li key={crumb.href}>
              <SmartLink href={crumb.href}>{crumb.label}</SmartLink>
            </li>
          ),
        )}
      </ol>
    </nav>
  )
}
