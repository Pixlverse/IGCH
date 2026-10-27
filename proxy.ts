import { NextResponse, type NextRequest } from 'next/server'

import { SESSION_COOKIE, verifySession } from '@/lib/auth/token'

/*
 * Optimistic admin guard: signed-out visitors are sent to the login page
 * before any admin page renders. The real check (user still exists) happens
 * in lib/auth/dal.ts on every admin page and server action.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const signedIn = await verifySession(request.cookies.get(SESSION_COOKIE)?.value)
  if (pathname === '/admin/login') {
    return signedIn ? NextResponse.redirect(new URL('/admin', request.url)) : NextResponse.next()
  }
  if (!signedIn) {
    const login = new URL('/admin/login', request.url)
    if (pathname !== '/admin') login.searchParams.set('next', pathname)
    return NextResponse.redirect(login)
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin', '/admin/:path*'] }
