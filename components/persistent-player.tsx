'use client'

import { useEffect, useRef, useCallback } from 'react'
import { usePlayer, YouTubePlayerMethods } from '@/context/player-context'

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId: string
          playerVars?: Record<string, number | string>
          events?: {
            onReady?: (event: { target: YTPlayer }) => void
            onStateChange?: (event: { data: number; target: YTPlayer }) => void
            onError?: (event: { data: number }) => void
          }
        }
      ) => YTPlayer
      PlayerState: { ENDED: number; PLAYING: number; PAUSED: number; BUFFERING: number; CUED: number }
    }
    onYouTubeIframeAPIReady: () => void
    _ytApiLoaded: boolean
  }
}

interface YTPlayer {
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  setVolume: (v: number) => void
  getVolume: () => number
  getCurrentTime: () => number
  loadVideoById: (args: string | { videoId: string, startSeconds?: number }) => void
  destroy: () => void
}

/**
 * Persistent YouTube player yang hidup di root layout.
 * Tidak pernah unmount saat pindah halaman,
 * sehingga musik terus bermain di background.
 */
export function PersistentYouTubePlayer() {
  const { currentSong, handleSongEnd, setIsPlaying, playerRef, volume } = usePlayer()
  const ytPlayerRef = useRef<YTPlayer | null>(null)
  const isApiReadyRef = useRef(false)
  const currentVideoRef = useRef<string>('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Expose methods to context
  const exposeMethods = useCallback(() => {
    const methods: YouTubePlayerMethods = {
      play: () => ytPlayerRef.current?.playVideo(),
      pause: () => ytPlayerRef.current?.pauseVideo(),
      setVolume: (v: number) => ytPlayerRef.current?.setVolume(v),
      loadVideo: (id: string) => ytPlayerRef.current?.loadVideoById(id),
    }
    playerRef.current = methods
  }, [playerRef])

  const initPlayer = useCallback((videoId: string) => {
    if (!isApiReadyRef.current || !videoId) return

    if (ytPlayerRef.current) {
      ytPlayerRef.current.destroy()
      ytPlayerRef.current = null
    }

    // Recreate div (YT Player replaces it)
    if (containerRef.current) {
      const div = document.createElement('div')
      div.id = 'yt-persistent-player'
      containerRef.current.innerHTML = ''
      containerRef.current.appendChild(div)
    }

    let startSeconds = 0
    try {
      const saved = localStorage.getItem('music_bar_seek_time')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.videoId === videoId) startSeconds = Math.floor(parsed.time)
      }
    } catch {}

    ytPlayerRef.current = new window.YT.Player('yt-persistent-player', {
      videoId,
      playerVars: {
        autoplay: 1,
        start: startSeconds > 0 ? startSeconds : 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        enablejsapi: 1,
        origin: window.location.origin,
        // Allow background play on iOS
        fs: 0,
      },
      events: {
        onReady: (event) => {
          event.target.setVolume(volume)
          event.target.playVideo()
          setIsPlaying(true)
          exposeMethods()
        },
        onStateChange: (event) => {
          const state = window.YT.PlayerState
          if (event.data === state.ENDED) {
            handleSongEnd()
          } else if (event.data === state.PLAYING) {
            setIsPlaying(true)
            if ('mediaSession' in navigator) {
              navigator.mediaSession.playbackState = 'playing'
            }
          } else if (event.data === state.PAUSED) {
            setIsPlaying(false)
            if ('mediaSession' in navigator) {
              navigator.mediaSession.playbackState = 'paused'
            }
          }
        },
        onError: () => {
          // Skip on error
          setTimeout(() => handleSongEnd(), 1000)
        },
      },
    })
    currentVideoRef.current = videoId
  }, [handleSongEnd, setIsPlaying, exposeMethods, volume])

  // Load YouTube IFrame API once
  useEffect(() => {
    if (window._ytApiLoaded) {
      if (window.YT?.Player) {
        isApiReadyRef.current = true
        if (currentSong?.youtube_id) initPlayer(currentSong.youtube_id)
      }
      return
    }

    window._ytApiLoaded = true
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)

    window.onYouTubeIframeAPIReady = () => {
      isApiReadyRef.current = true
      if (currentSong?.youtube_id) initPlayer(currentSong.youtube_id)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Switch video when currentSong changes
  useEffect(() => {
    if (!currentSong?.youtube_id) return
    if (!isApiReadyRef.current) return

    if (currentSong.youtube_id !== currentVideoRef.current) {
      if (ytPlayerRef.current) {
        let startSeconds = 0
        try {
          const saved = localStorage.getItem('music_bar_seek_time')
          if (saved) {
            const parsed = JSON.parse(saved)
            if (parsed.videoId === currentSong.youtube_id) startSeconds = Math.floor(parsed.time)
          }
        } catch {}
        
        ytPlayerRef.current.loadVideoById({
          videoId: currentSong.youtube_id,
          startSeconds: startSeconds > 0 ? startSeconds : undefined
        })
        currentVideoRef.current = currentSong.youtube_id
        exposeMethods()
      } else {
        initPlayer(currentSong.youtube_id)
      }
    }
  }, [currentSong?.youtube_id, initPlayer, exposeMethods])

  // Track playback progress
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentVideoRef.current && ytPlayerRef.current) {
        const time = ytPlayerRef.current.getCurrentTime?.()
        if (time && time > 0) {
          localStorage.setItem('music_bar_seek_time', JSON.stringify({
            videoId: currentVideoRef.current,
            time
          }))
        }
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Hidden player — อยู่นอกจอ ไม่ทำลาย layout
  // YouTube ต้องการ DOM element จริงถึงจะเล่นได้
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'none',
        // ต้องอยู่ใน viewport หรือบางส่วน ไม่งั้น browser อาจ throttle
        bottom: 0,
        right: 0,
        zIndex: -1,
      }}
    >
      <div ref={containerRef}>
        <div id="yt-persistent-player" />
      </div>
    </div>
  )
}
