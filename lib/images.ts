/**
 * Helper to transform external image/thumbnail URLs into proxied URLs.
 * If the URL belongs to a YouTube thumbnail or other allowed domains,
 * it will be routed through the server's Redis-backed image proxy.
 */
export function getProxiedUrl(url: string | null | undefined, origin: string): string {
  if (!url) return ''

  // If it's already a proxied URL, return it as-is
  if (url.startsWith('/api/images/proxy') || (url.startsWith('http') && url.includes('/api/images/proxy'))) {
    return url
  }

  // Match standard YouTube thumbnail URLs
  // e.g., https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg or img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg
  const ytMatch = url.match(/(?:https?:)?\/\/(?:i|img)\.ytimg\.com\/vi\/([a-zA-Z0-9_-]{11})\/([a-zA-Z0-9_.-]+)/)
  if (ytMatch) {
    const youtubeId = ytMatch[1]
    const file = ytMatch[2] || 'mqdefault.jpg'
    return `${origin}/api/images/proxy?youtubeId=${youtubeId}&file=${file}`
  }

  // Handle general absolute URLs (CORS/performance fallback)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Only proxy images from allowed domains to prevent SSRF
    const allowedDomains = ['ytimg.com', 'youtube.com', 'googleusercontent.com']
    try {
      const parsedUrl = new URL(url)
      const hostname = parsedUrl.hostname.toLowerCase()
      const isAllowed = allowedDomains.some(domain => 
        hostname === domain || hostname.endsWith('.' + domain)
      )
      if (isAllowed) {
        return `${origin}/api/images/proxy?url=${encodeURIComponent(url)}`
      }
    } catch {
      // Return original URL if parsing fails
    }
  }

  return url
}
