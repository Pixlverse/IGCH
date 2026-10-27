import { jwtVerify, SignJWT } from 'jose'

/*
 * Signed session token (HS256). Kept free of next/headers so proxy.ts can
 * verify it too. The token only carries the user id; every admin request
 * re-checks that the user still exists (lib/auth/dal.ts).
 */

export const SESSION_COOKIE = 'igch_admin'
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7

function key() {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32)
    throw new Error('SESSION_SECRET must be set to at least 32 characters (openssl rand -hex 32)')
  return new TextEncoder().encode(secret)
}

export async function signSession(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(key())
}

/** The user id for a valid, unexpired token; otherwise null. */
export async function verifySession(token: string | undefined): Promise<string | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ['HS256'] })
    return typeof payload.sub === 'string' ? payload.sub : null
  } catch {
    return null
  }
}
