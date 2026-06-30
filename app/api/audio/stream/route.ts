import { sql } from '@/lib/db'
import { validateStreamToken } from '@/lib/audio-stream'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const songIdParam = searchParams.get('songId')
    const token = searchParams.get('token')

    if (!songIdParam || !token) {
      return new Response('Missing songId or token parameter', { status: 400 })
    }

    const songId = parseInt(songIdParam, 10)
    if (!Number.isFinite(songId) || songId <= 0) {
      return new Response('Invalid songId', { status: 400 })
    }

    // Validate token
    const payload = validateStreamToken(token)
    if (!payload) {
      return new Response('Invalid or expired token', { status: 403 })
    }

    if (payload.songId !== songId) {
      return new Response('Token does not match songId', { status: 403 })
    }

    // Look up the actual audio_url from DB
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

    // Defense-in-depth: reject non-HTTPS URLs to prevent SSRF
    let parsedAudioUrl: URL
    try {
      parsedAudioUrl = new URL(audioUrl.trim())
    } catch {
      return new Response('Invalid audio URL', { status: 502 })
    }
    if (parsedAudioUrl.protocol !== 'https:') {
      return new Response('Invalid audio URL protocol', { status: 502 })
    }

    // Proxy the request to the Cloudflare URL
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (compatible; MusicBarAudioProxy/1.0)',
    }

    // Forward Range header for seeking support
    const rangeHeader = request.headers.get('range')
    if (rangeHeader) {
      headers['Range'] = rangeHeader
    }

    const response = await fetch(audioUrl.trim(), { headers })

    if (!response.ok) {
      console.error(`Audio stream proxy failed: ${response.status} for song ${songId}`)
      return new Response('Failed to fetch audio from upstream', {
        status: 502,
      })
    }

    // Build response headers
    const responseHeaders = new Headers()

    // Forward content type (e.g. audio/mpeg)
    const contentType = response.headers.get('content-type')
    if (contentType) {
      responseHeaders.set('Content-Type', contentType)
    } else {
      responseHeaders.set('Content-Type', 'audio/mpeg')
    }

    // Forward content length if present
    const contentLength = response.headers.get('content-length')
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength)
    }

    // Forward content range for 206 responses (seeking)
    const contentRange = response.headers.get('content-range')
    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange)
    }

    // Signal that we support range requests
    responseHeaders.set('Accept-Ranges', 'bytes')

    // Cache for 5 minutes on CDN/browser (but token expiry limits this anyway)
    responseHeaders.set('Cache-Control', 'private, max-age=300')

    // Explicitly omit Content-Disposition to prevent "Save As" prompt

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('Error in audio stream endpoint:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
