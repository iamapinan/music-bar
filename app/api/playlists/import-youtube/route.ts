import { sql } from '@/lib/db'
import { cacheKey, invalidateCache } from '@/lib/cache'
import { isTenantError, requireTenantContext } from '@/lib/tenancy'
import { NextResponse } from 'next/server'

const YOUTUBE_BATCH_SIZE = 50

/**
 * Batch-check YouTube video availability via the Videos API.
 * Returns a Set of youtube_ids that are public and embeddable.
 */
async function filterAvailableVideos(
  items: Array<{ youtube_id: string; title: string; thumbnail: string; channelTitle: string }>,
  apiKey: string,
): Promise<Array<{ youtube_id: string; title: string; thumbnail: string; channelTitle: string }>> {
  if (items.length === 0) return []

  const available = new Set<string>()

  for (let i = 0; i < items.length; i += YOUTUBE_BATCH_SIZE) {
    const batch = items.slice(i, i + YOUTUBE_BATCH_SIZE)
    const idsParam = batch.map(it => it.youtube_id).join(',')

    try {
      const url = `https://www.googleapis.com/youtube/v3/videos?part=status&id=${idsParam}&key=${apiKey}`
      const response = await fetch(url)
      const data: {
        items?: Array<{
          id: string
          status: { privacyStatus: string; embeddable?: boolean }
        }>
      } = await response.json()

      const apiResults = data.items || []
      for (const item of apiResults) {
        if (item.status.privacyStatus === 'public' && item.status.embeddable !== false) {
          available.add(item.id)
        }
      }
    } catch (error) {
      console.error('YouTube Videos API error during import filter:', error)
    }
  }

  return items.filter(item => available.has(item.youtube_id))
}

export async function POST(request: Request) {
  try {
    const ctx = await requireTenantContext(request, { roles: ['owner', 'admin'] })
    if (isTenantError(ctx)) return ctx

    const { playlistId: youtubePlaylistId, name } = await request.json()

    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'YouTube API Key not configured' }, { status: 400 })
    }

    let allItems: Array<{
      youtube_id: string
      title: string
      thumbnail: string
      channelTitle: string
    }> = []
    let pageToken: string | null = null

    do {
      const fetchUrl: string = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${youtubePlaylistId}&maxResults=50${pageToken ? `&pageToken=${pageToken}` : ''}&key=${apiKey}`
      const fetchRes: Response = await fetch(fetchUrl)
      const fetchData: {
        error?: unknown
        items?: Array<{
          snippet: {
            resourceId: { videoId: string }
            title: string
            thumbnails: { medium?: { url: string }; default?: { url: string } }
            videoOwnerChannelTitle?: string
          }
        }>
        nextPageToken?: string
      } = await fetchRes.json()

      if (fetchData.error) {
        const errorMsg = (fetchData.error as any)?.message || 'YouTube API error'
        console.error('YouTube API error during import:', fetchData.error)
        return NextResponse.json({ error: `YouTube API error: ${errorMsg}` }, { status: 400 })
      }

      const items = fetchData.items?.map(item => ({
        youtube_id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url || '',
        channelTitle: item.snippet.videoOwnerChannelTitle || '',
      })).filter(item =>
        // Exclude deleted (videoId = 'deleted') and private videos (empty/null videoId)
        item.youtube_id && item.youtube_id !== 'deleted' && item.youtube_id.trim().length > 0
      ) || []

      allItems = [...allItems, ...items]
      pageToken = fetchData.nextPageToken || null
    } while (pageToken && allItems.length < 200)

    // Batch-verify that videos are still publicly available on YouTube
    const availableItems = await filterAvailableVideos(allItems, apiKey)

    const playlist = await sql`
      INSERT INTO playlists (tenant_id, name, description, is_enabled)
      VALUES (${ctx.tenant.id}, ${name || 'Imported from YouTube'}, ${'Imported from YouTube playlist: ' + youtubePlaylistId}, true)
      RETURNING *
    `

    const playlistDbId = playlist[0].id

    for (let i = 0; i < availableItems.length; i++) {
      const item = availableItems[i]
      // Upsert into songs table first
      const songResult = await sql`
        INSERT INTO songs (youtube_id, title, thumbnail, artist, is_available)
        VALUES (${item.youtube_id}, ${item.title}, ${item.thumbnail}, ${item.channelTitle}, true)
        ON CONFLICT (youtube_id) DO UPDATE SET
          title = EXCLUDED.title,
          thumbnail = COALESCE(EXCLUDED.thumbnail, songs.thumbnail),
          artist = COALESCE(EXCLUDED.artist, songs.artist),
          is_available = true,
          updated_at = NOW()
        RETURNING id
      `
      const songId = songResult[0].id

      await sql`
        INSERT INTO playlist_songs (tenant_id, playlist_id, song_id, position)
        VALUES (${ctx.tenant.id}, ${playlistDbId}, ${songId}, ${i + 1})
        ON CONFLICT DO NOTHING
      `
    }
    await invalidateCache([
      cacheKey('playlists', ctx.tenant.id),
      cacheKey('playlist-songs', ctx.tenant.id, playlistDbId),
      cacheKey('stations'),
    ])

    return NextResponse.json({
      success: true,
      playlist: playlist[0],
      imported: availableItems.length,
      filtered_out: allItems.length - availableItems.length,
    })
  } catch (error) {
    console.error('Error importing YouTube playlist:', error)
    return NextResponse.json({ error: 'Failed to import playlist' }, { status: 500 })
  }
}
