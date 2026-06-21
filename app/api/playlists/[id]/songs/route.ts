import { sql } from '@/lib/db'
import { cachedJson, cacheHeaders, cacheKey, invalidateCache } from '@/lib/cache'
import { isTenantError, requireTenantContext } from '@/lib/tenancy'
import { NextResponse } from 'next/server'
import { getProxiedUrl } from '@/lib/images'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const startedAt = Date.now()
  try {
    const ctx = await requireTenantContext(request, { public: true })
    if (isTenantError(ctx)) return ctx

    const { id } = await params
    const playlistId = parseInt(id)
    const result = await cachedJson(cacheKey('playlist-songs', ctx.tenant.id, playlistId), 120, () => sql`
      SELECT * FROM playlist_songs
      WHERE playlist_id = ${playlistId}
        AND tenant_id = ${ctx.tenant.id}
      ORDER BY position ASC, created_at ASC
    `)

    const { origin } = new URL(request.url)
    const songs = (result.data as any[]).map(song => ({
      ...song,
      thumbnail: song.thumbnail ? getProxiedUrl(song.thumbnail, origin) : song.thumbnail
    }))

    return NextResponse.json(songs, { headers: cacheHeaders(result.cache, startedAt) })
  } catch (error) {
    console.error('Error fetching playlist songs:', error)
    return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ctx = await requireTenantContext(request, { roles: ['owner', 'admin'] })
    if (isTenantError(ctx)) return ctx

    const { id } = await params
    const { youtube_id, title, thumbnail, duration, artist } = await request.json()
    const playlistId = parseInt(id)
    const youtubeId = typeof youtube_id === 'string' ? youtube_id.trim() : ''
    const songTitle = typeof title === 'string' ? title.trim() : ''

    if (!Number.isFinite(playlistId)) {
      return NextResponse.json({ error: 'ไม่พบ playlist ที่ต้องการเพิ่มเพลง' }, { status: 400 })
    }

    if (!youtubeId || !songTitle) {
      return NextResponse.json({ error: 'ข้อมูลเพลงไม่ครบ กรุณาค้นหาและเลือกเพลงใหม่อีกครั้ง' }, { status: 400 })
    }

    const playlist = await sql`
      SELECT id FROM playlists
      WHERE id = ${playlistId}
        AND tenant_id = ${ctx.tenant.id}
      LIMIT 1
    `
    if (!playlist.length) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })
    }

    const maxPos = await sql`
      SELECT COALESCE(MAX(position), 0) as max_pos
      FROM playlist_songs
      WHERE playlist_id = ${playlistId}
        AND tenant_id = ${ctx.tenant.id}
    `

    const result = await sql`
      INSERT INTO playlist_songs (tenant_id, playlist_id, youtube_id, title, thumbnail, duration, artist, position)
      VALUES (${ctx.tenant.id}, ${playlistId}, ${youtubeId}, ${songTitle}, ${thumbnail || null}, ${duration || null}, ${artist || null}, ${(maxPos[0]?.max_pos || 0) + 1})
      RETURNING *
    `
    await invalidateCache([
      cacheKey('playlist-songs', ctx.tenant.id, playlistId),
      cacheKey('playlists', ctx.tenant.id),
      cacheKey('stations'),
    ])

    const { origin } = new URL(request.url)
    const song = result[0]
    if (song && song.thumbnail) {
      song.thumbnail = getProxiedUrl(song.thumbnail, origin)
    }

    return NextResponse.json(song)
  } catch (error) {
    console.error('Error adding song to playlist:', error)
    return NextResponse.json({ error: 'Failed to add song' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ctx = await requireTenantContext(request, { roles: ['owner', 'admin', 'staff'] })
    if (isTenantError(ctx)) return ctx

    const { id } = await params
    const { songId } = await request.json()
    const playlistId = parseInt(id)

    await sql`
      DELETE FROM playlist_songs
      WHERE id = ${songId}
        AND playlist_id = ${playlistId}
        AND tenant_id = ${ctx.tenant.id}
    `
    await invalidateCache([
      cacheKey('playlist-songs', ctx.tenant.id, playlistId),
      cacheKey('playlists', ctx.tenant.id),
      cacheKey('stations'),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting song:', error)
    return NextResponse.json({ error: 'Failed to delete song' }, { status: 500 })
  }
}
