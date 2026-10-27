import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { expect, test } from '@playwright/test'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

import { hideSkippedSections } from '../support/approved-changes'
import { BREAKPOINTS, SITES, preparePage } from '../support/sites'

/*
 * Screenshots the ORIGINAL site (legacy/) and the Next.js build at every
 * breakpoint and diffs them pixel by pixel. Artifacts (both screenshots, the
 * diff image and a JSON summary) land in tests/.artifacts/visual.
 */

const OUT = join(process.cwd(), 'tests/.artifacts/visual')
// Max share of differing pixels. Non-zero only for image resampling (next/image)
// and font anti-aliasing; see MIGRATION_NOTES.md §10.
const MAX_DIFF_RATIO = Number(process.env.MAX_DIFF_RATIO ?? 0.005)
// Anti-aliasing on rounded photo edges can leak a few pixels outside the img box.
const MAX_UNEXPLAINED_PX = Number(process.env.MAX_UNEXPLAINED_PX ?? 50)

type Rect = { x: number; y: number; w: number; h: number }
type Category = 'images' | 'a11yTweaks'

/** Elements whose colours were deliberately changed for WCAG AA (MIGRATION_NOTES.md §9). */
const A11Y_TWEAKED = [
  '.btn--red',
  '.emergency-pill',
  '.chip-5g',
  '.dept__no',
  '.journey__steps li',
  '.coop__points span',
]

/** Regions relative to <main>, which is what gets screenshotted. */
function collectRegions(tweaked: string[]): Record<Category, Rect[]> {
  const origin = document.querySelector('main')!.getBoundingClientRect()
  const rect = (el: Element) => {
    const r = el.getBoundingClientRect()
    return { x: r.left - origin.left, y: r.top - origin.top, w: r.width, h: r.height }
  }
  return {
    images: [...document.querySelectorAll('img')].map(rect),
    a11yTweaks: tweaked.flatMap((sel) => [...document.querySelectorAll(sel)].map(rect)),
  }
}

/** Counts changed (red) diff pixels by cause: resampled photos, a11y colour tweaks, other. */
function attribute(diff: PNG, regions: Record<Category, Rect[]>) {
  const counts = { images: 0, a11yTweaks: 0, other: 0 }
  const inside = (list: Rect[], x: number, y: number) =>
    list.some((r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h)
  for (let y = 0; y < diff.height; y++) {
    for (let x = 0; x < diff.width; x++) {
      const i = (y * diff.width + x) * 4
      if (!(diff.data[i]! > 200 && diff.data[i + 1]! < 100)) continue
      if (inside(regions.images, x, y)) counts.images++
      else if (inside(regions.a11yTweaks, x, y)) counts.a11yTweaks++
      else counts.other++
    }
  }
  return counts
}

for (const width of BREAKPOINTS) {
  test(`home @ ${width}px matches the original`, async ({ browser }) => {
    mkdirSync(OUT, { recursive: true })
    const shots: Record<string, PNG> = {}
    let regions: Record<Category, Rect[]> = { images: [], a11yTweaks: [] }
    for (const [name, url] of Object.entries(SITES)) {
      const page = await browser.newPage({ viewport: { width, height: 900 } })
      await preparePage(page, url)
      await hideSkippedSections(page)
      if (name === 'next') regions = await page.evaluate(collectRegions, A11Y_TWEAKED)
      // <main> only: the header and footer are the Phase 1 design now.
      const buf = await page.locator('main').screenshot({ animations: 'disabled', caret: 'hide' })
      writeFileSync(join(OUT, `${width}-${name}.png`), buf)
      shots[name] = PNG.sync.read(buf)
      await page.close()
    }
    const a = shots.legacy!
    const b = shots.next!
    expect(b.height, 'main height must match the original').toBe(a.height)

    const diff = new PNG({ width: a.width, height: a.height })
    const changed = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 })
    writeFileSync(join(OUT, `${width}-diff.png`), PNG.sync.write(diff))
    const ratio = changed / (a.width * a.height)
    const breakdown = attribute(diff, regions)
    writeFileSync(
      join(OUT, `${width}.json`),
      JSON.stringify({ width, height: a.height, changed, ratio, breakdown }, null, 2),
    )
    expect(ratio, `${changed} px differ`).toBeLessThanOrEqual(MAX_DIFF_RATIO)
    // Anything outside resampled photos and the approved a11y tweaks is unexplained.
    expect(breakdown.other, 'unexplained changed pixels').toBeLessThanOrEqual(MAX_UNEXPLAINED_PX)
  })
}
