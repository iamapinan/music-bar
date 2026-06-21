import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { cachedJson, cacheHeaders, cacheKey } from '@/lib/cache'
import { isTenantError, requireTenantContext } from '@/lib/tenancy'

export async function GET(request: Request) {
  const startedAt = Date.now()
  try {
    const ctx = await requireTenantContext(request, { roles: ['owner', 'admin', 'staff'] })
    if (isTenantError(ctx)) return ctx

    const result = await cachedJson(cacheKey('players', ctx.tenant.id), 10, () => sql`
      SELECT * FROM active_players
      WHERE tenant_id = ${ctx.tenant.id}
      ORDER BY is_active DESC, last_ping DESC
    `)
    return NextResponse.json(result.data, { headers: cacheHeaders(result.cache, startedAt) })
  } catch (error) {
    console.error('Failed to fetch players:', error)
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireTenantContext(request, { public: true })
    if (isTenantError(ctx)) return ctx

    const { device_id, device_name, device_type } = await request.json()

    if (!device_id || !device_name || !device_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO active_players (tenant_id, device_id, device_name, device_type, last_ping)
      VALUES (${ctx.tenant.id}, ${device_id}, ${device_name}, ${device_type}, CURRENT_TIMESTAMP)
      ON CONFLICT (tenant_id, device_id)
      DO UPDATE SET
        device_name = EXCLUDED.device_name,
        device_type = EXCLUDED.device_type,
        last_ping = CURRENT_TIMESTAMP
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Failed to ping player:', error)
    return NextResponse.json({ error: 'Failed to ping player' }, { status: 500 })
  }
}
