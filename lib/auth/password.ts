import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

/*
 * Password hashing with Node's built-in scrypt (no native dependency).
 * Stored as `scrypt$<N>$<salt b64>$<hash b64>` so the cost can be raised later.
 */

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>

const N = 16384
const KEYLEN = 64
const params = (n: number) => ({ N: n, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })

export const MIN_PASSWORD_LENGTH = 10

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const hash = await scryptAsync(password, salt, KEYLEN, params(N))
  return `scrypt$${N}$${salt.toString('base64')}$${hash.toString('base64')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, n, salt, hash] = stored.split('$')
  if (scheme !== 'scrypt' || !n || !salt || !hash) return false
  const expected = Buffer.from(hash, 'base64')
  const actual = await scryptAsync(
    password,
    Buffer.from(salt, 'base64'),
    expected.length,
    params(Number(n)),
  )
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}
