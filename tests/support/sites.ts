import type { Page } from '@playwright/test'

export const SITES = {
  legacy: 'http://localhost:4100/',
  next: 'http://localhost:3100/',
} as const
export type SiteName = keyof typeof SITES

/** Inner pages built from the Phase 1 designs (Next.js only, no legacy original). */
export const PAGES = [
  '/about',
  '/specialities',
  '/specialities/super-specialities',
  '/specialities/broad-specialities',
  '/specialities/clinical-support',
  '/news',
  '/wellness-library',
  '/facilities',
  '/careers',
] as const

export const BREAKPOINTS = [320, 375, 768, 1024, 1280, 1440, 1920] as const

/** Loads a page into a deterministic state for screenshots. */
export async function preparePage(page: Page, url: string) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(url, { waitUntil: 'networkidle' })
  // Load every lazy image so both sites are fully painted.
  await page.evaluate(async () => {
    document.querySelectorAll('img').forEach((img) => (img.loading = 'eager'))
    // Scroll through the page as well, in case a browser ignores the switch.
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y)
      await new Promise((r) => requestAnimationFrame(r))
    }
    window.scrollTo(0, 0)
    const deadline = Date.now() + 15_000
    while (Date.now() < deadline) {
      const pending = Array.from(document.images).filter((i) => !i.complete || i.naturalWidth === 0)
      if (pending.length === 0) break
      await new Promise((r) => setTimeout(r, 100))
    }
    await Promise.all(Array.from(document.images).map((i) => i.decode().catch(() => {})))
    await document.fonts.ready
  })
  await page.addStyleTag({ content: '*{caret-color:transparent!important}' })
  await page.mouse.move(0, 0)
  await page.waitForTimeout(150)
}
