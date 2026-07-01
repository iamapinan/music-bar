import { sql } from '@/lib/db'
import { cachedJson, cacheHeaders, cacheKey, getCachedJson, setCachedJson } from '@/lib/cache'
import { isTenantError, requireTenantContext } from '@/lib/tenancy'
import { getProxiedUrl } from '@/lib/images'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

/**
 * Consolidated mobile init endpoint.
 *
 * Returns playlists, active_playlist_ids, and songs for active playlists
 * in a SINGLE response — replacing 4+ round trips with 1.
 *
 * Supports If-None-Match / ETag for conditional 304 responses.
 */
export async function GET(request: Request) {
  const startedAt = Date.now()
  try {
    const ctx = await requireTenantContext(request, { public: true })
    if (isTenantError(ctx)) return ctx

    const tenantId = ctx.tenant.id
    const { origin, searchParams } = new URL(request.url)

    // ---- 1. Fetch playlists (cached 60s) ----
    const playlistsResult = await cachedJson(cacheKey('mobile:playlists', tenantId), 60, () =>
      sql`
        SELECT
          p.id, p.name, p.is_default, p.is_enabled, p.description,
          (SELECT COUNT(*)
           FROM playlist_songs ps
           JOIN songs s ON ps.song_id = s.id
           WHERE ps.playlist_id = p.id
             AND ps.tenant_id = ${tenantId}
             AND s.is_available = true) as song_count,
          (SELECT s.thumbnail
           FROM playlist_songs ps
           JOIN songs s ON ps.song_id = s.id
           WHERE ps.playlist_id = p.id
             AND ps.tenant_id = ${tenantId}
             AND s.thumbnail IS NOT NULL
             AND s.is_available = true
           ORDER BY ps.position ASC, ps.created_at ASC
           LIMIT 1) as cover_thumbnail
        FROM playlists p
        WHERE p.tenant_id = ${tenantId}
        ORDER BY p.is_default DESC, p.created_at DESC
      `,
    )

    // ---- 2. Fetch public settings (active_playlist_ids) (cached 30s) ----
    const settingsResult = await cachedJson(cacheKey('mobile:settings', tenantId), 30, () =>
      sql`
        SELECT key, value FROM app_settings
        WHERE tenant_id = ${tenantId}
          AND key = ANY(${['active_playlist_ids']})
      `,
    )

    const settings = (settingsResult.data as { key: string; value: string }[]).reduce(
      (acc: Record<string, unknown>, row) => {
        try { acc[row.key] = JSON.parse(row.value) } catch { acc[row.key] = row.value }
        return acc
      },
      {} as Record<string, unknown>,
    )

    const activeIds: number[] = parseActiveIds(settings.active_playlist_ids)
    const enabledActiveIds = (playlistsResult.data as any[])
      .filter((p: any) => p.is_enabled && activeIds.includes(p.id))
      .map((p: any) => p.id)

    // If no active playlists match, fall back to the default playlist
    const resolvedIds =
      enabledActiveIds.length > 0
        ? enabledActiveIds
        : [(playlistsResult.data as any[]).find((p: any) => p.is_default)?.id].filter(Boolean)

    // ---- 3. Progressive loading: if ?playlist_id is specified, only return songs for that playlist ----
    const primaryPlaylistId = searchParams.get('playlist_id')
    const activeIdsToLoad = primaryPlaylistId
      ? [parseInt(primaryPlaylistId)].filter((id) => resolvedIds.includes(id))
      : resolvedIds

    // ---- 4. Fetch songs for selected playlists in ONE query (cached 120s) ----
    let songs: any[] = []
    if (activeIdsToLoad.length > 0) {
      const songsResult = await cachedJson(
        cacheKey('mobile:songs', tenantId, activeIdsToLoad.sort().join(',')),
        120,
        () =>
          sql`
            SELECT
              ps.id, ps.playlist_id, ps.song_id, ps.position,
              s.youtube_id, s.title, s.thumbnail, s.duration, s.artist, s.audio_url,
              s.is_available
            FROM playlist_songs ps
            JOIN songs s ON ps.song_id = s.id
            WHERE ps.playlist_id = ANY(${activeIdsToLoad})
              AND ps.tenant_id = ${tenantId}
              AND s.is_available = true
            ORDER BY ps.playlist_id, ps.position ASC, ps.created_at ASC
          `,
      )

      songs = (songsResult.data as any[]).map((song: any) => ({
        id: song.id,
        playlist_id: song.playlist_id,
        song_id: song.song_id,
        position: song.position,
        youtube_id: song.youtube_id,
        title: song.title,
        thumbnail: song.thumbnail ? getProxiedUrl(song.thumbnail, origin) : null,
        duration: song.duration,
        artist: song.artist,
        audio_url: song.audio_url
          ? `${origin}/api/audio/stream?songId=${song.song_id}`
          : null,
      }))
    }

    // ---- 4. Build response ----
    const playlists = (playlistsResult.data as any[]).map((p: any) => ({
      id: p.id,
      name: p.name,
      is_default: p.is_default,
      is_enabled: p.is_enabled,
      description: p.description,
      song_count: Number(p.song_count || 0),
      cover_thumbnail: p.cover_thumbnail
        ? getProxiedUrl(p.cover_thumbnail, origin)
        : null,
    }))

    const body = {
      playlists,
      active_playlist_ids: resolvedIds,
      settings: {
        is_requests_enabled: settings.is_requests_enabled ?? null,
        active_playlist_ids: activeIds,
      },
      songs,
    }

    // ---- 5. ETag / conditional 304 ----
    const payload = JSON.stringify(body)
    const etag = createHash('md5').update(payload).digest('hex')

    const ifNoneMatch = request.headers.get('if-none-match')
    if (ifNoneMatch && ifNoneMatch.replace(/^W\//, '').replace(/"/g, '') === etag) {
      return new Response(null, {
        status: 304,
        headers: {
          etag: `"${etag}"`,
          'x-cache': playlistsResult.cache === 'HIT' && settingsResult.cache === 'HIT' ? 'HIT' : 'MISS',
          'server-timing': `app;dur=${Date.now() - startedAt}`,
        },
      })
    }

    return new Response(payload, {
      status: 200,
      headers: {
        'content-type': 'application/json',
        etag: `"${etag}"`,
        'x-cache': playlistsResult.cache === 'HIT' && settingsResult.cache === 'HIT' ? 'HIT' : 'MISS',
        'server-timing': `app;dur=${Date.now() - startedAt}`,
        'cache-control': 'public, max-age=0, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Error in mobile/init:', error)
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 })
  }
}

function parseActiveIds(value: unknown): number[] {
  if (Array.isArray(value)) return value.filter((v): v is number => typeof v === 'number')
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed.filter((v): v is number => typeof v === 'number') : []
    } catch {
      return []
    }
  }
  return []
}
