import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { createPinHash, isValidPin, normalizePinEmail } from '@/lib/auth/pin'
import { isTenantError, requireTenantContext } from '@/lib/tenancy'

export async function GET(request: Request) {
  try {
    const ctx = await requireTenantContext(request)
    if (isTenantError(ctx)) return ctx
    if (!ctx.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rows = await sql<{ pin_enabled: boolean; pin_updated_at: string | null }[]>`
      SELECT
        pin_hash IS NOT NULL as pin_enabled,
        pin_updated_at
      FROM admin_grants
      WHERE tenant_id = ${ctx.tenant.id}
        AND lower(email) = lower(${ctx.user.email})
      LIMIT 1
    `

    return NextResponse.json({
      pin_enabled: rows[0]?.pin_enabled || false,
      pin_updated_at: rows[0]?.pin_updated_at || null,
    })
  } catch (error) {
    console.error('Error reading PIN settings:', error)
    return NextResponse.json({ error: 'Failed to read PIN settings' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const ctx = await requireTenantContext(request, { roles: ['owner', 'admin', 'staff'] })
    if (isTenantError(ctx)) return ctx
    if (!ctx.user?.email || !ctx.role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pin, action } = await request.json()
    const normalizedEmail = normalizePinEmail(ctx.user.email)

    if (action === 'clear') {
      await sql`
        UPDATE admin_grants
        SET pin_hash = NULL,
            pin_updated_at = NULL,
            updated_at = NOW()
        WHERE tenant_id = ${ctx.tenant.id}
          AND lower(email) = lower(${normalizedEmail})
      `
      return NextResponse.json({ success: true, pin_enabled: false, pin_updated_at: null })
    }

    if (!isValidPin(pin)) {
      return NextResponse.json({ error: 'PIN ต้องเป็นตัวเลข 4-8 หลัก' }, { status: 400 })
    }

    const pinHash = createPinHash(pin)
    const result = await sql`
      INSERT INTO admin_grants (tenant_id, email, role, granted_by_user_id, pin_hash, pin_updated_at, updated_at)
      VALUES (${ctx.tenant.id}, ${normalizedEmail}, ${ctx.role}, ${ctx.user.id}, ${pinHash}, NOW(), NOW())
      ON CONFLICT (tenant_id, lower(email)) DO UPDATE
      SET pin_hash = EXCLUDED.pin_hash,
          pin_updated_at = NOW(),
          updated_at = NOW()
      RETURNING pin_updated_at
    `

    return NextResponse.json({
      success: true,
      pin_enabled: true,
      pin_updated_at: result[0]?.pin_updated_at || null,
    })
  } catch (error) {
    console.error('Error updating PIN settings:', error)
    return NextResponse.json({ error: 'Failed to update PIN settings' }, { status: 500 })
  }
}
