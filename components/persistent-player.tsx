'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { usePlayer, YouTubePlayerMethods } from '@/context/player-context'

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          width?: string | number
          height?: string | number
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
  getDuration: () => number
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  loadVideoById: (args: string | { videoId: string, startSeconds?: number }) => void
  destroy: () => void
}

/**
 * Persistent YouTube player yang hidup di root layout.
 * Tidak pernah unmount saat pindah halaman,
 * sehingga musik terus bermain di background.
 */
export function PersistentYouTubePlayer() {
  const { 
    currentSong, handleSongEnd, setIsPlaying, playerRef, volume, 
    isVideoMode, isAutoPlayEnabled, setCurrentTime, setDuration, isFullscreen 
  } = usePlayer()
  const ytPlayerRef = useRef<YTPlayer | null>(null)
  const isApiReadyRef = useRef(false)
  const currentVideoRef = useRef<string>('')
  const containerRef = useRef<HTMLDivElement>(null)
  const [videoRect, setVideoRect] = useState<DOMRect | null>(null)

  // Track video container rect for Video Mode
  useEffect(() => {
    if (!isVideoMode) return
    const updateRect = () => {
      const el = document.getElementById('video-target-rect')
      if (el) setVideoRect(el.getBoundingClientRect())
    }
    
    updateRect()
    const observer = new ResizeObserver(updateRect)
    const el = document.getElementById('video-target-rect')
    if (el) observer.observe(el)
    window.addEventListener('resize', updateRect)
    
    // Interval for safety if layout shifts due to images loading
    const interval = setInterval(updateRect, 1000)
    
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateRect)
      clearInterval(interval)
    }
  }, [isVideoMode, currentSong])

  // Expose methods to context
  const exposeMethods = useCallback(() => {
    const methods: YouTubePlayerMethods = {
      play: () => ytPlayerRef.current?.playVideo(),
      pause: () => ytPlayerRef.current?.pauseVideo(),
      setVolume: (v: number) => ytPlayerRef.current?.setVolume(v),
      loadVideo: (id: string) => ytPlayerRef.current?.loadVideoById(id),
      seekTo: (seconds: number) => ytPlayerRef.current?.seekTo(seconds, true),
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
      width: '100%',
      height: '100%',
      videoId,
      playerVars: {
        autoplay: isAutoPlayEnabled ? 1 : 0,
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
          if (isAutoPlayEnabled) {
            event.target.playVideo()
            setIsPlaying(true)
          } else {
            setIsPlaying(false)
          }
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
  }, [handleSongEnd, setIsPlaying, exposeMethods, volume, isAutoPlayEnabled])

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
        
        // Set volume and play
        ytPlayerRef.current.setVolume(volume)
        ytPlayerRef.current.loadVideoById({
          videoId: currentSong.youtube_id,
          startSeconds: startSeconds > 0 ? startSeconds : undefined
        })
        ytPlayerRef.current.playVideo()
        currentVideoRef.current = currentSong.youtube_id

        exposeMethods()
      } else {
        initPlayer(currentSong.youtube_id)
      }
    }
  }, [currentSong?.youtube_id, initPlayer, exposeMethods])

  // Track playback progress & update context
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentVideoRef.current && ytPlayerRef.current) {
        const time = ytPlayerRef.current.getCurrentTime?.() || 0
        const duration = ytPlayerRef.current.getDuration?.() || 0
        
        setCurrentTime(time)
        setDuration(duration)

        // Save seek time
        if (time > 0) {
          localStorage.setItem('music_bar_seek_time', JSON.stringify({
            videoId: currentVideoRef.current,
            time
          }))
        }
      }
    }, 500)
    return () => clearInterval(interval)
  }, [setCurrentTime, setDuration])

  // Hidden player — อยู่นอกจอ ไม่ทำลาย layout
  // YouTube ต้องการ DOM element จริงถึงจะเล่นได้
  return (
    <div
      aria-hidden={!isVideoMode}
      style={
        isVideoMode && videoRect
          ? {
              position: 'fixed',
              top: videoRect.top,
              left: videoRect.left,
              width: videoRect.width,
              height: videoRect.height,
              zIndex: (isFullscreen && isVideoMode) ? 65 : 5,
              opacity: 1,
              pointerEvents: 'auto',
              borderRadius: (isFullscreen && isVideoMode) ? '0' : (window.innerWidth >= 640 ? '2rem' : '1rem'),
              overflow: 'hidden'
            }
          : {
              position: 'fixed',
              width: '1px',
              height: '1px',
              opacity: 0,
              pointerEvents: 'none',
              bottom: 0,
              right: 0,
              zIndex: -1,
            }
      }
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
        <div id="yt-persistent-player" style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  )
}
