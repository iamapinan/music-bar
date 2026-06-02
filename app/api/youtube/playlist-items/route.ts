import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const playlistId = searchParams.get('playlistId')
  
  if (!playlistId) {
    return NextResponse.json({ error: 'Playlist ID required' }, { status: 400 })
  }
  
  const apiKey = process.env.YOUTUBE_API_KEY
  
  if (!apiKey) {
    // Return mock data for demo when no API key is set
    return NextResponse.json({
      items: [
        {
          id: 'dQw4w9WgXcQ',
          youtube_id: 'dQw4w9WgXcQ',
          title: 'Demo Song 1 (No API Key) - Rick Astley - Never Gonna Give You Up',
          thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
          channelTitle: 'Demo Channel'
        },
        {
          id: 'L_jWHffIx5E',
          youtube_id: 'L_jWHffIx5E',
          title: 'Demo Song 2 (No API Key) - Smash Mouth - All Star',
          thumbnail: 'https://i.ytimg.com/vi/L_jWHffIx5E/mqdefault.jpg',
          channelTitle: 'Demo Channel'
        },
        {
          id: '9bZkp7q19f0',
          youtube_id: '9bZkp7q19f0',
          title: 'Demo Song 3 (No API Key) - PSY - GANGNAM STYLE',
          thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg',
          channelTitle: 'Demo Channel'
        }
      ]
    })
  }
  
  try {
    const fetchUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${apiKey}`
    const response = await fetch(fetchUrl)
    const data = await response.json()
    
    if (data.error) {
      console.error('YouTube API error:', data.error)
      return NextResponse.json({ error: 'YouTube API error' }, { status: 500 })
    }
    
    const formattedItems = data.items?.map((item: any) => ({
      id: item.snippet.resourceId.videoId,
      youtube_id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
      channelTitle: item.snippet.videoOwnerChannelTitle || item.snippet.channelTitle || 'Unknown Artist'
    })).filter((item: any) => item.youtube_id !== 'deleted') || []
    
    return NextResponse.json({ items: formattedItems })
  } catch (error) {
    console.error('Error fetching playlist items:', error)
    return NextResponse.json({ error: 'Failed to fetch playlist items' }, { status: 500 })
  }
}
