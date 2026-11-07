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

type Figure = { key: string; value: string; label: string }

/**
 * Replaces {{key}}, {{key.label}} and {{key.number}} (the value without a
 * trailing "+", for sentences like "more than 7,000") in every string of a
 * content document. Unknown keys become empty so a deleted figure never shows
 * raw braces.
 */
export function fillFigures<T>(doc: T, figures: Figure[]): T {
  const byKey = new Map(figures.map((f) => [f.key, f]))
  const token = /\{\{\s*([a-z0-9-]+)(?:\.(label|number))?\s*\}\}/g
  const walk = (value: unknown): unknown => {
    if (typeof value === 'string')
      return value.includes('{{')
        ? value.replace(token, (_, key: string, part?: string) => {
            const figure = byKey.get(key)
            if (!figure) return ''
            if (part === 'label') return figure.label
            if (part === 'number') return figure.value.replace(/\+$/, '')
            return figure.value
          })
        : value
    if (Array.isArray(value)) return value.map(walk)
    if (value && typeof value === 'object')
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v)]))
    return value
  }
  return walk(doc) as T
}

/** A department's own page when it has one, otherwise its doctors in the directory. */
export const deptHref = (href: string, name: string) =>
  href && href !== '#' ? href : `/doctors?q=${encodeURIComponent(name)}`
