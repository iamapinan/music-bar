import { sql } from '@/lib/db'
import { cachedJson, cacheHeaders, cacheKey, invalidateCache } from '@/lib/cache'
import { isTenantError, requireTenantContext } from '@/lib/tenancy'
import { NextResponse } from 'next/server'
import { getProxiedUrl } from '@/lib/images'
import { buildStreamUrl } from '@/lib/audio-stream'

export async function GET(request: Request) {
  const startedAt = Date.now()
  try {
    const ctx = await requireTenantContext(request, { public: true })
    if (isTenantError(ctx)) return ctx

    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('device_id')

    const { origin } = new URL(request.url)

    if (deviceId) {
      const result = await cachedJson(cacheKey('requests', ctx.tenant.id, 'device', deviceId), 5, () => sql`
        SELECT
          sr.id, sr.tenant_id, sr.song_id, sr.requested_by, sr.device_id,
          sr.status, sr.played_at, sr.created_at,
          ROW_NUMBER() OVER (ORDER BY sr.created_at ASC) as queue_position,
          s.youtube_id, s.title, s.thumbnail, s.duration, s.audio_url
        FROM song_requests sr
        JOIN songs s ON sr.song_id = s.id
        WHERE sr.tenant_id = ${ctx.tenant.id}
          AND sr.status = 'pending'
          AND sr.device_id = ${deviceId}
          AND s.is_available = true
        ORDER BY sr.created_at ASC
      `)
      const formatted = (result.data as any[]).map(req => ({
        ...req,
        thumbnail: req.thumbnail ? getProxiedUrl(req.thumbnail, origin) : req.thumbnail,
        audio_url: req.audio_url
          ? buildStreamUrl(origin, Number(req.song_id), ctx.tenant.id)
          : null,
      }))
      return NextResponse.json(formatted, { headers: cacheHeaders(result.cache, startedAt) })
    }

    const result = await cachedJson(cacheKey('requests', ctx.tenant.id, 'pending'), 5, () => sql`
      SELECT
        sr.id, sr.tenant_id, sr.song_id, sr.requested_by, sr.device_id,
        sr.status, sr.played_at, sr.created_at,
        s.youtube_id, s.title, s.thumbnail, s.duration, s.audio_url
      FROM song_requests sr
      JOIN songs s ON sr.song_id = s.id
      WHERE sr.tenant_id = ${ctx.tenant.id}
        AND sr.status = 'pending'
        AND s.is_available = true
      ORDER BY sr.created_at ASC
    `)
    const formatted = (result.data as any[]).map(req => ({
      ...req,
      thumbnail: req.thumbnail ? getProxiedUrl(req.thumbnail, origin) : req.thumbnail,
      audio_url: req.audio_url
        ? buildStreamUrl(origin, Number(req.song_id), ctx.tenant.id)
        : null,
    }))
    return NextResponse.json(formatted, { headers: cacheHeaders(result.cache, startedAt) })
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

    const { youtube_id, title, thumbnail, duration, audio_url, requested_by, device_id } = await request.json()
    const youtubeId = typeof youtube_id === 'string' ? youtube_id.trim() : ''
    const songTitle = typeof title === 'string' ? title.trim() : ''
    const audioUrl = typeof audio_url === 'string' ? audio_url.trim() : ''

    if (!youtubeId || !songTitle) {
      return NextResponse.json({ error: 'ข้อมูลเพลงไม่ครบ กรุณาค้นหาและเลือกเพลงใหม่อีกครั้ง' }, { status: 400 })
    }

    // Check for duplicate pending request — query through songs table
    const existing = await sql`
      SELECT sr.id FROM song_requests sr
      JOIN songs s ON sr.song_id = s.id
      WHERE sr.tenant_id = ${ctx.tenant.id}
        AND s.youtube_id = ${youtubeId}
        AND sr.status = 'pending'
    `

    if (existing.length > 0) {
      return NextResponse.json({ error: 'เพลงนี้อยู่ในคิวแล้ว' }, { status: 400 })
    }

    // Upsert into songs table first
    const songResult = await sql`
      INSERT INTO songs (youtube_id, title, thumbnail, duration, artist, audio_url)
      VALUES (${youtubeId}, ${songTitle}, ${thumbnail || null}, ${duration || null}, NULL, ${audioUrl || null})
      ON CONFLICT (youtube_id) DO UPDATE SET
        title = EXCLUDED.title,
        thumbnail = COALESCE(EXCLUDED.thumbnail, songs.thumbnail),
        duration = COALESCE(EXCLUDED.duration, songs.duration),
        audio_url = COALESCE(EXCLUDED.audio_url, songs.audio_url),
        updated_at = NOW()
      RETURNING id
    `
    const songId = songResult[0].id

    const result = await sql`
      INSERT INTO song_requests (tenant_id, song_id, requested_by, device_id, status)
      VALUES (${ctx.tenant.id}, ${songId}, ${requested_by || 'ลูกค้า'}, ${device_id || null}, 'pending')
      RETURNING *
    `
    await invalidateCache([
      cacheKey('requests', ctx.tenant.id, 'pending'),
      cacheKey('requests', ctx.tenant.id, 'device', device_id),
    ])

    // Fetch the full request with joined song metadata
    const fullRequest = await sql`
      SELECT
        sr.id, sr.tenant_id, sr.song_id, sr.requested_by, sr.device_id,
        sr.status, sr.played_at, sr.created_at,
        s.youtube_id, s.title, s.thumbnail, s.duration, s.audio_url
      FROM song_requests sr
      JOIN songs s ON sr.song_id = s.id
      WHERE sr.id = ${result[0].id}
    `

    const { origin } = new URL(request.url)
    const reqObj = fullRequest[0]
    if (reqObj) {
      if (reqObj.thumbnail) {
        reqObj.thumbnail = getProxiedUrl(reqObj.thumbnail, origin)
      }
      if (reqObj.audio_url) {
        reqObj.audio_url = buildStreamUrl(origin, Number(reqObj.song_id), ctx.tenant.id)
      }
    }

    return NextResponse.json(reqObj)
  } catch (error) {
    console.error('Error creating request:', error)
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const ctx = await requireTenantContext(request, { public: true })
    if (isTenantError(ctx)) return ctx

    const { id, status } = await request.json()
    if (!id || !['played', 'skipped'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request update' }, { status: 400 })
    }

    const updateFields = status === 'played'
      ? sql`status = ${status}, played_at = NOW()`
      : sql`status = ${status}`

    const result = await sql`
      UPDATE song_requests
      SET ${updateFields}
      WHERE id = ${id}
        AND tenant_id = ${ctx.tenant.id}
        AND status = 'pending'
      RETURNING *
    `

    if (!result[0]) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }
    await invalidateCache([
      cacheKey('requests', ctx.tenant.id, 'pending'),
      cacheKey('requests', ctx.tenant.id, 'device', result[0].device_id),
    ])

    // Fetch full request with song fields (PATCH response)
    const fullRequest = await sql`
      SELECT
        sr.id, sr.tenant_id, sr.song_id, sr.requested_by, sr.device_id,
        sr.status, sr.played_at, sr.created_at,
        s.youtube_id, s.title, s.thumbnail, s.duration
      FROM song_requests sr
      JOIN songs s ON sr.song_id = s.id
      WHERE sr.id = ${result[0].id}
    `

    return NextResponse.json(fullRequest[0])
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

    // Get the song_id before deleting
    const requestRow = await sql`
      SELECT song_id FROM song_requests
      WHERE id = ${id}
        AND tenant_id = ${ctx.tenant.id}
    `

    if (requestRow.length === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const songId = requestRow[0].song_id

    await sql`
      DELETE FROM song_requests
      WHERE id = ${id}
        AND tenant_id = ${ctx.tenant.id}
    `

    // Clean up orphaned songs
    await sql`
      DELETE FROM songs
      WHERE id = ${songId}
        AND id NOT IN (SELECT song_id FROM playlist_songs)
        AND id NOT IN (SELECT song_id FROM song_requests)
    `

    await invalidateCache([
      cacheKey('requests', ctx.tenant.id, 'pending'),
    ])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting request:', error)
    return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 })
  }
}
