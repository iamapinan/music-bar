import { cookies } from 'next/headers'
import { adminAuth } from '@/lib/firebase/admin'

export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'music_bar_session'
export const ACTIVE_TENANT_COOKIE_NAME = 'music_bar_active_tenant'

export type SessionUser = {
  firebaseUid: string
  email: string
  name: string | null
  picture: string | null
}

export async function createFirebaseSession(idToken: string) {
  const days = Number(process.env.SESSION_COOKIE_DAYS || 7)
  const expiresIn = days * 24 * 60 * 60 * 1000
  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: Math.floor(expiresIn / 1000),
    path: '/',
  })

  return sessionCookie
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!sessionCookie) return null

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
    return {
      firebaseUid: decoded.uid,
      email: decoded.email || '',
      name: typeof decoded.name === 'string' ? decoded.name : null,
      picture: typeof decoded.picture === 'string' ? decoded.picture : null,
    }
  } catch {
    return null
  }
}

export async function clearFirebaseSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  cookieStore.delete(ACTIVE_TENANT_COOKIE_NAME)
}

export async function setActiveTenantCookie(tenantId: string) {
  const cookieStore = await cookies()
  cookieStore.set(ACTIVE_TENANT_COOKIE_NAME, tenantId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
}
