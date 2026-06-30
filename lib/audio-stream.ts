import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

const STREAM_SECRET = process.env.STREAM_SIGNING_SECRET || 'music-bar-stream-secret-local'
const TOKEN_TTL_MS = 5 * 60 * 1000 // 5 minutes
const HMAC_ALGORITHM = 'sha256'
const BASE64_ENCODING = 'base64url'

export interface StreamToken {
  songId: number
  tenantId: string
  exp: number
  nonce: string
}

function generateNonce(): string {
  return randomBytes(6).toString(BASE64_ENCODING)
}

/**
 * Generate an HMAC-signed stream token for a given song and tenant.
 *
 * Token format: `{base64url-payload}.{base64url-hmac-signature}`
 *
 * The payload contains songId, tenantId, an expiry timestamp (5 min from now),
 * and a random nonce. The HMAC-SHA256 signature authenticates the payload.
 */
export function generateStreamToken(songId: number, tenantId: string): string {
  const payload: StreamToken = {
    songId,
    tenantId,
    exp: Date.now() + TOKEN_TTL_MS,
    nonce: generateNonce(),
  }
  const encoded = Buffer.from(JSON.stringify(payload)).toString(BASE64_ENCODING)
  const signature = createHmac(HMAC_ALGORITHM, STREAM_SECRET)
    .update(encoded)
    .digest(BASE64_ENCODING)
  return `${encoded}.${signature}`
}

/**
 * Validate a stream token and return its payload if valid, or null on failure.
 *
 * Verification steps:
 * 1. Parse the `{payload}.{signature}` format
 * 2. Recompute the HMAC signature and compare with timingSafeEqual
 * 3. Parse the JSON payload
 * 4. Check expiry and field types
 */
export function validateStreamToken(token: string): StreamToken | null {
  const dotIndex = token.indexOf('.')
  if (dotIndex === -1) return null

  const encoded = token.slice(0, dotIndex)
  const signature = token.slice(dotIndex + 1)

  const expectedSignature = createHmac(HMAC_ALGORITHM, STREAM_SECRET)
    .update(encoded)
    .digest(BASE64_ENCODING)
  const expectedBuf = Buffer.from(expectedSignature)
  const actualBuf = Buffer.from(signature)

  if (expectedBuf.length !== actualBuf.length || !timingSafeEqual(expectedBuf, actualBuf)) {
    return null
  }

  try {
    const parsed = JSON.parse(Buffer.from(encoded, BASE64_ENCODING).toString('utf8'))
    if (
      typeof parsed.songId !== 'number' ||
      typeof parsed.tenantId !== 'string' ||
      typeof parsed.exp !== 'number' ||
      typeof parsed.nonce !== 'string'
    ) {
      return null
    }
    if (parsed.exp < Date.now()) return null
    return parsed as StreamToken
  } catch {
    return null
  }
}

/**
 * Build a fully-qualified streaming URL for a song.
 *
 * The URL includes the songId as a query param for convenience (logging,
 * DB lookup) and a signed token for authorization. The stream endpoint
 * cross-validates that the token's embedded songId matches the URL param.
 */
export function buildStreamUrl(origin: string, songId: number, tenantId: string): string {
  const token = generateStreamToken(songId, tenantId)
  return `${origin}/api/audio/stream?songId=${songId}&token=${token}`
}
