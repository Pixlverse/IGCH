import { defineConfig, devices } from '@playwright/test'

export const ADMIN_URL = 'http://localhost:3200'

/*
 * Admin end-to-end suite: runs against a seeded throwaway MongoDB.
 *   pnpm test:admin
 * Kept separate from the main suite, which renders the seed files without a DB.
 */
export default defineConfig({
  testDir: './tests/admin',
  outputDir: './test-results/admin',
  // tests share one database and change it, so run them in order
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: [['list']],
  use: { ...devices['Desktop Chrome'], baseURL: ADMIN_URL, deviceScaleFactor: 1 },
  webServer: {
    command: 'node scripts/admin-test-server.mjs',
    url: `${ADMIN_URL}/admin/login`,
    reuseExistingServer: false,
    timeout: 300_000,
  },
})
