'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    let pingInterval: ReturnType<typeof setInterval> | null = null

    const onUpdate = (registration: ServiceWorkerRegistration) => {
      const waitingServiceWorker = registration.waiting
      if (waitingServiceWorker) {
        toast.info('มีเวอร์ชันใหม่พร้อมใช้งาน!', {
          duration: Infinity,
          action: {
            label: 'อัปเดตเลย',
            onClick: () => {
              waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' })
              window.location.reload()
            },
          },
        })
      }
    }

    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        console.log('[MusicBar] SW registered:', registration.scope)

        // Check for updates every 15 minutes
        setInterval(() => registration.update(), 15 * 60 * 1000)

        // Handle update found
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                onUpdate(registration)
              }
            })
          }
        })

        // Check initial waiting state
        if (registration.waiting) {
          onUpdate(registration)
        }

        // Keep SW alive with periodic ping every 20s
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
      console.log('[MusicBar] SW controller changed')
    })

    return () => {
      if (pingInterval) clearInterval(pingInterval)
    }
  }, [])

  return null
}
