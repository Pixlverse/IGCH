/*
 * Local MongoDB for development without Docker or Atlas: runs a real mongod
 * (downloaded by mongodb-memory-server) with data kept in .data/mongo.
 *
 *   pnpm db:dev   → mongodb://127.0.0.1:27017/igch
 */
import { mkdirSync } from 'node:fs'
import { createConnection } from 'node:net'

import { MongoMemoryServer } from 'mongodb-memory-server'

const PORT = 27017
const dbPath = '.data/mongo'

/** True when something already listens on the port (usually this DB in another terminal). */
const portInUse = () =>
  new Promise((resolve) => {
    const socket = createConnection({ host: '127.0.0.1', port: PORT })
    socket.once('connect', () => (socket.destroy(), resolve(true)))
    socket.once('error', () => resolve(false))
  })

if (await portInUse()) {
  console.log(
    `Port ${PORT} is already in use: a MongoDB is probably running already (another terminal?).\n` +
      `If it is this project's database, you can just run \`pnpm dev\`.\n` +
      `Otherwise stop it first, e.g.: lsof -nP -iTCP:${PORT} -sTCP:LISTEN  → kill <PID>`,
  )
  process.exit(1)
}

mkdirSync(dbPath, { recursive: true })
const server = await MongoMemoryServer.create({
  instance: { port: PORT, dbPath, storageEngine: 'wiredTiger' },
})
console.log(`MongoDB running: ${server.getUri()}igch  (data in ${dbPath}, Ctrl+C to stop)`)
const stop = async () => {
  await server.stop({ doCleanup: false })
  process.exit(0)
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
