import { sql } from '@/lib/db'
import { isTenantError, requireTenantContext } from '@/lib/tenancy'
import { NextResponse } from 'next/server'

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
      })).filter(item => item.youtube_id !== 'deleted') || []

      allItems = [...allItems, ...items]
      pageToken = fetchData.nextPageToken || null
    } while (pageToken && allItems.length < 200)

    const playlist = await sql`
      INSERT INTO playlists (tenant_id, name, description, is_enabled)
      VALUES (${ctx.tenant.id}, ${name || 'Imported from YouTube'}, ${'Imported from YouTube playlist: ' + youtubePlaylistId}, true)
      RETURNING *
    `

    const playlistDbId = playlist[0].id

    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i]
      await sql`
        INSERT INTO playlist_songs (tenant_id, playlist_id, youtube_id, title, thumbnail, artist, position)
        VALUES (${ctx.tenant.id}, ${playlistDbId}, ${item.youtube_id}, ${item.title}, ${item.thumbnail}, ${item.channelTitle}, ${i + 1})
        ON CONFLICT DO NOTHING
      `
    }

    return NextResponse.json({
      success: true,
      playlist: playlist[0],
      imported: allItems.length,
    })
  } catch (error) {
    console.error('Error importing YouTube playlist:', error)
    return NextResponse.json({ error: 'Failed to import playlist' }, { status: 500 })
  }
}
