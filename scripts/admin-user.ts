/*
 * Creates an admin user, or resets the password of an existing one, from
 * ADMIN_EMAIL / ADMIN_PASSWORD (+ ADMIN_NAME). Also clears a login lockout.
 *
 *   pnpm admin:user
 *
 * Passwords must be at least MIN_PASSWORD_LENGTH characters, except against a
 * local database (127.0.0.1 / localhost), where short demo passwords are allowed.
 */
import mongoose from 'mongoose'

import { hashPassword, MIN_PASSWORD_LENGTH } from '../lib/auth/password'
import { User } from '../lib/db/models'

async function main() {
  const uri = process.env.MONGODB_URI
  const { ADMIN_EMAIL: rawEmail, ADMIN_PASSWORD: password, ADMIN_NAME: name } = process.env
  if (!uri) throw new Error('Set MONGODB_URI (see .env.example)')
  if (!rawEmail || !password) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD')

  const local = /^mongodb:\/\/(127\.0\.0\.1|localhost)[:/]/.test(uri)
  if (password.length < MIN_PASSWORD_LENGTH && !local)
    throw new Error(`ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters`)
  if (password.length < MIN_PASSWORD_LENGTH)
    console.warn(`  note: short password allowed only because the database is local`)

  await mongoose.connect(uri)
  const email = rawEmail.trim().toLowerCase()
  const existing = await User.findOne({ email })
  const passwordHash = await hashPassword(password)
  if (existing) {
    existing.passwordHash = passwordHash
    existing.failedLogins = 0
    existing.lockedUntil = undefined
    if (name) existing.name = name
    await existing.save()
    console.log(`  users: password reset for ${email}`)
  } else {
    await User.create({ email, name: name || 'Administrator', passwordHash })
    console.log(`  users: created ${email}`)
  }
  const all = await User.find({}, { email: 1 }).lean()
  console.log(`  all users: ${all.map((u) => u.email).join(', ')}`)
}

main()
  .then(() => mongoose.disconnect())
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error)
    await mongoose.disconnect()
    process.exit(1)
  })
