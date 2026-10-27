import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { PAGES, SITES } from '../support/sites'

// Full-page axe scan (reduced motion so no block is mid-reveal) at mobile and desktop.
for (const path of ['/', ...PAGES]) {
  for (const width of [375, 1440]) {
    test(`no axe violations on ${path} @ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(new URL(path, SITES.next).toString(), { waitUntil: 'networkidle' })
      const { violations } = await new AxeBuilder({ page }).analyze()
      const summary = violations.flatMap((v) =>
        v.nodes.map((n) => `${v.id}: ${n.target.join(' ')} ${n.any[0]?.message ?? ''}`),
      )
      expect(summary).toEqual([])
    })
  }
}
