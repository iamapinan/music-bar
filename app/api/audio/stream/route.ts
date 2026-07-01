import { sql } from '@/lib/db'
import { checkRateLimit } from '@/lib/rate-limit'

export async function GET(request: Request) {
  try {
    const rateCheck = await checkRateLimit(request, { maxRequests: 20, windowMs: 60_000 })
    if (!rateCheck.allowed) {
      return new Response('Too many requests, please slow down', {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(rateCheck.retryAfter / 1000)) },
      })
    }

    const { searchParams } = new URL(request.url)
    const songIdParam = searchParams.get('songId')

    if (!songIdParam) {
      return new Response('Missing songId parameter', { status: 400 })
    }

    const songId = parseInt(songIdParam, 10)
    if (!Number.isFinite(songId) || songId <= 0) {
      return new Response('Invalid songId', { status: 400 })
    }

    const rows = await sql<Array<{ audio_url: string | null }>>`
      SELECT audio_url FROM songs WHERE id = ${songId}
    `

    if (rows.length === 0) {
      return new Response('Song not found', { status: 404 })
    }

    const audioUrl = rows[0].audio_url
    if (!audioUrl || audioUrl.trim() === '') {
      return new Response('No audio URL available for this song', { status: 404 })
    }

    // Validate URL
    let parsedAudioUrl: URL
    try {
      parsedAudioUrl = new URL(audioUrl.trim())
    } catch {
      return new Response('Invalid audio URL', { status: 502 })
    }
    if (parsedAudioUrl.protocol !== 'https:') {
      return new Response('Invalid audio URL protocol', { status: 502 })
    }

    // Fetch from CDN (CDN doesn't support Range, returns full file)
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (compatible; MusicBarAudioProxy/1.0)',
    }
    const rangeHeader = request.headers.get('range')
    if (rangeHeader) {
      headers['Range'] = rangeHeader
    }

    const upstream = await fetch(audioUrl.trim(), { headers })

    if (!upstream.ok) {
      console.error(`Audio proxy failed: ${upstream.status} for song ${songId}`)
      return new Response('Failed to fetch audio', {
        status: 502,
      })
    }

    // Build response headers
    const responseHeaders = new Headers()

    const contentType = upstream.headers.get('content-type')
    responseHeaders.set('Content-Type', contentType || 'audio/mpeg')

    const contentLength = upstream.headers.get('content-length')
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength)
    }

    // Forward Content-Range if upstream returned 206
    const contentRange = upstream.headers.get('content-range')
    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange)
    }

    // Ensure Accept-Ranges so Android MediaPlayer knows Range is supported
    responseHeaders.set('Accept-Ranges', 'bytes')

    // Cache on CDN for 1 hour (audio files don't change)
    responseHeaders.set('Cache-Control', 'public, max-age=3600')

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('Error in audio stream endpoint:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
