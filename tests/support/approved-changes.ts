import type { Page } from '@playwright/test'

/*
 * Deliberate home-page changes made after the migration (Phase 1 pages, see
 * MIGRATION_NOTES.md §12). Parity tests compare <main> only, because the
 * header and footer were replaced by the Phase 1 design.
 */

/**
 * Excluded from parity: sections whose data is now admin-managed (MongoDB /
 * content/seed) and has intentionally changed: departments (Phase 1 list),
 * news + notice board (one news collection) and the article cards.
 */
export const PARITY_SKIP = '#specialities, #news, #blogs'

/** Section links that now point at the new pages (link text → new href). */
const NEW_LINK_TARGETS: Record<string, string> = {
  'All specialities': '/specialities',
  'All departments': '/specialities',
  'Meet your doctors': '/specialities#find-a-doctor',
  'All facilities': '/facilities',
  'Learn About Us': '/about',
  'All news & updates': '/news',
  'All blogs': '/wellness-library',
}

/** Replays the approved link changes on the original DOM. */
export async function applyApprovedLinkChanges(page: Page) {
  await page.evaluate((targets) => {
    document.querySelectorAll('main a').forEach((a) => {
      const text = (a.textContent ?? '').replace(/→/g, '').trim()
      if (text in targets) a.setAttribute('href', targets[text]!)
    })
  }, NEW_LINK_TARGETS)
}

/**
 * Hides the excluded section so both pages lay out the remaining sections
 * identically, and the (different) sticky header so it can't paint over <main>.
 */
export async function hideSkippedSections(page: Page) {
  await page.addStyleTag({
    content: `${PARITY_SKIP},.header,.topbar{display:none!important}`,
  })
}
