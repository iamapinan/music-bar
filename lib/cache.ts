import { Socket, createConnection } from 'net'

type PendingCommand = {
  resolve: (value: unknown) => void
  reject: (error: Error) => void
}

class RedisLite {
  private socket: Socket | null = null
  private buffer = Buffer.alloc(0)
  private pending: PendingCommand[] = []
  private connecting: Promise<void> | null = null

  constructor(private readonly url: URL) {}

  private async connect() {
    if (this.socket && !this.socket.destroyed) return
    if (this.connecting) return this.connecting

    this.connecting = new Promise((resolve, reject) => {
      const socket = createConnection({
        host: this.url.hostname,
        port: Number(this.url.port || 6379),
        timeout: 1500,
      })

      const fail = (error: Error) => {
        this.reset(error)
        reject(error)
      }

      socket.once('connect', () => {
        socket.off('error', fail)
        this.socket = socket
        this.connecting = null
        resolve()
      })
      socket.once('error', fail)
      socket.on('data', chunk => {
        this.buffer = Buffer.concat([this.buffer, chunk])
        this.drain()
      })
      socket.on('error', error => this.reset(error))
      socket.on('close', () => this.reset(new Error('Redis connection closed')))
    })

    return this.connecting
  }

  private reset(error: Error) {
    this.socket?.destroy()
    this.socket = null
    this.connecting = null
    const pending = this.pending.splice(0)
    for (const command of pending) command.reject(error)
  }

  private drain() {
    while (this.pending.length > 0) {
      const parsed = this.parse(0)
      if (!parsed) return
      this.buffer = this.buffer.subarray(parsed.offset)
      const command = this.pending.shift()
      if (!command) return
      if (parsed.value instanceof Error) command.reject(parsed.value)
      else command.resolve(parsed.value)
    }
  }

  private parse(offset: number): { value: unknown; offset: number } | null {
    if (offset >= this.buffer.length) return null
    const prefix = String.fromCharCode(this.buffer[offset])
    const lineEnd = this.buffer.indexOf('\r\n', offset)
    if (lineEnd === -1) return null
    const line = this.buffer.toString('utf8', offset + 1, lineEnd)
    const next = lineEnd + 2

    if (prefix === '+') return { value: line, offset: next }
    if (prefix === '-') return { value: new Error(line), offset: next }
    if (prefix === ':') return { value: Number(line), offset: next }
    if (prefix === '$') {
      const length = Number(line)
      if (length === -1) return { value: null, offset: next }
      const end = next + length
      if (this.buffer.length < end + 2) return null
      return { value: this.buffer.toString('utf8', next, end), offset: end + 2 }
    }
    if (prefix === '*') {
      const count = Number(line)
      if (count === -1) return { value: null, offset: next }
      const values: unknown[] = []
      let cursor = next
      for (let i = 0; i < count; i++) {
        const item = this.parse(cursor)
        if (!item) return null
        values.push(item.value)
        cursor = item.offset
      }
      return { value: values, offset: cursor }
    }

    return { value: new Error(`Unsupported Redis response: ${prefix}`), offset: next }
  }

  async command(args: Array<string | number>) {
    await this.connect()
    const payload = [
      `*${args.length}`,
      ...args.flatMap(arg => {
        const value = String(arg)
        return [`$${Buffer.byteLength(value)}`, value]
      }),
      '',
    ].join('\r\n')

    return new Promise((resolve, reject) => {
      this.pending.push({ resolve, reject })
      this.socket?.write(payload, error => {
        if (error) {
          this.pending.pop()
          reject(error)
        }
      })
    })
  }
}

const redisUrl = process.env.REDIS_URL
const redis = redisUrl ? new RedisLite(new URL(redisUrl)) : null
const namespace = process.env.REDIS_CACHE_NAMESPACE || 'music-bar'

const defaultTtl = Number(process.env.REDIS_CACHE_TTL_SECONDS || 20)

function namespaced(key: string) {
  return `${namespace}:${key}`
}

export function cacheKey(...parts: Array<string | number | boolean | null | undefined>) {
  return parts
    .filter(part => part !== undefined && part !== null && part !== '')
    .map(part => encodeURIComponent(String(part)))
    .join(':')
}

export async function getCachedJson<T>(key: string): Promise<T | null> {
  if (!redis) return null
  try {
    const value = await redis.command(['GET', namespaced(key)])
    return typeof value === 'string' ? JSON.parse(value) as T : null
  } catch (error) {
    console.warn('Redis cache read failed:', error)
    return null
  }
}

export async function setCachedJson(key: string, value: unknown, ttlSeconds = defaultTtl) {
  if (!redis || ttlSeconds <= 0) return
  try {
    await redis.command(['SET', namespaced(key), JSON.stringify(value), 'EX', ttlSeconds])
  } catch (error) {
    console.warn('Redis cache write failed:', error)
  }
}

export async function cachedJson<T>(
  key: string,
  ttlSeconds: number,
  producer: () => Promise<T>,
): Promise<{ data: T; cache: 'HIT' | 'MISS' | 'BYPASS' }> {
  if (!redis) return { data: await producer(), cache: 'BYPASS' }

  const cached = await getCachedJson<T>(key)
  if (cached !== null) return { data: cached, cache: 'HIT' }

  const data = await producer()
  await setCachedJson(key, data, ttlSeconds)
  return { data, cache: 'MISS' }
}

export async function invalidateCache(keys: string[]) {
  if (!redis || keys.length === 0) return
  try {
    await redis.command(['DEL', ...keys.map(namespaced)])
  } catch (error) {
    console.warn('Redis cache invalidation failed:', error)
  }
}

export function cacheHeaders(cache: 'HIT' | 'MISS' | 'BYPASS', startedAt: number) {
  return {
    'x-cache': cache,
    'server-timing': `app;dur=${Date.now() - startedAt}`,
  }
}
