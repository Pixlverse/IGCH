/*
 * Seeds MongoDB with the default content in content/seed (the site as it
 * ships) and creates the first admin user.
 *
 *   pnpm seed            fill empty collections only (safe to re-run in production)
 *   pnpm seed --reset    replace ALL content collections with the seed data
 *                        (users are never touched)
 *
 * Env: MONGODB_URI (required), ADMIN_EMAIL + ADMIN_PASSWORD (+ ADMIN_NAME)
 * to create the first user when there are none.
 */
import mongoose from 'mongoose'

import articles from '../content/seed/articles.json'
import careers from '../content/seed/careers.json'
import departments from '../content/seed/departments.json'
import doctors from '../content/seed/doctors.json'
import faqs from '../content/seed/faqs.json'
import news from '../content/seed/news.json'
import notices from '../content/seed/notices.json'
import settings from '../content/seed/settings.json'
import { hashPassword, MIN_PASSWORD_LENGTH } from '../lib/auth/password'
import { COLLECTIONS, collectionModel, Setting, User, type CollectionName } from '../lib/db/models'

const SEEDS: Record<CollectionName, Record<string, unknown>[]> = {
  doctors,
  departments,
  news,
  notices,
  articles,
  faqs,
  careers,
}

const reset = process.argv.includes('--reset')

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('Set MONGODB_URI (see .env.example)')
  await mongoose.connect(uri)
  console.log(`Connected to ${mongoose.connection.host}/${mongoose.connection.name}`)

  for (const name of Object.keys(COLLECTIONS) as CollectionName[]) {
    const model = collectionModel(name)
    await model.syncIndexes()
    const count = await model.countDocuments()
    if (count > 0 && !reset) {
      console.log(`  ${name}: ${count} existing, left as is`)
      continue
    }
    if (reset) await model.deleteMany({})
    await model.insertMany(SEEDS[name])
    console.log(`  ${name}: seeded ${SEEDS[name].length}`)
  }

  await Setting.syncIndexes()
  const site = await Setting.findOne({ key: 'site' })
  if (!site || reset) {
    await Setting.updateOne({ key: 'site' }, { $set: { data: settings } }, { upsert: true })
    console.log('  settings: seeded')
  } else console.log('  settings: existing, left as is')

  await User.syncIndexes()
  if ((await User.countDocuments()) === 0) {
    const {
      ADMIN_EMAIL: email,
      ADMIN_PASSWORD: password,
      ADMIN_NAME: name = 'Administrator',
    } = process.env
    if (!email || !password) {
      console.warn(
        '  users: none yet. Re-run with ADMIN_EMAIL and ADMIN_PASSWORD to create the first admin.',
      )
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters`)
    } else {
      await User.create({ email, name, passwordHash: await hashPassword(password) })
      console.log(`  users: created ${email}`)
    }
  } else console.log(`  users: ${await User.countDocuments()} existing, left as is`)
}

main()
  .then(() => mongoose.disconnect())
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error)
    await mongoose.disconnect()
    process.exit(1)
  })
