import { expect, test, type Page } from '@playwright/test'

import { applyApprovedLinkChanges, PARITY_SKIP } from '../support/approved-changes'
import { serializeDom } from '../support/dom'
import { SITES } from '../support/sites'

/**
 * The deliberate, invisible accessibility fixes (MIGRATION_NOTES.md §9),
 * replayed on the original DOM so that ANY other drift still fails.
 */
async function applyApprovedA11yFixes(page: Page) {
  await page.evaluate(() => {
    // 1. tabpanel role moved to a wrapper so the <ul> keeps list semantics
    document.querySelectorAll('ul[role="tabpanel"]').forEach((ul) => {
      const panel = document.createElement('div')
      for (const { name, value } of [...ul.attributes]) panel.setAttribute(name, value)
      ;[...ul.attributes].forEach(({ name }) => ul.removeAttribute(name))
      ul.replaceWith(panel)
      panel.append(ul)
    })
    // 2. footer column headings h4 → h3 (valid heading order)
    document.querySelectorAll('.footer__links h4').forEach((h4) => {
      const h3 = document.createElement('h3')
      h3.append(...h4.childNodes)
      h4.replaceWith(h3)
    })
    // 3. accessible names now come from visible text (label-content-name-mismatch)
    document.querySelector('.header .brand')?.removeAttribute('aria-label')
    document.querySelector('.emergency-pill')?.removeAttribute('aria-label')
  })
}

// Every class, id, behaviour-relevant attribute and piece of copy must match
// the original. This catches copy/markup drift that pixels might hide.
test('rendered DOM matches the original', async ({ browser }) => {
  const trees: Record<string, string[]> = {}
  for (const [name, url] of Object.entries(SITES)) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(url, { waitUntil: 'networkidle' })
    if (name === 'legacy') {
      await applyApprovedA11yFixes(page)
      await applyApprovedLinkChanges(page)
    }
    // <main> only: the header and footer are the Phase 1 design now.
    trees[name] = await serializeDom(page, 'main', PARITY_SKIP)
    await page.close()
  }
  expect(trees.next!.join('\n')).toBe(trees.legacy!.join('\n'))
})
