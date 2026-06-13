import { NextResponse } from 'next/server'
import { createFirebaseSession, setActiveTenantCookie } from '@/lib/auth/session'
import { getMembershipsForUser, isSuperAdminEmail, upsertUserFromSession, userCanAccessAdmin } from '@/lib/tenancy'
import { adminAuth } from '@/lib/firebase/admin'

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json()
    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'Missing Firebase ID token' }, { status: 400 })
    }

    const decoded = await adminAuth.verifyIdToken(idToken)
    const sessionUser = {
      firebaseUid: decoded.uid,
      email: decoded.email || '',
      name: typeof decoded.name === 'string' ? decoded.name : null,
      picture: typeof decoded.picture === 'string' ? decoded.picture : null,
    }

    const user = await upsertUserFromSession(sessionUser)
    const canAccessAdmin = await userCanAccessAdmin(user)
    if (!canAccessAdmin) {
      return NextResponse.json({ error: 'บัญชีนี้ยังไม่ได้รับสิทธิ์ผู้ดูแลระบบ' }, { status: 403 })
    }

    const tenants = await getMembershipsForUser(user)
    await createFirebaseSession(idToken)
    if (tenants[0]) {
      await setActiveTenantCookie(tenants[0].tenant_id)
    }

    return NextResponse.json({
      success: true,
      user: { ...user, is_super_admin: isSuperAdminEmail(user.email) },
      tenants,
      activeTenantId: tenants[0]?.tenant_id || null,
    })
  } catch (error) {
    console.error('Error creating Firebase session:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
  }
}

export async function DELETE() {
  const { clearFirebaseSession } = await import('@/lib/auth/session')
  await clearFirebaseSession()
  return NextResponse.json({ success: true })
}
