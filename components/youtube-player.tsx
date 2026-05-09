'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId: string
          playerVars?: Record<string, number | string>
          events?: {
            onReady?: (event: { target: YouTubePlayer }) => void
            onStateChange?: (event: { data: number; target: YouTubePlayer }) => void
            onError?: (event: { data: number }) => void
          }
        }
      ) => YouTubePlayer
      PlayerState: {
        ENDED: number
        PLAYING: number
        PAUSED: number
        BUFFERING: number
        CUED: number
      }
    }
    onYouTubeIframeAPIReady: () => void
  }
}

interface YouTubePlayer {
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  setVolume: (volume: number) => void
  getVolume: () => number
  getCurrentTime: () => number
  getDuration: () => number
  loadVideoById: (videoId: string) => void
  cueVideoById: (videoId: string) => void
  destroy: () => void
}

interface YouTubePlayerProps {
  videoId: string
  autoplay?: boolean
  onEnded?: () => void
  onReady?: () => void
  onPlay?: () => void
  onPause?: () => void
  onError?: () => void
}

export function YouTubePlayerComponent({
  videoId,
  autoplay = true,
  onEnded,
  onReady,
  onPlay,
  onPause,
  onError,
}: YouTubePlayerProps) {
  const playerRef = useRef<YouTubePlayer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isApiReady, setIsApiReady] = useState(false)
  const currentVideoRef = useRef(videoId)

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setIsApiReady(true)
      return
    }

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = () => {
      setIsApiReady(true)
    }

    return () => {
      window.onYouTubeIframeAPIReady = () => {}
    }
  }, [])

  // Initialize player
  useEffect(() => {
    if (!isApiReady || !videoId) return

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }

      playerRef.current = new window.YT.Player('youtube-player', {
        videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            event.target.setVolume(70)
            if (autoplay) {
              event.target.playVideo()
            }
            onReady?.()
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              onEnded?.()
            } else if (event.data === window.YT.PlayerState.PLAYING) {
              onPlay?.()
              // Update Media Session
              if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'playing'
              }
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              onPause?.()
              if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'paused'
              }
            }
          },
          onError: () => {
            onError?.()
          },
        },
      })
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initPlayer, 100)

    return () => {
      clearTimeout(timer)
    }
  }, [isApiReady, autoplay]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle video change
  useEffect(() => {
    if (playerRef.current && videoId && videoId !== currentVideoRef.current) {
      currentVideoRef.current = videoId
      playerRef.current.loadVideoById(videoId)
    }
  }, [videoId])

  const play = useCallback(() => {
    playerRef.current?.playVideo()
  }, [])

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo()
  }, [])

  const setVolume = useCallback((volume: number) => {
    playerRef.current?.setVolume(volume)
  }, [])

  // Expose methods via ref
  useEffect(() => {
    if (containerRef.current) {
      (containerRef.current as HTMLDivElement & { playerMethods?: { play: () => void; pause: () => void; setVolume: (v: number) => void } }).playerMethods = { play, pause, setVolume }
    }
  }, [play, pause, setVolume])

  return (
    <div ref={containerRef} className="youtube-player-container rounded-xl overflow-hidden">
      <div id="youtube-player" />
    </div>
  )
}
