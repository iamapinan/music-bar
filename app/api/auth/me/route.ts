import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ACTIVE_TENANT_COOKIE_NAME, getSessionUser } from '@/lib/auth/session'
import { getMembershipsForUser, isSuperAdminEmail, upsertUserFromSession, userCanAccessAdmin } from '@/lib/tenancy'

export async function GET() {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const user = await upsertUserFromSession(sessionUser)
    const canAccessAdmin = await userCanAccessAdmin(user)
    if (!canAccessAdmin) {
      return NextResponse.json({ authenticated: false }, { status: 403 })
    }

    const tenants = await getMembershipsForUser(user)
    const cookieStore = await cookies()
    const activeTenantId = cookieStore.get(ACTIVE_TENANT_COOKIE_NAME)?.value || tenants[0]?.tenant_id || null

    return NextResponse.json({
      authenticated: true,
      user: { ...user, is_super_admin: isSuperAdminEmail(user.email) },
      tenants,
      activeTenantId,
    })
  } catch (error) {
    console.error('Error reading current user:', error)
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
