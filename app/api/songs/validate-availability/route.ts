import { sql } from '@/lib/db'
import { cacheKey, invalidateCache } from '@/lib/cache'
import { isTenantError, requireTenantContext } from '@/lib/tenancy'
import { NextResponse } from 'next/server'

const YOUTUBE_API_BATCH_SIZE = 50

interface VideoStatusResult {
  id: string
  privacyStatus: string
}

/**
 * Batch-check video availability via the YouTube Videos API.
 * Returns a Set of youtube_ids that are confirmed public and embeddable.
 */
async function checkVideoAvailability(
  youtubeIds: string[],
  apiKey: string,
): Promise<Set<string>> {
  const available = new Set<string>()

  for (let i = 0; i < youtubeIds.length; i += YOUTUBE_API_BATCH_SIZE) {
    const batch = youtubeIds.slice(i, i + YOUTUBE_API_BATCH_SIZE)
    const idsParam = batch.join(',')

    try {
      const url = `https://www.googleapis.com/youtube/v3/videos?part=status&id=${idsParam}&key=${apiKey}`
      const response = await fetch(url)
      const data: {
        items?: Array<{
          id: string
          status: {
            privacyStatus: string
            embeddable?: boolean
          }
        }>
        error?: { message?: string }
      } = await response.json()

      if (data.error) {
        console.error('YouTube Videos API error during validation:', data.error)
        // If the API errors, assume all videos in this batch are unavailable
        continue
      }

      const apiResults = data.items || []
      for (const item of apiResults) {
        if (
          item.status.privacyStatus === 'public' &&
          item.status.embeddable !== false
        ) {
          available.add(item.id)
        }
      }
    } catch (error) {
      console.error('YouTube Videos API fetch error:', error)
      // On network error, assume unavailable to be safe
    }
  }

  return available
}

export async function POST(request: Request) {
  try {
    const ctx = await requireTenantContext(request, { roles: ['owner', 'admin'] })
    if (isTenantError(ctx)) return ctx

    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'YouTube API Key not configured' },
        { status: 400 },
      )
    }

    // 1. Query all songs currently marked as available
    const songs = await sql<Array<{ id: number; youtube_id: string }>>`
      SELECT id, youtube_id FROM songs WHERE is_available = true
    `

    if (songs.length === 0) {
      return NextResponse.json({
        success: true,
        checked: 0,
        marked_unavailable: 0,
        removed_from_playlists: 0,
        orphaned_deleted: 0,
      })
    }

    const youtubeIds = songs.map(s => s.youtube_id)

    // 2. Check which videos are still available on YouTube
    const availableIds = await checkVideoAvailability(youtubeIds, apiKey)

    // 3. Find unavailable songs
    const unavailableIds: number[] = []
    const unavailableYoutubeIds: string[] = []

    for (const song of songs) {
      if (!availableIds.has(song.youtube_id)) {
        unavailableIds.push(song.id)
        unavailableYoutubeIds.push(song.youtube_id)
      }
    }

    if (unavailableIds.length === 0) {
      return NextResponse.json({
        success: true,
        checked: songs.length,
        marked_unavailable: 0,
        removed_from_playlists: 0,
        orphaned_deleted: 0,
      })
    }

    // 4. Mark songs as unavailable
    await sql`
      UPDATE songs
      SET is_available = false, updated_at = NOW()
      WHERE id = ANY(${unavailableIds})
    `

    // 5. Delete playlist_songs entries referencing unavailable songs
    const deleteResult = await sql`
      DELETE FROM playlist_songs
      WHERE song_id = ANY(${unavailableIds})
    `

    // 6. Clean up orphaned songs (no longer referenced by any playlist_songs or song_requests)
    const orphanResult = await sql`
      DELETE FROM songs
      WHERE id = ANY(${unavailableIds})
        AND id NOT IN (SELECT song_id FROM song_requests)
    `

    // 7. Invalidate all relevant caches
    const playlists = await sql<Array<{ id: number }>>`
      SELECT DISTINCT playlist_id as id FROM playlist_songs
    `
    const cacheKeys = [
      cacheKey('stations'),
    ]
    for (const playlist of playlists) {
      cacheKeys.push(cacheKey('playlist-songs', ctx.tenant.id, playlist.id))
    }
    cacheKeys.push(cacheKey('playlists', ctx.tenant.id))
    cacheKeys.push(cacheKey('requests', ctx.tenant.id, 'pending'))
    await invalidateCache(cacheKeys)

    return NextResponse.json({
      success: true,
      checked: songs.length,
      marked_unavailable: unavailableIds.length,
      removed_from_playlists: deleteResult.count || 0,
      orphaned_deleted: orphanResult.count || 0,
      unavailable_youtube_ids: unavailableYoutubeIds,
    })
  } catch (error) {
    console.error('Error validating song availability:', error)
    return NextResponse.json(
      { error: 'Failed to validate song availability' },
      { status: 500 },
    )
  }
}
