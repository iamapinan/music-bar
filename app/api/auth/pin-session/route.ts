import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { createPinSession, setActiveTenantCookie } from '@/lib/auth/session'
import { getMembershipsForUser, isSuperAdminEmail, upsertUserFromSession, userCanAccessAdmin } from '@/lib/tenancy'
import { isValidPin, normalizePinEmail, syntheticPinUid, verifyPin } from '@/lib/auth/pin'

type PinGrant = {
  tenant_id: string
  pin_hash: string | null
}

export async function POST(request: Request) {
  try {
    const { email, pin } = await request.json()
    const normalizedEmail = normalizePinEmail(email)

    if (!normalizedEmail || !isValidPin(pin)) {
      return NextResponse.json({ error: 'กรุณากรอก email และ PIN ให้ถูกต้อง' }, { status: 400 })
    }

    const grants = await sql<PinGrant[]>`
      SELECT tenant_id, pin_hash
      FROM admin_grants
      WHERE lower(email) = lower(${normalizedEmail})
        AND pin_hash IS NOT NULL
      ORDER BY updated_at DESC
    `

    const matchedGrant = grants.find(grant => verifyPin(pin, grant.pin_hash))
    if (!matchedGrant) {
      return NextResponse.json({ error: 'Email หรือ PIN ไม่ถูกต้อง' }, { status: 401 })
    }

    await createPinSession(normalizedEmail)

    const sessionUser = {
      firebaseUid: syntheticPinUid(normalizedEmail),
      email: normalizedEmail,
      name: normalizedEmail.split('@')[0] || null,
      picture: null,
    }
    const user = await upsertUserFromSession(sessionUser)
    const canAccessAdmin = await userCanAccessAdmin(user)
    if (!canAccessAdmin) {
      return NextResponse.json({ error: 'บัญชีนี้ยังไม่ได้รับสิทธิ์ผู้ดูแลระบบ' }, { status: 403 })
    }

    const tenants = await getMembershipsForUser(user)
    const activeTenantId =
      tenants.find(tenant => tenant.tenant_id === matchedGrant.tenant_id)?.tenant_id ||
      tenants[0]?.tenant_id ||
      null
    if (activeTenantId) {
      await setActiveTenantCookie(activeTenantId)
    }

    return NextResponse.json({
      success: true,
      user: { ...user, is_super_admin: isSuperAdminEmail(user.email) },
      tenants,
      activeTenantId,
    })
  } catch (error) {
    console.error('Error creating PIN session:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
  }
}
