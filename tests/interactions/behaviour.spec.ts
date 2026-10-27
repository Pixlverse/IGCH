import { expect, test, type Page } from '@playwright/test'

import { SITES } from '../support/sites'

/*
 * Every behaviour from the original <script> (plus native ones) is asserted
 * against BOTH the original site and the Next.js build, so the expectations
 * are proven on the original first.
 */

async function open(page: Page, url: string) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(url, { waitUntil: 'networkidle' })
}

// Department counts differ on purpose: Next.js uses the Phase 1 department list.
const DEPARTMENTS = {
  legacy: { total: 30, broad: 12, clinical: 8 },
  next: { total: 31, broad: 14, clinical: 7 },
} as const

for (const [site, url] of Object.entries(SITES)) {
  const depts = DEPARTMENTS[site as keyof typeof DEPARTMENTS]
  test.describe(site, () => {
    test('mobile menu toggles nav and aria-expanded', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 800 })
      await open(page, url)
      const header = page.locator('#header')
      const toggle = page.locator('.menu-toggle')
      const nav = page.locator('.header .nav')
      await expect(nav).toBeHidden()
      await expect(toggle).toHaveAttribute('aria-expanded', 'false')
      await toggle.click()
      await expect(header).toHaveClass(/is-open/)
      await expect(toggle).toHaveAttribute('aria-expanded', 'true')
      await expect(nav).toBeVisible()
      await expect(nav).toHaveCSS('flex-direction', 'column')
      await toggle.click()
      await expect(toggle).toHaveAttribute('aria-expanded', 'false')
      await expect(nav).toBeHidden()
    })

    test('language toggle swaps pressed state', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await open(page, url)
      const [en, ml] = [page.locator('.lang button').nth(0), page.locator('.lang button').nth(1)]
      await expect(en).toHaveAttribute('aria-pressed', 'true')
      await ml.click()
      await expect(ml).toHaveClass(/is-on/)
      await expect(ml).toHaveAttribute('aria-pressed', 'true')
      await expect(en).toHaveAttribute('aria-pressed', 'false')
      await expect(en).not.toHaveClass(/is-on/)
    })

    test('department filter: counts, empty state, dimming', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await open(page, url)
      const groups = page.locator('.spec-group')
      const filter = page.locator('#spec-filter')
      await expect(filter).toHaveAttribute('placeholder', `Search ${depts.total} departments`)

      await filter.fill('onco')
      await expect(groups.nth(0).locator('.spec-group__count')).toHaveText('3 of 10')
      await expect(groups.nth(1).locator('.spec-group__count')).toHaveText(`0 of ${depts.broad}`)
      await expect(groups.nth(1)).toHaveClass(/is-dim/)
      await expect(groups.nth(1).locator('.spec-group__empty')).toBeVisible()
      await expect(groups.nth(0).locator('.dept-list li:visible')).toHaveCount(3)

      // matches on the number too, like the original (li.textContent)
      await filter.fill('01')
      await expect(groups.nth(2).locator('.spec-group__count')).toHaveText(`1 of ${depts.clinical}`)

      await filter.fill('')
      await expect(groups.nth(0).locator('.spec-group__count')).toHaveText('10 departments')
      await expect(groups.nth(1)).not.toHaveClass(/is-dim/)
      await expect(groups.nth(1).locator('.spec-group__empty')).toBeHidden()
    })

    test('"How it works" tracker follows hover, focus and click', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await open(page, url)
      const steps = page.locator('.journey__steps li')
      await expect(page.locator('#journey-step')).toHaveText('1')
      await expect(steps.nth(0)).toHaveClass(/is-active/)

      await page.locator('.spec-group').nth(1).locator('.spec-group__head').hover()
      await expect(page.locator('#journey-group')).toHaveText('Broad Specialities')
      await expect(page.locator('#journey-step')).toHaveText('2')
      await expect(steps.nth(0)).toHaveClass(/is-done/)

      const dept = page.locator('.spec-group').nth(1).locator('.dept').nth(3)
      await dept.hover()
      await expect(page.locator('#journey-dept')).toHaveText('Paediatrics')
      await expect(page.locator('#journey-step')).toHaveText('3')

      await dept.click()
      await expect(page).toHaveURL(url) // placeholder link does not navigate
      await expect(steps.nth(2)).toHaveClass(/is-done/)
      await expect(page.locator('#journey-step')).toHaveText('3')
      await expect(page.locator('#journey-bar')).toHaveAttribute('style', /width:\s*100%/)

      await page.locator('.spec-group').nth(2).locator('.dept').nth(0).focus()
      await expect(page.locator('#journey-group')).toHaveText('Clinical Support')
      await expect(page.locator('#journey-dept')).toHaveText('Emergency Medicine')
    })

    test('notice board tabs: click, keyboard, pill, view-all label', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await open(page, url)
      const ann = page.locator('#tab-ann')
      const ten = page.locator('#tab-ten')
      await expect(page.locator('#panel-ann')).toBeVisible()
      await expect(page.locator('#panel-ten')).toBeHidden()
      await expect(ann).toHaveText('Announcements 3')
      await expect(ten).toHaveText('Tenders 2')

      await ten.click()
      await expect(ten).toHaveAttribute('aria-selected', 'true')
      await expect(ann).toHaveAttribute('tabindex', '-1')
      await expect(page.locator('#panel-ten')).toBeVisible()
      await expect(page.locator('#panel-ann')).toBeHidden()
      await expect(page.locator('.board__tabs')).toHaveAttribute('data-active', '1')
      await expect(page.locator('#board-all')).toHaveText(/^View all tenders/)

      await ten.press('ArrowLeft') // original quirk: both arrows go to the next tab
      await expect(ann).toBeFocused()
      await expect(ann).toHaveAttribute('aria-selected', 'true')
      await expect(page.locator('#board-all')).toHaveText(/^View all announcements/)
      await ann.press('ArrowRight')
      await expect(ten).toBeFocused()
    })

    test('FAQ is an exclusive accordion, first item open', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await open(page, url)
      const items = page.locator('.faq details')
      await expect(items).toHaveCount(5)
      await expect(items.nth(0)).toHaveAttribute('open', '')
      await items.nth(2).locator('summary').click()
      await expect(items.nth(2)).toHaveAttribute('open', '')
      await expect(items.nth(0)).not.toHaveAttribute('open')
    })

    test('in-page anchors scroll to their sections', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await open(page, url)
      // the header nav now links to pages, so use the hero's in-page link
      await page.locator('.hero a[href="#doctors"]').click()
      await expect(page).toHaveURL(/#doctors$/)
      await expect
        .poll(() =>
          page.evaluate(() =>
            Math.round(document.getElementById('doctors')!.getBoundingClientRect().top),
          ),
        )
        .toBeLessThanOrEqual(1)
    })

    test('search submit stays on the page', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await open(page, url)
      await page.locator('#q').fill('cardiology')
      await page.locator('.search-form button[type=submit]').click()
      await expect(page).toHaveURL(url)
      await expect(page.locator('#q')).toHaveValue('cardiology')
    })
  })
}

