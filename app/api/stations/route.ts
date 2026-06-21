import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { cachedJson, cacheHeaders, cacheKey } from '@/lib/cache'
import { getProxiedUrl } from '@/lib/images'

export async function GET(request: Request) {
  const startedAt = Date.now()
  try {
    const result = await cachedJson(cacheKey('stations'), 120, () => sql`
      SELECT
        t.id,
        t.slug,
        t.name,
        t.display_name,
        t.logo_url,
        COUNT(DISTINCT p.id) as playlist_count,
        COUNT(DISTINCT ps.id) as song_count,
        (
          SELECT ps2.thumbnail
          FROM playlist_songs ps2
          JOIN playlists p2 ON p2.id = ps2.playlist_id
          WHERE p2.tenant_id = t.id
            AND ps2.tenant_id = t.id
            AND p2.is_enabled = true
            AND ps2.thumbnail IS NOT NULL
          ORDER BY p2.is_default DESC, ps2.position ASC, ps2.created_at ASC
          LIMIT 1
        ) as cover_thumbnail
      FROM tenants t
      LEFT JOIN playlists p ON p.tenant_id = t.id AND p.is_enabled = true
      LEFT JOIN playlist_songs ps ON ps.tenant_id = t.id AND ps.playlist_id = p.id
      WHERE t.is_active = true
      GROUP BY t.id
      ORDER BY t.created_at ASC
    `)

    const { origin } = new URL(request.url)
    const stations = (result.data as any[]).map(s => ({
      ...s,
      cover_thumbnail: s.cover_thumbnail ? getProxiedUrl(s.cover_thumbnail, origin) : s.cover_thumbnail,
      logo_url: s.logo_url ? getProxiedUrl(s.logo_url, origin) : s.logo_url
    }))

    return NextResponse.json(stations, { headers: cacheHeaders(result.cache, startedAt) })
  } catch (error) {
    console.error('Error listing stations:', error)
    return NextResponse.json({ error: 'Failed to list stations' }, { status: 500 })
  }
}
