import { deptHref, slugify } from './format'
import type { Doctors, Specialities } from './schemas'

export type SearchEntry = {
  name: string
  group: string
  href: string
  /** extra text to match against (short name, description, qualifications) */
  keywords: string
}

/**
 * What the home and Specialities searches look through: every department
 * (opens the doctor directory filtered to it) and every named doctor (their
 * profile page, or the directory filtered to them).
 */
export function searchEntries(specialities: Specialities, doctors: Doctors): SearchEntry[] {
  const departments = specialities.groups.flatMap((group) =>
    group.departments.map((dept) => ({
      name: dept.name,
      group: group.title,
      href: deptHref('', dept.name),
      keywords: `${dept.shortName} ${dept.description} ${slugify(dept.name)}`,
    })),
  )
  const people = doctors.items
    .filter((doctor) => !doctor.name.startsWith('['))
    .map((doctor) => ({
      name: doctor.name,
      group: doctor.department,
      href: doctor.href.startsWith('/doctors/')
        ? doctor.href
        : `/doctors?q=${encodeURIComponent(doctor.name)}`,
      keywords: `${doctor.department} ${doctor.title} ${doctor.qualifications}`,
    }))
  return [...people, ...departments]
}
