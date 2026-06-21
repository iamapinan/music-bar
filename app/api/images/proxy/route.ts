import { NextResponse } from 'next/server'
import { getCachedJson, setCachedJson } from '@/lib/cache'

// Allowed domains to prevent SSRF (Server-Side Request Forgery)
const ALLOWED_DOMAINS = [
  'i.ytimg.com',
  'img.youtube.com',
  'lh3.googleusercontent.com',
  'googleusercontent.com',
]

function isDomainAllowed(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    const hostname = url.hostname.toLowerCase()
    return ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    )
  } catch {
    return false
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const youtubeId = searchParams.get('youtubeId')
  const file = searchParams.get('file') || 'mqdefault.jpg'
  const urlParam = searchParams.get('url')

  let targetUrl = ''

  if (youtubeId) {
    // Validate YouTube ID pattern
    if (!/^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
      return new Response('Invalid YouTube ID format', { status: 400 })
    }
    // Validate thumbnail file pattern
    if (!/^[a-zA-Z0-9_.-]+\.(jpg|jpeg|png|webp)$/i.test(file)) {
      return new Response('Invalid image file format', { status: 400 })
    }
    targetUrl = `https://i.ytimg.com/vi/${youtubeId}/${file}`
  } else if (urlParam) {
    if (!isDomainAllowed(urlParam)) {
      return new Response('Access forbidden for this domain', { status: 403 })
    }
    targetUrl = urlParam
  } else {
    return new Response('Missing youtubeId or url parameter', { status: 400 })
  }

  // Construct namespace key for Redis cache
  const cacheKeyStr = youtubeId 
    ? `image:yt:${youtubeId}:${file}`
    : `image:url:${Buffer.from(targetUrl).toString('base64url')}`

  try {
    // 1. Try to read from cache
    const cached = await getCachedJson<{ contentType: string; data: string }>(cacheKeyStr)
    if (cached?.data) {
      const buffer = Buffer.from(cached.data, 'base64')
      return new Response(buffer, {
        headers: {
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Cache': 'HIT',
        },
      })
    }

    // 2. Fetch the original image
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    })

    if (!response.ok) {
      return new Response(`Failed to load image from source: ${response.statusText}`, { status: response.status })
    }

    const contentType = response.headers.get('Content-Type') || 'image/jpeg'
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Defend against caching excessively large images (> 2MB)
    if (buffer.length <= 2 * 1024 * 1024) {
      const base64Data = buffer.toString('base64')
      // Save image to Redis cache for 30 days (2,592,000 seconds)
      await setCachedJson(cacheKeyStr, { contentType, data: base64Data }, 2592000)
    }

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Cache': 'MISS',
      },
    })
  } catch (error) {
    console.error('Error in image proxy route:', error)
    return new Response('Error proxying image', { status: 500 })
  }
}
