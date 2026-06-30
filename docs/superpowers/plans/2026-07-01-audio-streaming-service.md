# Audio Streaming Service Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) for syntax tracking.

**Goal:** Replace direct Cloudflare audio URLs with a server-side streaming proxy that prevents downloads.

**Architecture:** HMAC-signed tokens generated at API response time encode song/tenant identity. A streaming endpoint validates tokens, looks up the real Cloudflare URL from the database, and proxies the audio with Range request support. The transform happens at the API route level — no client code changes needed.

**Tech Stack:** Next.js 16, PostgreSQL (via `postgres`), Node `crypto` for HMAC signing

---

### Task 1: Create Token Service (`lib/audio-stream.ts`)

**Files:**
- Create: `lib/audio-stream.ts`

- [ ] **Step 1: Create the token service file**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add lib/audio-stream.ts
git commit -m "feat(audio-stream): add token generation and validation service"
```

---

### Task 2: Create Streaming Endpoint (`app/api/audio/stream/route.ts`)

**Files:**
- Create: `app/api/audio/stream/route.ts`

- [ ] **Step 1: Create the streaming endpoint**

```typescript
// app/api/audio/stream/route.ts
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
    const rows = await sql<Array<{ audio_url: string | null; youtube_id: string }>>`
      SELECT audio_url, youtube_id FROM songs WHERE id = ${songId}
    `

    if (rows.length === 0) {
      return new Response('Song not found', { status: 404 })
    }

    const audioUrl = rows[0].audio_url
    if (!audioUrl || audioUrl.trim() === '') {
      return new Response('No audio URL available for this song', { status: 404 })
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

    if (!response.ok && response.status !== 206) {
      console.error(`Audio stream proxy failed: ${response.status} for song ${songId}`)
      return new Response(`Failed to fetch audio: ${response.statusText}`, {
        status: response.status,
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
    responseHeaders.set('Cache-Control', 'public, max-age=300')

    // Explicitly omit Content-Disposition to prevent "Save As" prompt
    // No Content-Disposition header means the browser won't suggest saving

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('Error in audio stream endpoint:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/audio/stream/route.ts
git commit -m "feat(audio-stream): add streaming proxy endpoint with token validation"
```

---

### Task 3: Transform `audio_url` in Playlist Songs API

**Files:**
- Modify: `app/api/playlists/[id]/songs/route.ts`

- [ ] **Step 1: Add import for `buildStreamUrl`**

Add this import to the top of `app/api/playlists/[id]/songs/route.ts`:

```typescript
import { buildStreamUrl } from '@/lib/audio-stream'
```

- [ ] **Step 2: Add audio_url transform to GET handler**

In the GET handler, after the thumbnail proxy line and before `return NextResponse.json(...)`, add the `audio_url` transform:

Find this code (around line 31-35):
```typescript
    const { origin } = new URL(request.url)
    const songs = (result.data as any[]).map(song => ({
      ...song,
      thumbnail: song.thumbnail ? getProxiedUrl(song.thumbnail, origin) : song.thumbnail
    }))
```

Replace with:
```typescript
    const { origin } = new URL(request.url)
    const songs = (result.data as any[]).map(song => ({
      ...song,
      thumbnail: song.thumbnail ? getProxiedUrl(song.thumbnail, origin) : song.thumbnail,
      audio_url: song.audio_url
        ? buildStreamUrl(origin, song.song_id, ctx.tenant.id)
        : null,
    }))
```

- [ ] **Step 3: Add audio_url transform to POST response**

In the POST handler, around line 119-124 (after fetching fullSong), find:

```typescript
    const { origin } = new URL(request.url)
    const song = fullSong[0]
    if (song && song.thumbnail) {
      song.thumbnail = getProxiedUrl(song.thumbnail, origin)
    }
```

Replace with:

```typescript
    const { origin } = new URL(request.url)
    const song = fullSong[0]
    if (song) {
      if (song.thumbnail) {
        song.thumbnail = getProxiedUrl(song.thumbnail, origin)
      }
      if (song.audio_url) {
        song.audio_url = buildStreamUrl(origin, song.song_id, ctx.tenant.id)
      }
    }
```

- [ ] **Step 4: Commit**

```bash
git add app/api/playlists/\[id\]/songs/route.ts
git commit -m "feat(audio-stream): transform audio_url to stream URL in playlist songs API"
```

---

### Task 4: Transform `audio_url` in Requests API

**Files:**
- Modify: `app/api/requests/route.ts`

- [ ] **Step 1: Add import for `buildStreamUrl`**

Add this import to the top of `app/api/requests/route.ts`:

```typescript
import { buildStreamUrl } from '@/lib/audio-stream'
```

- [ ] **Step 2: Add audio_url transform to GET handler (device-specific query)**

Find the first GET response block (around lines 33-37) where device-specific requests are formatted:

```typescript
    const formatted = (result.data as any[]).map(req => ({
      ...req,
      thumbnail: req.thumbnail ? getProxiedUrl(req.thumbnail, origin) : req.thumbnail
    }))
```

Replace with:

```typescript
    const formatted = (result.data as any[]).map(req => ({
      ...req,
      thumbnail: req.thumbnail ? getProxiedUrl(req.thumbnail, origin) : req.thumbnail,
      audio_url: req.audio_url
        ? buildStreamUrl(origin, req.song_id, ctx.tenant.id)
        : null,
    }))
```

- [ ] **Step 3: Add audio_url transform to GET handler (pending requests)**

Find the second GET response block (around lines 52-55) for pending requests:

```typescript
    const formatted = (result.data as any[]).map(req => ({
      ...req,
      thumbnail: req.thumbnail ? getProxiedUrl(req.thumbnail, origin) : req.thumbnail
    }))
```

Replace with:

```typescript
    const formatted = (result.data as any[]).map(req => ({
      ...req,
      thumbnail: req.thumbnail ? getProxiedUrl(req.thumbnail, origin) : req.thumbnail,
      audio_url: req.audio_url
        ? buildStreamUrl(origin, req.song_id, ctx.tenant.id)
        : null,
    }))
```

- [ ] **Step 4: Add audio_url transform to POST response**

In the POST handler, around lines 135-139, find:

```typescript
    const { origin } = new URL(request.url)
    const reqObj = fullRequest[0]
    if (reqObj && reqObj.thumbnail) {
      reqObj.thumbnail = getProxiedUrl(reqObj.thumbnail, origin)
    }
```

Replace with:

```typescript
    const { origin } = new URL(request.url)
    const reqObj = fullRequest[0]
    if (reqObj) {
      if (reqObj.thumbnail) {
        reqObj.thumbnail = getProxiedUrl(reqObj.thumbnail, origin)
      }
      if (reqObj.audio_url) {
        reqObj.audio_url = buildStreamUrl(origin, reqObj.song_id, ctx.tenant.id)
      }
    }
```

- [ ] **Step 5: Commit**

```bash
git add app/api/requests/route.ts
git commit -m "feat(audio-stream): transform audio_url to stream URL in requests API"
```

---

## Verification Checklist

After all tasks are complete, verify the streaming service works end-to-end:

1. **Start the dev server:** `npm run dev`
2. **Fetch playlist songs via curl** and confirm `audio_url` is a stream URL (not a Cloudflare URL):
   ```bash
   curl -s "http://localhost:3000/api/playlists/1/songs?tenant=test-slug" | jq '.[0].audio_url'
   ```
   Expected: `http://localhost:3000/api/audio/stream?songId=...&token=...`

3. **Test the stream endpoint directly**:
   ```bash
   curl -v "http://localhost:3000/api/audio/stream?songId=1&token=BADTOKEN"
   ```
   Expected: HTTP 403

4. **Test with a valid token** (extract from API response):
   ```bash
   STREAM_URL=$(curl -s "http://localhost:3000/api/playlists/1/songs?tenant=test-slug" | jq -r '.[0].audio_url')
   curl -v "$STREAM_URL" -o /dev/null
   ```
   Expected: HTTP 200 (or 206) with `Content-Type: audio/mpeg` and `Accept-Ranges: bytes`

5. **Verify admin page loads and shows Audio/YTB badges correctly** — songs with audio should show the green Audio badge, songs without should show the amber YT badge

6. **Play a song with audio_url in the admin** — confirm it plays via the stream endpoint (check Network tab for requests to `/api/audio/stream`)
