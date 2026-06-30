// lib/audio-stream.ts
import { createHmac, timingSafeEqual } from 'crypto'

const STREAM_SECRET = process.env.STREAM_SIGNING_SECRET || 'music-bar-stream-secret-local'
const TOKEN_TTL_MS = 5 * 60 * 1000 // 5 minutes

export interface StreamToken {
  songId: number
  tenantId: string
  exp: number
  nonce: string
}

function generateNonce(): string {
  return Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join('')
}

export function generateStreamToken(songId: number, tenantId: string): string {
  const payload: StreamToken = {
    songId,
    tenantId,
    exp: Date.now() + TOKEN_TTL_MS,
    nonce: generateNonce(),
  }
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', STREAM_SECRET).update(encoded).digest('base64url')
  return `${encoded}.${signature}`
}

export function validateStreamToken(token: string): StreamToken | null {
  const dotIndex = token.indexOf('.')
  if (dotIndex === -1) return null

  const encoded = token.slice(0, dotIndex)
  const signature = token.slice(dotIndex + 1)

  const expectedSignature = createHmac('sha256', STREAM_SECRET).update(encoded).digest('base64url')
  const expectedBuf = Buffer.from(expectedSignature)
  const actualBuf = Buffer.from(signature)

  if (expectedBuf.length !== actualBuf.length || !timingSafeEqual(expectedBuf, actualBuf)) {
    return null
  }

  try {
    const payload: StreamToken = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8')
    )
    if (payload.exp < Date.now()) return null
    if (typeof payload.songId !== 'number' || typeof payload.tenantId !== 'string') return null
    return payload
  } catch {
    return null
  }
}

export function buildStreamUrl(origin: string, songId: number, tenantId: string): string {
  const token = generateStreamToken(songId, tenantId)
  return `${origin}/api/audio/stream?songId=${songId}&token=${encodeURIComponent(token)}`
}
