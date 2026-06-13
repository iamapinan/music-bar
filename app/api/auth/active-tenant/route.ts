import { NextResponse } from 'next/server'
import { setActiveTenantCookie } from '@/lib/auth/session'
import { getSessionUser } from '@/lib/auth/session'
import { getTenantById, getUserTenantRole, isSuperAdminEmail, upsertUserFromSession } from '@/lib/tenancy'

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tenantId } = await request.json()
    if (!tenantId || typeof tenantId !== 'string') {
      return NextResponse.json({ error: 'Missing tenantId' }, { status: 400 })
    }

    const user = await upsertUserFromSession(sessionUser)
    const tenant = await getTenantById(tenantId)
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    const role = isSuperAdminEmail(user.email) ? 'owner' : await getUserTenantRole(user.id, tenantId)
    if (!role) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await setActiveTenantCookie(tenantId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error switching active tenant:', error)
    return NextResponse.json({ error: 'Failed to switch tenant' }, { status: 500 })
  }
}
