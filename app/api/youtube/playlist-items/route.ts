import { NextResponse } from 'next/server'
import { cachedJson, cacheHeaders, cacheKey } from '@/lib/cache'
import { getProxiedUrl } from '@/lib/images'

function getDemoPlaylistItems(errorMsg?: string) {
  const suffix = errorMsg ? ` (Demo Mode: ${errorMsg})` : ' (No API Key)'
  return {
    items: [
      {
        id: 'dQw4w9WgXcQ',
        youtube_id: 'dQw4w9WgXcQ',
        title: `Demo Song 1${suffix} - Rick Astley - Never Gonna Give You Up`,
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        channelTitle: 'Demo Channel'
      },
      {
        id: 'L_jWHffIx5E',
        youtube_id: 'L_jWHffIx5E',
        title: `Demo Song 2${suffix} - Smash Mouth - All Star`,
        thumbnail: 'https://i.ytimg.com/vi/L_jWHffIx5E/mqdefault.jpg',
        channelTitle: 'Demo Channel'
      },
      {
        id: '9bZkp7q19f0',
        youtube_id: '9bZkp7q19f0',
        title: `Demo Song 3${suffix} - PSY - GANGNAM STYLE`,
        thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg',
        channelTitle: 'Demo Channel'
      }
    ],
    demo: true,
    error: errorMsg
  }
}

export async function GET(request: Request) {
  const startedAt = Date.now()
  const { searchParams } = new URL(request.url)
  const playlistId = searchParams.get('playlistId')
  
  if (!playlistId) {
    return NextResponse.json({ error: 'Playlist ID required' }, { status: 400 })
  }
  
  const apiKey = process.env.YOUTUBE_API_KEY
  const { origin } = new URL(request.url)
  
  if (!apiKey) {
    const demoData = getDemoPlaylistItems()
    const items = (demoData.items || []).map((item: any) => ({
      ...item,
      thumbnail: item.thumbnail ? getProxiedUrl(item.thumbnail, origin) : item.thumbnail
    }))
    return NextResponse.json({ ...demoData, items })
  }
  
  try {
    const result = await cachedJson(cacheKey('youtube-playlist-items', playlistId), 900, async () => {
      const fetchUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${apiKey}`
      const response = await fetch(fetchUrl)
      const data = await response.json()
      
      if (data.error) {
        console.warn('YouTube API playlistItems error, falling back to demo data:', data.error)
        const errorMsg = data.error.message || 'YouTube API error'
        return getDemoPlaylistItems(errorMsg)
      }
      
      const formattedItems = data.items?.map((item: any) => ({
        id: item.snippet.resourceId.videoId,
        youtube_id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
        channelTitle: item.snippet.videoOwnerChannelTitle || item.snippet.channelTitle || 'Unknown Artist'
      })).filter((item: any) => item.youtube_id !== 'deleted') || []
      
      return { items: formattedItems }
    })

    const items = (result.data.items || []).map((item: any) => ({
      ...item,
      thumbnail: item.thumbnail ? getProxiedUrl(item.thumbnail, origin) : item.thumbnail
    }))

    return NextResponse.json({ ...result.data, items }, { headers: cacheHeaders(result.cache, startedAt) })
  } catch (error) {
    console.error('Error fetching playlist items, falling back to demo data:', error)
    const errorMsg = error instanceof Error ? error.message : 'Failed to fetch playlist items'
    const demoData = getDemoPlaylistItems(errorMsg)
    const items = (demoData.items || []).map((item: any) => ({
      ...item,
      thumbnail: item.thumbnail ? getProxiedUrl(item.thumbnail, origin) : item.thumbnail
    }))
    return NextResponse.json({ ...demoData, items })
  }
}
