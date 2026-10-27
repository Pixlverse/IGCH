/*
 * Server for the admin end-to-end suite (playwright.admin.config.ts):
 * a throwaway MongoDB, seeded, plus a production build in .next-admin.
 */
import { spawn } from 'node:child_process'

import { MongoMemoryServer } from 'mongodb-memory-server'

const PORT = process.env.PORT ?? '3200'
const mongo = await MongoMemoryServer.create()
const env = {
  ...process.env,
  MONGODB_URI: `${mongo.getUri()}igch-test`,
  SESSION_SECRET: 'test-session-secret-0123456789abcdef0123456789',
  ADMIN_EMAIL: 'admin@igch.test',
  ADMIN_PASSWORD: 'correct-horse-battery',
  ADMIN_NAME: 'Test Admin',
  NEXT_DIST_DIR: '.next-admin',
  REVALIDATE_SECRET: 'test-secret',
}

// async on purpose: a blocking spawnSync would stall mongod (its log pipe fills up)
const run = (args) =>
  new Promise((resolve) => {
    const child = spawn('pnpm', args, { env, stdio: 'inherit' })
    child.on('exit', async (code) => {
      if (code === 0) return resolve()
      await mongo.stop()
      process.exit(code ?? 1)
    })
  })
await run(['seed'])
await run(['exec', 'next', 'build'])

const server = spawn('pnpm', ['exec', 'next', 'start', '--port', PORT], { env, stdio: 'inherit' })
const stop = async () => {
  server.kill('SIGTERM')
  await mongo.stop()
  process.exit(0)
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
server.on('exit', async (code) => {
  await mongo.stop()
  process.exit(code ?? 0)
})
