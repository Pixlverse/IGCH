import type { Page } from '@playwright/test'

/**
 * Serialises the rendered `root` subtree (minus `skip`) (tags, classes, the attributes
 * CSS/behaviour depend on, and text) so the original and Next.js DOMs can be
 * compared line by line. Framework-only attributes are ignored.
 */
export function serializeDom(page: Page, root = '.container', skip?: string): Promise<string[]> {
  return page.evaluate(
    ([rootSel, skipSel]) => {
      const KEEP = [
        'id',
        'href',
        'role',
        'hidden',
        'alt',
        'lang',
        'open',
        'name',
        'for',
        'placeholder',
        'data-title',
        'data-total',
        'data-arrow',
        'style',
        'tabindex',
        'aria-label',
        'aria-expanded',
        'aria-pressed',
        'aria-selected',
        'aria-controls',
        'aria-labelledby',
        'aria-live',
        'viewBox',
        'x',
        'y',
        'width',
        'height',
      ]
      const out: string[] = []
      const norm = (s: string) => s.replace(/\s+/g, ' ').trim()
      const walk = (node: Node, depth: number) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = norm(node.textContent ?? '')
          if (text) out.push(`${'  '.repeat(depth)}"${text}"`)
          return
        }
        if (!(node instanceof Element)) return
        const tag = node.tagName.toLowerCase()
        if (tag === 'script') return
        if (skipSel && node.matches(skipSel)) return
        const attrs: string[] = []
        const cls = [...node.classList].sort().join('.')
        if (cls) attrs.push(`.${cls}`)
        for (const name of KEEP) {
          let value = node.getAttribute(name)
          if (value === null) continue
          // Ignored on purpose (see MIGRATION_NOTES.md §9): image sizing attrs
          // come from next/image; RHF adds name="q"; a11y-only additions.
          if (tag === 'img' && (name === 'width' || name === 'height' || name === 'style')) continue
          if (tag === 'input' && name === 'name') continue
          if (tag === 'button' && (name === 'aria-label' || name === 'aria-controls')) continue
          if (name === 'id' && value === 'main-nav') continue
          if (name === 'style') value = value.replace(/\s+/g, '').replace(/;$/, '')
          attrs.push(`${name}=${value}`)
        }
        out.push(`${'  '.repeat(depth)}<${tag}${attrs.length ? ' ' + attrs.join(' ') : ''}>`)
        node.childNodes.forEach((child) => walk(child, depth + 1))
      }
      const rootEl = document.querySelector(rootSel)
      if (rootEl) walk(rootEl, 0)
      return out
    },
    [root, skip] as const,
  )
}
