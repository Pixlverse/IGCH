import clsx from 'clsx'

/** "Dr. V.P. Gangadharan" → "VG", "Mrs. Susan Roby" → "SR"; titles and brackets are ignored. */
export function initialsOf(name: string) {
  const words = name
    .replace(/[[\]()]/g, '')
    // drop every leading title: "Prof. Dr. V.I. Paul" → "V.I. Paul"
    .replace(/^((dr|mr|mrs|ms|prof)\.?\s+)+/i, '')
    .split(/[\s.]+/)
    .filter(Boolean)
  const first = words[0]?.[0] ?? ''
  const last = words.length > 1 ? (words.at(-1)?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

/** Photo placeholder: the person's initials on a soft tile (decorative). */
export function Initials({ name, className }: { name: string; className?: string }) {
  return (
    <span className={clsx('initials', className)} aria-hidden="true">
      {initialsOf(name)}
    </span>
  )
}
