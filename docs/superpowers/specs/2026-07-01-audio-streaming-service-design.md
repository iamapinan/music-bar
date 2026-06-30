# Audio Streaming Service — Design Spec

## Overview

Replace direct Cloudflare audio URLs in API responses with a server-side streaming proxy that prevents users from downloading audio files directly. The streaming endpoint validates short-lived HMAC-signed tokens and proxies the audio from Cloudflare, supporting Range requests for seeking.

## Motivation

Songs in the Music Bar app can have an `audio_url` pointing to a Cloudflare-hosted audio file. Currently, this URL is sent to the client as-is, allowing users to:
- Right-click → "Save Audio As..."
- Copy the URL from DevTools Network tab
- Share the direct URL with others

This spec introduces a streaming endpoint that acts as a proxy — the real Cloudflare URL is **never** exposed to the browser or mobile app.

## Non-Goals

- Audio transcoding or format conversion
- DRM or encryption
- Caching audio chunks in Redis (too memory-intensive for large files)
- Replacing YouTube fallback playback

## Consumers (all zero-code-change)

Three consumers read `audio_url` from API responses and will transparently use the stream URL:

| Consumer | How it uses `audio_url` | Code change needed? |
|----------|------------------------|---------------------|
| **Web player** (`persistent-player.tsx`) | `new Audio(song.audio_url)` | None |
| **Admin player** (`admin-view.tsx`) | `playSongImmediately(song)` → `new Audio(song.audio_url)` | None |
| **Android app** (`MainActivity.kt`) | `MediaPlayer.setDataSource(song.audioUrl)` | None |

The transform happens at the API response layer — no client code changes required.

## Architecture

```
Client (Web/Android)                  Server (Next.js)                   Cloudflare
       │                                    │                              │
       │  GET /api/audio/stream              │                              │
       │  ?songId=123&token=xxx              │                              │
       │────────────────────────────────────▶│                              │
       │                                    │  Validate token (HMAC)       │
       │                                    │  Lookup song from DB         │
       │                                    │  Forward Range header        │
       │                                    │──────────────────────────────▶│
       │                                    │  GET /path/to/audio.mp3      │
       │                                    │  (with Range)                │
       │                                    │◀──────────────────────────────│
       │  HTTP 200/206 (partial content)    │                              │
       │◀────────────────────────────────────│                              │
```

## Components

### 1. Token Service (`lib/audio-stream.ts`)

Generates and validates HMAC-SHA256 signed tokens.

**Token payload:**
```typescript
interface StreamToken {
  songId: number
  tenantId: string
  exp: number        // expiry timestamp (ms)
  nonce: string      // 8-char random
}
```

**Token format:**
```
base64url(JSON.stringify(payload)) . HMAC-SHA256(payload, secret)
```

**Functions:**
- `generateStreamToken(songId, tenantId): string`
- `validateStreamToken(token): StreamToken | null`
- `buildStreamUrl(origin, songId, tenantId): string` — constructs full URL

**Configuration:**
- `STREAM_SIGNING_SECRET` env var (default: `'music-bar-stream-secret-local'` for dev)
- Token TTL: 5 minutes (`5 * 60 * 1000` ms)

### 2. Streaming Endpoint (`app/api/audio/stream/route.ts`)

```
GET /api/audio/stream?songId=123&token=xxx
```

**Request flow:**
1. Parse `songId` and `token` from query params
2. Validate token via `validateStreamToken()`
   - HMAC mismatch → 403
   - Expired token → 403
3. Look up song from DB:
   ```sql
   SELECT audio_url FROM songs WHERE id = ${songId}
   ```
4. If no `audio_url` or song not found → 404
5. Verify `token.songId === songId` from DB row → 403 on mismatch
6. Fetch from Cloudflare URL:
   - Forward `Range` header from client request
   - Set `User-Agent` to avoid bot detection
7. Return response with:
   - Same `Content-Type` as Cloudflare response (typically `audio/mpeg`)
   - Same `Content-Length` (for 200) or partial (for 206)
   - `Accept-Ranges: bytes`
   - `Cache-Control: public, max-age=300`
   - **No** `Content-Disposition` header (prevents "Save As" dialog)

**Edge cases:**
- Missing/invalid params → 400
- Token valid but song deleted → 404
- Cloudflare fetch fails → 502
- Cloudflare returns non-200 → forward the status

### 3. API Response Transform

Two routes return `audio_url` to clients. Both need a transform step.

**`app/api/playlists/[id]/songs/route.ts`** (GET):
```typescript
// After fetching songs from DB, before response:
const { origin } = new URL(request.url)
const songs = result.data.map(song => ({
  ...song,
  thumbnail: getProxiedUrl(song.thumbnail, origin),
  audio_url: song.audio_url
    ? buildStreamUrl(origin, song.id, ctx.tenant.id)
    : null,
}))
```

**`app/api/requests/route.ts`** (GET + POST response):
Same transform pattern as above. The `POST` creates a request and returns the new song — transform there too.

**`app/api/requests/route.ts`** (PATCH response):
Returns request data but does not include `audio_url` directly in the response — no transform needed.

### 4. Admin Display Impact

The admin view checks `song.audio_url` as a truthy flag to show Audio/YTB badges. After the transform:
- Songs with audio → `audio_url` is a stream URL (truthy) → shows Audio badge ✅
- Songs without audio → `audio_url` is null (falsy) → shows YT badge ✅

**No changes needed in `components/admin-view.tsx`.**

### 5. Mobile App Impact

The Android app reads `audio_url` from the playlist songs API and passes it to `MediaPlayer.setDataSource()`. After the transform:
- `audio_url` becomes `http://10.0.2.2:3000/api/audio/stream?songId=X&token=Y`
- Android `MediaPlayer` natively supports HTTP streaming with Range requests
- **No changes needed in `MainActivity.kt` or `BackgroundAudioService.kt`**

## Download Prevention

| Layer | What it prevents |
|-------|-----------------|
| Cloudflare URL never sent to client | DevTools inspection, curl |
| Short-lived token (5 min) | URL replay/sharing |
| Token bound to songId + tenantId | Reuse across songs/tenants |
| No `Content-Disposition` header | Browser "Save As" dialog |
| Rate limiting (optional) | Mass scraping |

## Security Considerations

- The `audio_url` in the database is still the raw Cloudflare URL — only the API response transforms it
- The stream secret should be a strong random value in production (set `STREAM_SIGNING_SECRET`)
- Token payload is signed, not encrypted — don't put sensitive data in it
- Consider rate limiting the stream endpoint per IP (e.g., 5 concurrent streams)

## Files Changed

### Created
- `lib/audio-stream.ts` — Token generation & validation helper
- `app/api/audio/stream/route.ts` — Streaming proxy endpoint

### Modified
- `app/api/playlists/[id]/songs/route.ts` — Add `audio_url` transform to GET handler
- `app/api/requests/route.ts` — Add `audio_url` transform to GET + POST handlers

### Unchanged (zero touch)
- `context/player-context.tsx`
- `components/persistent-player.tsx`
- `components/admin-view.tsx`
- `components/player-bottom-bar.tsx`
- `mobile/android/app/src/main/java/.../MainActivity.kt`
- `mobile/android/app/src/main/java/.../BackgroundAudioService.kt`
