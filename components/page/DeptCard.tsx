import { Icon } from '@/components/icons/Icon'
import { Tag } from '@/components/ui/Tag'
import { SmartLink } from '@/components/ui/SmartLink'
import { deptHref, slugify } from '@/lib/content/format'
import { TONES, type Department } from '@/lib/content/schemas'

/** Department tile: coloured top edge, name with its number, description, doctors link. */
export function DeptCard({
  department,
  index,
  linkLabel,
}: {
  department: Department
  index: number
  linkLabel: string
}) {
  const tone = department.tone ?? TONES[index % TONES.length]
  return (
    <SmartLink
      href={deptHref(department.href, department.name)}
      className={`dept-card dept-card--${tone}`}
      id={`dept-${slugify(department.name)}`}
    >
      <span className="dept-card__top">
        <h3>{department.shortName || department.name}</h3>
        <span className="dept-card__no" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
      </span>
      <Tag {...department.badge} />
      {department.description && <p>{department.description}</p>}
      {linkLabel && (
        <span className="dept-card__link">
          {linkLabel} <Icon name="arrow" />
        </span>
      )}
    </SmartLink>
  )
}
