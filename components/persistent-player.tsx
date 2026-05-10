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
  cueVideoById: (args: string | { videoId: string, startSeconds?: number }) => void
  destroy: () => void
}

export function PersistentYouTubePlayer() {
  const { 
    currentSong, nextSong, handleSongEnd, setIsPlaying, playerRef, volume, 
    isVideoMode, isAutoPlayEnabled, setCurrentTime, setDuration, isFullscreen,
    playMode, currentIndex
  } = usePlayer()

  const [activeIndex, setActiveIndex] = useState(0)
  const playersRef = useRef<Record<number, YTPlayer | null>>({ 0: null, 1: null })
  const isApiReadyRef = useRef(false)
  const lastLoadedVideoIds = useRef<Record<number, string>>({ 0: '', 1: '' })
  const [videoRect, setVideoRect] = useState<DOMRect | null>(null)

  const handleSongEndRef = useRef(handleSongEnd)
  const volumeRef = useRef(volume)

  useEffect(() => { handleSongEndRef.current = handleSongEnd }, [handleSongEnd])
  useEffect(() => { volumeRef.current = volume }, [volume])

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
    const interval = setInterval(updateRect, 1000)
    
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateRect)
      clearInterval(interval)
    }
  }, [isVideoMode, currentSong])

  // Expose methods to context
  const exposeMethods = useCallback(() => {
    const activePlayer = playersRef.current[activeIndex]
    const methods: YouTubePlayerMethods = {
      play: () => playersRef.current[activeIndex]?.playVideo(),
      pause: () => playersRef.current[activeIndex]?.pauseVideo(),
      setVolume: (v: number) => {
        playersRef.current[0]?.setVolume(v)
        playersRef.current[1]?.setVolume(v)
      },
      loadVideo: (id: string) => playersRef.current[activeIndex]?.loadVideoById(id),
      seekTo: (seconds: number) => playersRef.current[activeIndex]?.seekTo(seconds, true),
    }
    playerRef.current = methods
  }, [activeIndex, playerRef])

  useEffect(() => {
    exposeMethods()
  }, [activeIndex, exposeMethods])

  const createPlayer = useCallback((index: number, videoId: string) => {
    if (!isApiReadyRef.current) return

    if (playersRef.current[index]) {
      playersRef.current[index]?.destroy()
      playersRef.current[index] = null
    }

    const containerId = `yt-player-${index}`
    const container = document.getElementById(`${containerId}-container`)
    if (container) {
      container.innerHTML = `<div id="${containerId}"></div>`
    }

    playersRef.current[index] = new window.YT.Player(containerId, {
      width: '100%',
      height: '100%',
      videoId: videoId || '',
      playerVars: {
        autoplay: index === activeIndex ? 1 : 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        iv_load_policy: 3,
        fs: 0,
        playsinline: 1,
        enablejsapi: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: (event) => {
          event.target.setVolume(volumeRef.current)
          if (index === activeIndex && videoId) {
            event.target.playVideo()
            setIsPlaying(true)
          }
          exposeMethods()
        },
        onStateChange: (event) => {
          const state = window.YT.PlayerState
          if (index === activeIndex) {
            if (event.data === state.ENDED) {
              handleSongEndRef.current()
            } else if (event.data === state.PLAYING) {
              setIsPlaying(true)
              if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing'
            } else if (event.data === state.PAUSED) {
              setIsPlaying(false)
              if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused'
            }
          }
        },
        onError: () => {
          if (index === activeIndex) {
            setTimeout(() => handleSongEndRef.current(), 1000)
          }
        },
      },
    })
    lastLoadedVideoIds.current[index] = videoId
  }, [activeIndex, setIsPlaying, exposeMethods])

  // Load YouTube IFrame API once
  useEffect(() => {
    if (window._ytApiLoaded) {
      if (window.YT?.Player) {
        isApiReadyRef.current = true
        if (currentSong?.youtube_id) createPlayer(0, currentSong.youtube_id)
        createPlayer(1, '') // Empty second player
      }
      return
    }

    window._ytApiLoaded = true
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)

    window.onYouTubeIframeAPIReady = () => {
      isApiReadyRef.current = true
      if (currentSong?.youtube_id) createPlayer(0, currentSong.youtube_id)
      createPlayer(1, '')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync Active Player with currentSong
  useEffect(() => {
    if (!currentSong?.youtube_id || !isApiReadyRef.current) return
    
    const activePlayer = playersRef.current[activeIndex]
    if (activePlayer && lastLoadedVideoIds.current[activeIndex] !== currentSong.youtube_id) {
      activePlayer.loadVideoById(currentSong.youtube_id)
      lastLoadedVideoIds.current[activeIndex] = currentSong.youtube_id
      setIsPlaying(true)
    } else if (!activePlayer) {
      createPlayer(activeIndex, currentSong.youtube_id)
    }
  }, [currentSong?.youtube_id, activeIndex, createPlayer, setIsPlaying])

  // Preload Next Song in Inactive Player
  useEffect(() => {
    const inactiveIndex = 1 - activeIndex
    if (!nextSong?.youtube_id || !isApiReadyRef.current) return
    
    const inactivePlayer = playersRef.current[inactiveIndex]
    if (inactivePlayer && lastLoadedVideoIds.current[inactiveIndex] !== nextSong.youtube_id) {
      inactivePlayer.cueVideoById(nextSong.youtube_id)
      lastLoadedVideoIds.current[inactiveIndex] = nextSong.youtube_id
    } else if (!inactivePlayer) {
      createPlayer(inactiveIndex, nextSong.youtube_id)
    }
  }, [nextSong?.youtube_id, activeIndex, createPlayer])

  // Swap logic when handleSongEnd is called
  // We detect if currentSong changed and if it matches what we preloaded
  useEffect(() => {
    if (!currentSong?.youtube_id) return
    
    const inactiveIndex = 1 - activeIndex
    if (lastLoadedVideoIds.current[inactiveIndex] === currentSong.youtube_id) {
      // The song we preloaded is now the current song!
      setActiveIndex(inactiveIndex)
      playersRef.current[inactiveIndex]?.playVideo()
      setIsPlaying(true)
    }
  }, [currentSong?.youtube_id]) // Only depends on song change

  // Track playback progress
  useEffect(() => {
    const interval = setInterval(() => {
      const activePlayer = playersRef.current[activeIndex]
      if (activePlayer) {
        const time = activePlayer.getCurrentTime?.() || 0
        const dur = activePlayer.getDuration?.() || 0
        setCurrentTime(time)
        setDuration(dur)
      }
    }, 500)
    return () => clearInterval(interval)
  }, [activeIndex, setCurrentTime, setDuration])

  const getPlayerStyle = (index: number) => {
    const isActive = index === activeIndex
    if (isVideoMode && videoRect) {
      return {
        position: 'fixed' as const,
        top: (isFullscreen && isVideoMode) ? 0 : videoRect.top,
        left: (isFullscreen && isVideoMode) ? 0 : videoRect.left,
        width: (isFullscreen && isVideoMode) ? '100vw' : videoRect.width,
        height: (isFullscreen && isVideoMode) ? '100dvh' : videoRect.height,
        zIndex: isActive ? 65 : 60,
        opacity: isActive ? 1 : 0,
        pointerEvents: isActive ? 'auto' as const : 'none' as const,
        borderRadius: (isFullscreen && isVideoMode) ? '0' : (window.innerWidth >= 640 ? '2rem' : '1rem'),
        overflow: 'hidden',
        transition: 'opacity 0.3s ease-in-out'
      }
    }
    return {
      position: 'fixed' as const,
      width: '1px',
      height: '1px',
      opacity: 0,
      pointerEvents: 'none' as const,
      bottom: 0,
      right: 0,
      zIndex: isActive ? -1 : -2,
    }
  }

  return (
    <>
      <div style={getPlayerStyle(0)}>
        <div id="yt-player-0-container" style={{ width: '100%', height: '100%' }}>
          <div id="yt-player-0" />
        </div>
      </div>
      <div style={getPlayerStyle(1)}>
        <div id="yt-player-1-container" style={{ width: '100%', height: '100%' }}>
          <div id="yt-player-1" />
        </div>
      </div>
    </>
  )
}
