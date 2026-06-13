import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'crypto'
import { adminAuth } from '@/lib/firebase/admin'
import { syntheticPinUid } from '@/lib/auth/pin'

export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'music_bar_session'
export const ACTIVE_TENANT_COOKIE_NAME = 'music_bar_active_tenant'
const PIN_SESSION_PREFIX = 'pin'

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

function getPinSessionSecret() {
  return (
    process.env.PIN_SESSION_SECRET ||
    process.env.SESSION_SIGNING_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.FIREBASE_PROJECT_ID ||
    'music-bar-local-pin-session'
  )
}

function signPinPayload(payload: string) {
  return createHmac('sha256', getPinSessionSecret()).update(payload).digest('base64url')
}

function parsePinSession(sessionCookie: string): SessionUser | null {
  const [prefix, payload, signature] = sessionCookie.split('.')
  if (prefix !== PIN_SESSION_PREFIX || !payload || !signature) return null

  const expectedSignature = signPinPayload(payload)
  const expected = Buffer.from(expectedSignature)
  const actual = Buffer.from(signature)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      email?: string
      name?: string | null
      picture?: string | null
      exp?: number
    }
    if (!decoded.email || !decoded.exp || decoded.exp < Date.now()) return null
    return {
      firebaseUid: syntheticPinUid(decoded.email),
      email: decoded.email,
      name: decoded.name || decoded.email.split('@')[0] || null,
      picture: decoded.picture || null,
    }
  } catch {
    return null
  }
}

export async function createPinSession(email: string) {
  const days = Number(process.env.SESSION_COOKIE_DAYS || 7)
  const expiresIn = days * 24 * 60 * 60 * 1000
  const payload = Buffer.from(JSON.stringify({
    email,
    name: email.split('@')[0] || null,
    picture: null,
    exp: Date.now() + expiresIn,
  })).toString('base64url')
  const sessionCookie = `${PIN_SESSION_PREFIX}.${payload}.${signPinPayload(payload)}`

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

  const pinSession = parsePinSession(sessionCookie)
  if (pinSession) return pinSession

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
