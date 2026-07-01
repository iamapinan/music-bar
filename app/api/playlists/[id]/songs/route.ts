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
      SELECT
        ps.id, ps.tenant_id, ps.playlist_id, ps.song_id, ps.position, ps.created_at,
        s.youtube_id, s.title, s.thumbnail, s.duration, s.artist, s.audio_url
      FROM playlist_songs ps
      JOIN songs s ON ps.song_id = s.id
      WHERE ps.playlist_id = ${playlistId}
        AND ps.tenant_id = ${ctx.tenant.id}
        AND s.is_available = true
      ORDER BY ps.position ASC, ps.created_at ASC
    `)

    const { origin } = new URL(request.url)
    const songs = (result.data as any[]).map(song => ({
      ...song,
      thumbnail: song.thumbnail ? getProxiedUrl(song.thumbnail, origin) : song.thumbnail,
      audio_url: song.audio_url || null,
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
    const { youtube_id, title, thumbnail, duration, artist, audio_url } = await request.json()
    const playlistId = parseInt(id)
    const youtubeId = typeof youtube_id === 'string' ? youtube_id.trim() : ''
    const songTitle = typeof title === 'string' ? title.trim() : ''
    const audioUrl = typeof audio_url === 'string' ? audio_url.trim() : ''

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

    // Upsert into songs table first (deduplicate by youtube_id)
    const songResult = await sql`
      INSERT INTO songs (youtube_id, title, thumbnail, duration, artist, audio_url)
      VALUES (${youtubeId}, ${songTitle}, ${thumbnail || null}, ${duration || null}, ${artist || null}, ${audioUrl || null})
      ON CONFLICT (youtube_id) DO UPDATE SET
        title = EXCLUDED.title,
        thumbnail = COALESCE(EXCLUDED.thumbnail, songs.thumbnail),
        duration = COALESCE(EXCLUDED.duration, songs.duration),
        artist = COALESCE(EXCLUDED.artist, songs.artist),
        audio_url = COALESCE(EXCLUDED.audio_url, songs.audio_url),
        updated_at = NOW()
      RETURNING id
    `
    const songId = songResult[0].id

    const maxPos = await sql`
      SELECT COALESCE(MAX(position), 0) as max_pos
      FROM playlist_songs
      WHERE playlist_id = ${playlistId}
        AND tenant_id = ${ctx.tenant.id}
    `

    const result = await sql`
      INSERT INTO playlist_songs (tenant_id, playlist_id, song_id, position)
      VALUES (${ctx.tenant.id}, ${playlistId}, ${songId}, ${(maxPos[0]?.max_pos || 0) + 1})
      RETURNING *
    `
    await invalidateCache([
      cacheKey('playlist-songs', ctx.tenant.id, playlistId),
      cacheKey('playlists', ctx.tenant.id),
      cacheKey('stations'),
    ])

    // Fetch the full song with joined metadata
    const fullSong = await sql`
      SELECT
        ps.id, ps.tenant_id, ps.playlist_id, ps.song_id, ps.position, ps.created_at,
        s.youtube_id, s.title, s.thumbnail, s.duration, s.artist, s.audio_url
      FROM playlist_songs ps
      JOIN songs s ON ps.song_id = s.id
      WHERE ps.id = ${result[0].id}
    `

    const { origin } = new URL(request.url)
    const song = fullSong[0]
    if (song) {
      if (song.thumbnail) {
        song.thumbnail = getProxiedUrl(song.thumbnail, origin)
      }
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

    // Delete the playlist_songs row
    await sql`
      DELETE FROM playlist_songs
      WHERE id = ${songId}
        AND playlist_id = ${playlistId}
        AND tenant_id = ${ctx.tenant.id}
    `

    // Clean up orphaned songs (no longer referenced by any playlist_songs or song_requests)
    await sql`
      DELETE FROM songs
      WHERE id NOT IN (SELECT song_id FROM playlist_songs)
        AND id NOT IN (SELECT song_id FROM song_requests)
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
