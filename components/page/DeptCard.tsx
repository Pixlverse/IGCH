import { Icon } from '@/components/icons/Icon'
import { Tag } from '@/components/ui/Tag'
import { SmartLink } from '@/components/ui/SmartLink'
import { slugify } from '@/lib/content/format'
import { TONES, type Department } from '@/lib/content/schemas'

/** Department tile: tinted "+" icon, name, one-line description, link. */
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
    <SmartLink href={department.href} className="dept-card" id={`dept-${slugify(department.name)}`}>
      <span className="dept-card__top">
        <span className={`tone-box tone-box--${tone}`}>
          <Icon name="plus" />
        </span>
        <Tag {...department.badge} />
      </span>
      <h3>{department.shortName || department.name}</h3>
      {department.description && <p>{department.description}</p>}
      {linkLabel && (
        <span className="dept-card__link">
          {linkLabel} <Icon name="arrow" />
        </span>
      )}
    </SmartLink>
  )
}
