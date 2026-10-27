import 'server-only'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'

import { connectDb } from '@/lib/db/mongo'
import { User } from '@/lib/db/models'

import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, verifySession } from './token'

/*
 * Data Access Layer for admin auth: the only place that reads the session.
 * Pages and server actions call requireUser(); proxy.ts only does an
 * optimistic redirect for signed-out visitors.
 */

export type AdminUser = { id: string; email: string; name: string }

export const LOGIN_PATH = '/admin/login'

export async function startSession(userId: string) {
  const store = await cookies()
  store.set(SESSION_COOKIE, await signSession(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  })
}

export async function endSession() {
  ;(await cookies()).delete(SESSION_COOKIE)
}

/** The signed-in user, or null. Deduplicated per request. */
export const getCurrentUser = cache(async (): Promise<AdminUser | null> => {
  const userId = await verifySession((await cookies()).get(SESSION_COOKIE)?.value)
  if (!userId) return null
  await connectDb()
  const user = await User.findById(userId)
    .lean()
    .catch(() => null)
  return user ? { id: String(user._id), email: user.email, name: user.name } : null
})

/** The signed-in user; otherwise redirects to the login page. */
export async function requireUser(): Promise<AdminUser> {
  const user = await getCurrentUser()
  if (!user) redirect(LOGIN_PATH)
  return user
}
