import { expect, test, type Page } from '@playwright/test'

/*
 * Admin panel end to end, against a seeded MongoDB (scripts/admin-test-server.mjs).
 * Each test signs in; changes made here must show up on the public site
 * immediately (updateTag), without a rebuild.
 */

const ADMIN = { email: 'admin@igch.test', password: 'correct-horse-battery' }

/** Confirms the open confirmation modal and waits for it to close. */
async function confirmModal(page: Page, label: string) {
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: label, exact: true }).click()
  await expect(dialog).toBeHidden()
}

async function signIn(page: Page, user = ADMIN) {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill(user.email)
  await page.getByLabel('Password').fill(user.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/admin$/)
}

test('signed-out visitors are sent to the login page', async ({ page }) => {
  await page.goto('/admin/doctors')
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fdoctors$/)
})

test('wrong password is rejected without revealing which part was wrong', async ({ page }) => {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill(ADMIN.email)
  await page.getByLabel('Password').fill('not-the-password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.locator('.admin-alert')).toHaveText('Email or password is incorrect.')
})

test('sign in returns to the requested page; dashboard shows seeded counts', async ({ page }) => {
  await page.goto('/admin/news')
  await page.getByLabel('Email').fill(ADMIN.email)
  await page.getByLabel('Password').fill(ADMIN.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/admin\/news$/)
  await page.getByRole('link', { name: 'Dashboard' }).click()
  await expect(page.locator('.admin-stat', { hasText: 'Doctors' })).toContainText('12')
  await expect(page.locator('.admin-stat', { hasText: 'Departments' })).toContainText('31')
  // seed placeholders are flagged, and recent edits are listed
  await expect(page.locator('.admin-panel', { hasText: 'Needs attention' })).toContainText(
    'Doctors',
  )
  await expect(
    page.locator('.admin-panel', { hasText: 'Recently updated' }).locator('li'),
  ).toHaveCount(6)
})

test('adding a doctor shows them on the website straight away', async ({ page }) => {
  await signIn(page)
  await page.goto('/admin/doctors/new')
  await page.getByLabel('Name *').fill('Dr. Test Physician')
  await page.getByLabel('Speciality').fill('Cardiology')
  await page.getByLabel('Super Specialities').check()
  await page.getByLabel('Featured doctor').check()
  await page.getByLabel('Upload image').setInputFiles('public/images/nigil.jpg')
  await expect(page.locator('.admin-upload__status')).toContainText('New image selected: nigil.jpg')
  await page.getByLabel('Image description (alt text)').fill('Portrait of Dr. Test Physician')
  await page.getByRole('button', { name: 'Add doctor' }).click()
  // the list opens on the page with the new doctor (13th → page 2), highlighted
  await expect(page).toHaveURL(/\/admin\/doctors\?saved=\w+&page=2$/)
  await expect(page.locator('tr.is-saved')).toContainText('Dr. Test Physician')

  await page.goto('/specialities/super-specialities')
  const card = page.locator('#doctors .doctor', { hasText: 'Dr. Test Physician' })
  await expect(card).toBeVisible()
  await expect(card.locator('img')).toHaveAttribute('alt', 'Portrait of Dr. Test Physician')
  // the uploaded file is actually served (next/image fetches it from /uploads)
  await expect
    .poll(() =>
      card.locator('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth),
    )
    .toBeGreaterThan(0)
  await page.goto('/')
  await expect(page.locator('#doctors .doctor', { hasText: 'Dr. Test Physician' })).toBeVisible()
})

test('validation errors keep what was typed', async ({ page }) => {
  await signIn(page)
  await page.goto('/admin/news/new')
  await page.getByLabel('Summary').fill('Kept after the error')
  await page.getByRole('button', { name: 'Add news story' }).click()
  await expect(page.getByText('Headline is required')).toBeVisible()
  await expect(page.getByLabel('Summary')).toHaveValue('Kept after the error')
})

test('a news story with text gets its own page and leads when featured', async ({ page }) => {
  await signIn(page)
  await page.goto('/admin/news/new')
  await page.getByLabel('Headline *').fill('New cath lab opens')
  await page.getByLabel('Date').fill('2026-10-20')
  await page.getByLabel('Summary').fill('A second cath lab shortens waiting times.')
  await page.getByLabel('Full story').fill('First paragraph.\n\nSecond paragraph.')
  await page.getByLabel('Order').fill('0')
  await page.getByRole('button', { name: 'Add news story' }).click()
  await expect(page).toHaveURL(/saved=\w+/)

  await page.goto('/news')
  const card = page.getByRole('link', { name: /New cath lab opens/ }).first()
  await expect(card).toHaveAttribute('href', '/news/new-cath-lab-opens')
  await page.goto('/news/new-cath-lab-opens')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('New cath lab opens')
  await expect(page.getByText('20 Oct 2026')).toBeVisible()
  await expect(page.locator('.story-page__body p')).toHaveCount(2)
})

test('hiding an item removes it from the website; showing it brings it back', async ({ page }) => {
  await signIn(page)
  await page.goto('/admin/faqs')
  const row = page.locator('tbody tr').first()
  const question = (await row.locator('th').textContent())!.trim()
  await row.getByRole('button', { name: /Visible/ }).click()
  await confirmModal(page, 'Hide')
  await expect(row.getByRole('button', { name: /Hidden/ })).toBeVisible()
  await page.goto('/')
  await expect(page.locator('.faq summary', { hasText: question })).toHaveCount(0)

  await page.goto('/admin/faqs')
  const again = page.locator('tbody tr').first()
  await again.getByRole('button', { name: /Hidden/ }).click()
  await confirmModal(page, 'Show on website')
  await expect(again.getByRole('button', { name: /Visible/ })).toBeVisible()
  await page.goto('/')
  await expect(page.locator('.faq summary', { hasText: question })).toHaveCount(1)
})

test('editing a department updates the speciality page', async ({ page }) => {
  await signIn(page)
  await page.goto('/admin/departments?q=Urology')
  await page.getByRole('link', { name: 'Urology', exact: true }).click()
  await page.getByLabel('One-line description').fill('Kidney stones, prostate and bladder care.')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page).toHaveURL(/saved=\w+/)
  await page.goto('/specialities/super-specialities')
  await expect(page.locator('#dept-urology')).toContainText(
    'Kidney stones, prostate and bladder care.',
  )
})

test('site settings change the header on every page', async ({ page }) => {
  await signIn(page)
  await page.goto('/admin/settings')
  await page.getByLabel('Message').fill('OPD timings change on Onam')
  await page.getByRole('button', { name: 'Save settings' }).click()
  await expect(page.locator('.admin-alert')).toContainText('Settings saved')
  await page.goto('/about')
  await expect(page.locator('.topbar__news')).toContainText('OPD timings change on Onam')
})

test('tenders get a document link and closing date', async ({ page }) => {
  await signIn(page)
  await page.goto('/admin/notices/new')
  await page.getByLabel('Type').selectOption('tender')
  await page.getByLabel('Title *').fill('Supply of surgical consumables')
  await page.getByLabel('Date').fill('2026-11-30')
  await page.getByLabel('Tender status').fill('Open')
  await page.getByRole('button', { name: 'Add notice' }).click()
  await expect(page).toHaveURL(/saved=\w+/)
  await page.goto('/news')
  const tender = page.locator('#tenders li', { hasText: 'Supply of surgical consumables' })
  await expect(tender).toContainText('Last date: 30 Nov 2026')
})

test('users: add a user who can then sign in; the last user cannot be removed', async ({
  page,
}) => {
  await signIn(page)
  await page.goto('/admin/users')
  await expect(page.getByRole('button', { name: 'Remove' })).toHaveCount(0)
  await page.getByLabel('Name').fill('Second Editor')
  await page.getByLabel('Email').fill('editor@igch.test')
  await page.getByLabel('Temporary password').fill('another-long-password')
  await page.getByRole('button', { name: 'Add user' }).click()
  await expect(page.getByRole('cell', { name: 'editor@igch.test' })).toBeVisible()

  await page.getByRole('button', { name: 'Sign out' }).click()
  await confirmModal(page, 'Sign out')
  await expect(page).toHaveURL(/\/admin\/login$/)
  await signIn(page, { email: 'editor@igch.test', password: 'another-long-password' })
  await expect(page.locator('.admin-user')).toContainText('Second Editor')
})

test('changing my password', async ({ page }) => {
  await signIn(page, { email: 'editor@igch.test', password: 'another-long-password' })
  await page.goto('/admin/account')
  await page.getByLabel('Current password').fill('another-long-password')
  await page.getByLabel('New password', { exact: true }).fill('an-even-longer-password')
  await page.getByLabel('Repeat new password').fill('an-even-longer-password')
  await page.getByRole('button', { name: 'Change password' }).click()
  await expect(page.locator('.admin-alert')).toHaveText('Password changed.')
  await page.getByRole('button', { name: 'Sign out' }).click()
  await confirmModal(page, 'Sign out')
  await expect(page).toHaveURL(/\/admin\/login$/)
  await signIn(page, { email: 'editor@igch.test', password: 'an-even-longer-password' })
})

test('admin screens have no axe violations and fit a phone screen', async ({ page }) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright')
  await page.goto('/admin/login')
  await page.locator('#f-email').waitFor()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await signIn(page)
  for (const path of [
    '/admin',
    '/admin/doctors',
    '/admin/news/new',
    '/admin/careers/new',
    '/admin/settings',
    '/admin/users',
  ]) {
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(path)
      await page.locator('.admin-head h1').waitFor()
      const { violations } = await new AxeBuilder({ page }).analyze()
      expect(
        violations.map(
          (v) => `${path} @${width}: ${v.id} ${v.nodes.map((n) => n.target).join(' ')}`,
        ),
      ).toEqual([])
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      )
    }
  }
})

