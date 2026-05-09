'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    let pingInterval: ReturnType<typeof setInterval> | null = null

    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        console.log('[MusicBar] SW registered:', registration.scope)

        // Check for updates every 30 minutes
        setInterval(() => registration.update(), 30 * 60 * 1000)

        // Keep SW alive with periodic ping every 20s
        // This prevents the SW from going inactive while music plays
        pingInterval = setInterval(() => {
          if (registration.active) {
            const channel = new MessageChannel()
            registration.active.postMessage({ type: 'PING' }, [channel.port2])
          }
        }, 20000)
      })
      .catch((err) => {
        console.error('[MusicBar] SW registration failed:', err)
      })

    // Handle SW updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[MusicBar] SW updated, reloading...')
      // Don't auto-reload — music might be playing
    })

    return () => {
      if (pingInterval) clearInterval(pingInterval)
    }
  }, [])

  return null
}