test.describe('next-only', () => {
  test('no console warnings or errors', async ({ page }) => {
    const messages: string[] = []
    page.on('console', (m) => {
      if (m.type() === 'warning' || m.type() === 'error') messages.push(`${m.type()}: ${m.text()}`)
    })
    page.on('pageerror', (e) => messages.push(`pageerror: ${e.message}`))
    await page.goto(SITES.next, { waitUntil: 'networkidle' })
    await page.mouse.wheel(0, 20000)
    await page.waitForTimeout(800)
    expect(messages).toEqual([])
  })

  test('content is visible with JavaScript disabled', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto(SITES.next)
    const hidden = await page.locator('[data-reveal][style*="opacity"]').count()
    expect(hidden).toBe(0)
    await expect(page.locator('.faq h2')).toBeVisible()
    await context.close()
  })

  test('scroll reveals settle on the original resting state', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(SITES.next, { waitUntil: 'networkidle' })
    const total = await page.evaluate(() => document.body.scrollHeight)
    for (let y = 0; y < total; y += 400) {
      await page.evaluate((top) => window.scrollTo(0, top), y)
      await page.waitForTimeout(60)
    }
    await page.waitForTimeout(800)
    const leftovers = await page
      .locator('[data-reveal][style]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('style')).filter(Boolean))
    expect(leftovers).toEqual([])
  })

  test('reduced motion: nothing is hidden or animated', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(SITES.next, { waitUntil: 'networkidle' })
    expect(await page.locator('[data-reveal][style]').count()).toBe(0)
  })

  test('SEO tags, canonical, favicon and structured data', async ({ page, request }) => {
    await page.goto(SITES.next)
    await expect(page).toHaveTitle('Indira Gandhi Co-operative Hospital · Kadavanthra, Kochi')
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
      'href',
      'https://igchkochi.com',
    )
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      'https://igchkochi.com',
    )
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    )
    await expect(page.locator('link[rel=icon]').first()).toHaveAttribute('href', /icon\.png/)
    const ld = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}',
    )
    expect(ld['@graph'].map((n: { '@type': string }) => n['@type'])).toEqual([
      'Hospital',
      'FAQPage',
    ])
    expect((await request.get(`${SITES.next}robots.txt`)).ok()).toBe(true)
    expect((await request.get(`${SITES.next}sitemap.xml`)).ok()).toBe(true)
  })

  test('revalidate endpoint: auth, validation, success', async ({ request }) => {
    const endpoint = `${SITES.next}api/revalidate`
    expect((await request.post(endpoint, { data: {} })).status()).toBe(401)
    const wrong = { 'x-revalidate-secret': 'nope-nope-n' }
    expect((await request.post(endpoint, { headers: wrong, data: {} })).status()).toBe(401)

    const headers = { 'x-revalidate-secret': 'test-secret' }
    const bad = await request.post(endpoint, { headers, data: { documents: ['nope'] } })
    expect(bad.status()).toBe(400)

    const ok = await request.post(endpoint, {
      headers,
      data: { documents: ['doctors', 'faqs'], paths: ['/'] },
    })
    expect(ok.status()).toBe(200)
    expect(await ok.json()).toMatchObject({
      revalidated: true,
      tags: ['content:doctors', 'content:faqs'],
    })

    const all = await request.post(endpoint, { headers })
    expect(await all.json()).toMatchObject({ revalidated: true, tags: ['content'] })
    // the page still renders after invalidation
    expect((await request.get(SITES.next)).ok()).toBe(true)
  })
})
