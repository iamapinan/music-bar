import { redis } from '@/lib/cache'

const WINDOW_MS = 60 * 1000 // 1 minute window
const MAX_REQUESTS = 60      // max requests per window per IP

// In-memory fallback when Redis is unavailable
const memStore = new Map<string, { count: number; resetAt: number }>()

/**
 * Simple fixed-window rate limiter.
 *
 * Uses Redis INCR+EXPIRE when available, falls back to in-memory Map.
 * Returns `{ allowed: true }` or `{ allowed: false, retryAfter: number }`.
 */
export async function checkRateLimit(
  request: Request,
  options: { maxRequests?: number; windowMs?: number } = {},
): Promise<{ allowed: true } | { allowed: false; retryAfter: number }> {
  const maxRequests = options.maxRequests ?? MAX_REQUESTS
  const windowMs = options.windowMs ?? WINDOW_MS

  // Get client IP from headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown'

  const windowKey = Math.floor(Date.now() / windowMs)
  const key = `ratelimit:${ip}:${windowKey}`

  try {
    if (redis) {
      // Use Redis when available
      const count = (await redis.command(['INCR', key])) as number
      if (count === 1) {
        await redis.command(['EXPIRE', key, Math.ceil(windowMs / 1000) + 10])
      }
      if (count > maxRequests) {
        return { allowed: false, retryAfter: windowMs }
      }
      return { allowed: true }
    }
  } catch {
    // Redis error — fall through to in-memory
  }

  // In-memory fallback
  const memKey = `${ip}:${windowKey}`
  const entry = memStore.get(memKey)
  const now = Date.now()

  if (!entry || now > entry.resetAt) {
    memStore.set(memKey, { count: 1, resetAt: now + windowMs + 1000 })
    return { allowed: true }
  }

  entry.count++
  if (entry.count > maxRequests) {
    return { allowed: false, retryAfter: entry.resetAt - now }
  }

  return { allowed: true }
}