test('lists are paginated and searchable', async ({ page }) => {
  await signIn(page)
  await page.goto('/admin/departments')
  await expect(page.locator('tbody tr')).toHaveCount(10)
  await expect(page.locator('.admin-pager')).toContainText('Showing 1–10 of 31')
  await page.getByRole('link', { name: 'Page 4' }).click()
  await expect(page).toHaveURL(/page=4/)
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await page.getByRole('searchbox', { name: 'Search departments' }).fill('onco')
  await page.getByRole('button', { name: 'Search' }).click()
  await expect(page).toHaveURL(/q=onco/)
  await expect(page.locator('tbody tr')).toHaveCount(3)
  await expect(page.locator('.admin-pager')).toContainText('Showing 1–3 of 3')
})

test('an image can be removed from the form', async ({ page }) => {
  await signIn(page)
  await page.goto('/admin/doctors?q=Test%20Physician')
  await page.getByRole('link', { name: 'Dr. Test Physician', exact: true }).click()
  await page.getByRole('button', { name: 'Remove' }).click()
  await expect(page.locator('.admin-upload__status')).toContainText('will be removed')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page).toHaveURL(/saved=\w+/)
  await page.goto('/specialities/super-specialities')
  const card = page.locator('#doctors .doctor', { hasText: 'Dr. Test Physician' })
  await expect(card.locator('img')).toHaveCount(0)
  await expect(card.locator('svg.illus')).toHaveCount(1)
})

