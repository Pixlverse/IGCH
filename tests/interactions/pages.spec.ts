import { expect, test, type Page } from '@playwright/test'

import { PAGES, SITES } from '../support/sites'

/* Phase 1 inner pages (Next.js only: there is no legacy original). */

const url = (path: string) => new URL(path, SITES.next).toString()

async function open(page: Page, path: string) {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(url(path), { waitUntil: 'networkidle' })
}

for (const path of PAGES) {
  test(`${path}: renders cleanly with its own metadata`, async ({ page }) => {
    const messages: string[] = []
    page.on('console', (m) => {
      if (m.type() === 'warning' || m.type() === 'error') messages.push(`${m.type()}: ${m.text()}`)
    })
    page.on('pageerror', (e) => messages.push(`pageerror: ${e.message}`))
    await open(page, path)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('.crumbs [aria-current=page]')).toBeVisible()
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
      'href',
      `https://igchkochi.com${path}`,
    )
    await expect(page).not.toHaveTitle('Indira Gandhi Co-operative Hospital · Kadavanthra, Kochi')
    expect(messages).toEqual([])
  })
}

test('header nav marks the current section and opens dropdowns', async ({ page }) => {
  await open(page, '/specialities/clinical-support')
  const current = page.locator('.nav__link[aria-current=page]')
  await expect(current).toHaveCount(1)
  await expect(current).toHaveText('Specialities')
  const about = page.locator('.nav__item--menu').first()
  await about.hover()
  await expect(about.locator('.nav__menu')).toBeVisible()
  await about.getByRole('link', { name: 'Leadership' }).click()
  await expect(page).toHaveURL(/\/about#leadership$/)
})

test('speciality search lists matching departments', async ({ page }) => {
  await open(page, '/specialities')
  await page.locator('#speciality-q').fill('kidney')
  await page.locator('#speciality-q').press('Enter')
  const result = page.locator('.search-results a')
  await expect(result).toHaveCount(1)
  await expect(result).toHaveAttribute('href', '/specialities/super-specialities#dept-nephrology')
})

test('doctor finder filters by speciality and name', async ({ page }) => {
  await open(page, '/specialities')
  const cards = page.locator('.finder__results .doctor')
  await expect(cards).toHaveCount(4) // featured doctors before a search
  await page.locator('.finder__form select').first().selectOption('Cardiology')
  await page.getByRole('button', { name: 'Find a doctor' }).click()
  await expect(cards).toHaveCount(1)
  await expect(cards.locator('h3')).toHaveText('Dr. Nigil Cletus')
  await page.locator('.finder__form select').first().selectOption('')
  await page.locator('.finder__form input').fill('zzz')
  await page.getByRole('button', { name: 'Find a doctor' }).click()
  await expect(page.locator('.finder__empty')).toBeVisible()
})

test('group pages list their own departments and doctors', async ({ page }) => {
  await open(page, '/specialities/broad-specialities')
  await expect(page.locator('.dept-card')).toHaveCount(14)
  await expect(page.locator('.count-card strong')).toHaveText('14')
  await expect(page.locator('.pills [aria-current=page]')).toHaveText('Broad Specialities')
  await expect(page.locator('#doctors .doctor')).toHaveCount(4)
})

test('news filters show only the chosen kind of update', async ({ page }) => {
  await open(page, '/news')
  await expect(page.locator('.news-feature')).toBeVisible()
  await page.getByRole('button', { name: 'Tenders' }).click()
  await expect(page.getByRole('button', { name: 'Tenders' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(page.locator('.news-feature')).toHaveCount(0)
  await expect(page.locator('#announcements')).toHaveCount(0)
  await expect(page.locator('#tenders')).toBeVisible()
  await page.getByRole('button', { name: 'News', exact: true }).click()
  await expect(page.locator('.board-col')).toHaveCount(0)
  await expect(page.locator('.news-latest .article-card')).toHaveCount(6)
})

test('wellness library filters, searches and pages', async ({ page }) => {
  await open(page, '/wellness-library')
  const cards = page.locator('.article-grid .article-card')
  await expect(cards).toHaveCount(9)
  await page.locator('.pagination').getByRole('button', { name: '2' }).click()
  await expect(cards).toHaveCount(1)
  await page.getByRole('button', { name: 'Heart', exact: true }).click()
  await expect(cards).toHaveCount(2)
  await expect(page.locator('.library-feature')).toHaveCount(0)
  await expect(page.locator('.pagination')).toHaveCount(0)
  await page.getByRole('button', { name: 'All', exact: true }).click()
  await page.locator('#library-q').fill('dialysis')
  await page.locator('#library-q').press('Enter')
  await expect(cards.first()).toContainText('Living well on dialysis')
})

test('mobile menu closes after navigating to another page', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto(url('/about'), { waitUntil: 'networkidle' })
  await page.locator('.menu-toggle').click()
  await expect(page.locator('#main-nav')).toBeVisible()
  await page.locator('#main-nav').getByRole('link', { name: 'News & Updates' }).click()
  await expect(page).toHaveURL(/\/news$/)
  await expect(page.locator('#main-nav')).toBeHidden()
})
