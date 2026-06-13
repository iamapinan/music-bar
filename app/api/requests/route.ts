import { sql } from '@/lib/db'
import { isTenantError, requireTenantContext } from '@/lib/tenancy'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const ctx = await requireTenantContext(request, { public: true })
    if (isTenantError(ctx)) return ctx

    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('device_id')

    if (deviceId) {
      const requests = await sql`
        SELECT *,
          ROW_NUMBER() OVER (ORDER BY created_at ASC) as queue_position
        FROM song_requests
        WHERE tenant_id = ${ctx.tenant.id}
          AND status = 'pending'
          AND device_id = ${deviceId}
        ORDER BY created_at ASC
      `
      return NextResponse.json(requests)
    }

    const requests = await sql`
      SELECT * FROM song_requests
      WHERE tenant_id = ${ctx.tenant.id}
        AND status = 'pending'
      ORDER BY created_at ASC
    `
    return NextResponse.json(requests)
  } catch (error) {
    console.error('Error fetching requests:', error)
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireTenantContext(request, { public: true })
    if (isTenantError(ctx)) return ctx

    const settings = await sql`
      SELECT value FROM app_settings
      WHERE tenant_id = ${ctx.tenant.id}
        AND key = 'is_requests_enabled'
      LIMIT 1
    `
    if (settings[0]?.value === 'false') {
      return NextResponse.json({ error: 'ขณะนี้ปิดรับขอเพลง' }, { status: 403 })
    }

    const { youtube_id, title, thumbnail, duration, requested_by, device_id } = await request.json()
    const youtubeId = typeof youtube_id === 'string' ? youtube_id.trim() : ''
    const songTitle = typeof title === 'string' ? title.trim() : ''

    if (!youtubeId || !songTitle) {
      return NextResponse.json({ error: 'ข้อมูลเพลงไม่ครบ กรุณาค้นหาและเลือกเพลงใหม่อีกครั้ง' }, { status: 400 })
    }

    const existing = await sql`
      SELECT * FROM song_requests
      WHERE tenant_id = ${ctx.tenant.id}
        AND youtube_id = ${youtubeId}
        AND status = 'pending'
    `

    if (existing.length > 0) {
      return NextResponse.json({ error: 'เพลงนี้อยู่ในคิวแล้ว' }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO song_requests (tenant_id, youtube_id, title, thumbnail, duration, requested_by, device_id, status)
      VALUES (${ctx.tenant.id}, ${youtubeId}, ${songTitle}, ${thumbnail || null}, ${duration || null}, ${requested_by || 'ลูกค้า'}, ${device_id || null}, 'pending')
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error creating request:', error)
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const ctx = await requireTenantContext(request, { roles: ['owner', 'admin', 'staff'] })
    if (isTenantError(ctx)) return ctx

    const { id, status } = await request.json()

    const updateFields = status === 'played'
      ? sql`status = ${status}, played_at = NOW()`
      : sql`status = ${status}`

    const result = await sql`
      UPDATE song_requests
      SET ${updateFields}
      WHERE id = ${id}
        AND tenant_id = ${ctx.tenant.id}
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error updating request:', error)
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const ctx = await requireTenantContext(request, { roles: ['owner', 'admin', 'staff'] })
    if (isTenantError(ctx)) return ctx

    const { id } = await request.json()
    await sql`
      DELETE FROM song_requests
      WHERE id = ${id}
        AND tenant_id = ${ctx.tenant.id}
    `
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting request:', error)
    return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 })
  }
}