test('job openings appear on the Careers page with an apply link', async ({ page }) => {
  await signIn(page)
  await page.goto('/careers')
  await expect(page.locator('.jobs-empty')).toBeVisible()

  await page.goto('/admin/settings')
  await page.getByLabel('Careers / HR email').fill('hr@igch.test')
  await page.getByRole('button', { name: 'Save settings' }).click()
  await expect(page.locator('.admin-alert')).toContainText('Settings saved')

  await page.goto('/admin/careers/new')
  await page.getByLabel('Job title *').fill('Staff Nurse – ICU')
  await page.getByLabel('Department').fill('Critical Care')
  await page.getByLabel('Last date to apply').fill('2026-12-15')
  await page.getByLabel('Summary').fill('Registered nurses for our 24-bed ICU.')
  await page
    .getByLabel('Full description')
    .fill('GNM or B.Sc Nursing.\n\nKNMC registration required.')
  await page.getByRole('button', { name: 'Add job opening' }).click()
  await expect(page).toHaveURL(/saved=\w+/)

  await page.goto('/careers')
  const job = page.locator('.job', { hasText: 'Staff Nurse – ICU' })
  await expect(job).toContainText('Apply by 15 Dec 2026')
  await expect(page.locator('.jobs-count')).toContainText('1 open position')
  await expect(job.getByRole('link', { name: 'Apply now' })).toHaveAttribute(
    'href',
    /^mailto:hr@igch\.test\?subject=Application/,
  )
  await job.getByText('View details').click()
  await expect(job.locator('.job__details p')).toHaveCount(2)
  await expect(page.getByRole('link', { name: 'Send your CV' })).toHaveAttribute(
    'href',
    /^mailto:hr@igch\.test/,
  )
})

test('confirmation modal: Cancel, Escape and the backdrop do nothing; Delete deletes', async ({
  page,
}) => {
  await signIn(page)
  await page.goto('/admin/notices/new')
  await page.getByLabel('Title *').fill('Modal test notice')
  await page.getByRole('button', { name: 'Add notice' }).click()
  await expect(page).toHaveURL(/saved=\w+/)
  const row = page.locator('tbody tr', { hasText: 'Modal test notice' })
  const dialog = page.getByRole('dialog')

  // Cancel keeps it
  await row.getByRole('button', { name: 'Delete Modal test notice' }).click()
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText('Delete this notice?')
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused()
  await dialog.getByRole('button', { name: 'Cancel' }).click()
  await expect(dialog).toBeHidden()

  // Escape keeps it
  await row.getByRole('button', { name: 'Delete Modal test notice' }).click()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()

  // a click on the backdrop keeps it
  await row.getByRole('button', { name: 'Delete Modal test notice' }).click()
  await page.mouse.click(5, 5)
  await expect(dialog).toBeHidden()
  await expect(row).toHaveCount(1)

  // confirming deletes it
  await row.getByRole('button', { name: 'Delete Modal test notice' }).click()
  await confirmModal(page, 'Delete')
  await expect(page).toHaveURL(/deleted=1/)
  await expect(page.locator('tbody tr', { hasText: 'Modal test notice' })).toHaveCount(0)
})
