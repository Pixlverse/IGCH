/** Replaces `{name}` placeholders in editable copy, e.g. "Call {phone}". */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  )
}

/** Splits a template around one `{name}` placeholder so the value can be wrapped in markup. */
export function splitAround(template: string, key: string): [string, string] | null {
  const token = `{${key}}`
  const at = template.indexOf(token)
  return at === -1 ? null : [template.slice(0, at), template.slice(at + token.length)]
}

/** URL-safe id from a label, e.g. "Obstetrics & Gynaecology" → "obstetrics-gynaecology". */
export function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Formats a stored date (Date or ISO string) for display in India time, e.g.
 * "25 Oct 2026". Returns '' for empty or invalid values.
 */
export function formatDate(
  value: unknown,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' },
): string {
  if (!value || !(typeof value === 'string' || value instanceof Date)) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', ...options }).format(date)
}
