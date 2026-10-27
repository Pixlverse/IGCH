import { defineConfig, devices } from '@playwright/test'

export const LEGACY_URL = 'http://localhost:4100'
export const NEXT_URL = 'http://localhost:3100'

export default defineConfig({
  testDir: './tests',
  // the admin suite needs a database: pnpm test:admin
  testIgnore: ['admin/**'],
  outputDir: './test-results',
  fullyParallel: true,
  workers: 4,
  timeout: 90_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { ...devices['Desktop Chrome'], deviceScaleFactor: 1 },
  webServer: [
    {
      command: 'node scripts/serve-legacy.mjs',
      url: LEGACY_URL,
      reuseExistingServer: !process.env.CI,
    },
    {
      // Compare against the production build: run `pnpm build` first.
      command: 'pnpm start --port 3100',
      env: { REVALIDATE_SECRET: 'test-secret' },
      url: NEXT_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
})
