import { NextResponse } from 'next/server'

function getDemoData(type: string, errorMsg?: string) {
  const suffix = errorMsg ? ` (Demo Mode: ${errorMsg})` : ' - Please add YouTube API Key'
  
  if (type === 'playlist') {
    return {
      items: [
        {
          id: 'PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf',
          title: `Demo Playlist 1${suffix}`,
          thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
          channelTitle: 'Demo Channel',
          itemCount: 25,
        },
        {
          id: 'PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI',
          title: `Demo Playlist 2${suffix}`,
          thumbnail: 'https://i.ytimg.com/vi/L_jWHffIx5E/mqdefault.jpg',
          channelTitle: 'Demo Channel',
          itemCount: 50,
        },
      ],
      demo: true,
      error: errorMsg,
    }
  }
  
  return {
    items: [
      {
        id: 'dQw4w9WgXcQ',
        title: `Demo Song 1${suffix}`,
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        channelTitle: 'Demo Channel',
      },
      {
        id: 'L_jWHffIx5E',
        title: `Demo Song 2${suffix}`,
        thumbnail: 'https://i.ytimg.com/vi/L_jWHffIx5E/mqdefault.jpg',
        channelTitle: 'Demo Channel',
      },
      {
        id: '9bZkp7q19f0',
        title: `Demo Song 3${suffix}`,
        thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg',
        channelTitle: 'Demo Channel',
      },
    ],
    demo: true,
    error: errorMsg,
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const type = searchParams.get('type') || 'video' // 'video' or 'playlist'
  
  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 })
  }
  
  const apiKey = process.env.YOUTUBE_API_KEY
  
  if (!apiKey) {
    return NextResponse.json(getDemoData(type))
  }
  
  try {
    if (type === 'playlist') {
      // Search for playlists
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=playlist&maxResults=10&key=${apiKey}`
      
      const response = await fetch(searchUrl)
      const data = await response.json()
      
      if (data.error) {
        console.warn('YouTube API search error, falling back to demo data:', data.error)
        const errorMsg = data.error.message || 'YouTube API error'
        return NextResponse.json(getDemoData(type, errorMsg))
      }
      
      // Get playlist details for item count
      const playlistIds = data.items?.map((item: { id: { playlistId: string } }) => item.id.playlistId).join(',')
      
      let playlistDetails: Record<string, number> = {}
      if (playlistIds) {
        const detailsUrl = `https://www.googleapis.com/youtube/v3/playlists?part=contentDetails&id=${playlistIds}&key=${apiKey}`
        const detailsResponse = await fetch(detailsUrl)
        const detailsData = await detailsResponse.json()
        
        playlistDetails = detailsData.items?.reduce((acc: Record<string, number>, item: { id: string; contentDetails: { itemCount: number } }) => {
          acc[item.id] = item.contentDetails.itemCount
          return acc
        }, {}) || {}
      }
      
      const items = data.items?.map((item: {
        id: { playlistId: string }
        snippet: {
          title: string
          thumbnails: { medium: { url: string } }
          channelTitle: string
        }
      }) => ({
        id: item.id.playlistId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        channelTitle: item.snippet.channelTitle,
        itemCount: playlistDetails[item.id.playlistId] || 0,
      })) || []
      
      return NextResponse.json({ items })
    }
    
    // Search for videos
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=10&key=${apiKey}`
    
    const response = await fetch(searchUrl)
    const data = await response.json()
    
    if (data.error) {
      console.warn('YouTube API search error, falling back to demo data:', data.error)
      const errorMsg = data.error.message || 'YouTube API error'
      return NextResponse.json(getDemoData(type, errorMsg))
    }
    
    const items = data.items?.map((item: {
      id: { videoId: string }
      snippet: {
        title: string
        thumbnails: { medium: { url: string } }
        channelTitle: string
      }
    }) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
    })) || []
    
    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error searching YouTube, falling back to demo data:', error)
    const errorMsg = error instanceof Error ? error.message : 'Failed to search'
    return NextResponse.json(getDemoData(type, errorMsg))
  }
}
