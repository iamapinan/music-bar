import { sql } from '@/lib/db'
import { isTenantError, requireTenantContext } from '@/lib/tenancy'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const ctx = await requireTenantContext(request, { public: true })
    if (isTenantError(ctx)) return ctx

    const settings = await sql`
      SELECT key, value FROM app_settings
      WHERE tenant_id = ${ctx.tenant.id}
    `
    const settingsMap = settings.reduce((acc: any, row: any) => {
      acc[row.key] = row.value
      return acc
    }, {})
    return NextResponse.json(settingsMap)
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const ctx = await requireTenantContext(request, { roles: ['owner', 'admin'] })
    if (isTenantError(ctx)) return ctx

    const { key, value } = await request.json()
    await sql`
      INSERT INTO app_settings (tenant_id, key, value, updated_at)
      VALUES (${ctx.tenant.id}, ${key}, ${JSON.stringify(value)}, NOW())
      ON CONFLICT (tenant_id, key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW()
    `
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update setting:', error)
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}
