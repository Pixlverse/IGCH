import mongoose from 'mongoose'

/*
 * One shared Mongoose connection per server process. In dev, Next.js reloads
 * modules on every change, so the promise lives on globalThis to avoid opening
 * a new connection each time.
 *
 * No MONGODB_URI means "no database": the site renders from content/seed
 * (local dev without a DB, CI and the Playwright suite).
 */

const globalForMongo = globalThis as unknown as { mongoose?: Promise<typeof mongoose> }

export function isDbConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI)
}

export async function connectDb(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set')
  globalForMongo.mongoose ??= mongoose
    .connect(uri, { serverSelectionTimeoutMS: 8000, maxPoolSize: 10 })
    .catch((error) => {
      // let the next call retry instead of caching the failure
      globalForMongo.mongoose = undefined
      throw error
    })
  return globalForMongo.mongoose
}
