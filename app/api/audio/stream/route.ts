import { sql } from '@/lib/db'
import { checkRateLimit } from '@/lib/rate-limit'

export async function GET(request: Request) {
  try {
    // Rate limit: max 20 stream requests per minute per IP (bandwidth protection)
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

    // Look up the audio URL from DB
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

    // Redirect to the actual audio URL directly
    return Response.redirect(audioUrl.trim(), 302)
  } catch (error) {
    console.error('Error in audio stream endpoint:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
