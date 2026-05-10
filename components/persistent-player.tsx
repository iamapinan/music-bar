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
  const activeIndexRef = useRef(0)
  const playersRef = useRef<Record<number, YTPlayer | null>>({ 0: null, 1: null })
  const isApiReadyRef = useRef(false)
  const lastLoadedVideoIds = useRef<Record<number, string>>({ 0: '', 1: '' })
  const [videoRect, setVideoRect] = useState<DOMRect | null>(null)

  const handleSongEndRef = useRef(handleSongEnd)
  const volumeRef = useRef(volume)

  useEffect(() => { handleSongEndRef.current = handleSongEnd }, [handleSongEnd])
  useEffect(() => { volumeRef.current = volume }, [volume])
  
  // Sync ref with state
  useEffect(() => {
    activeIndexRef.current = activeIndex
  }, [activeIndex])

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
    const methods: YouTubePlayerMethods = {
      play: () => playersRef.current[activeIndexRef.current]?.playVideo(),
      pause: () => playersRef.current[activeIndexRef.current]?.pauseVideo(),
      setVolume: (v: number) => {
        playersRef.current[0]?.setVolume(v)
        playersRef.current[1]?.setVolume(v)
      },
      loadVideo: (id: string) => playersRef.current[activeIndexRef.current]?.loadVideoById(id),
      seekTo: (seconds: number) => playersRef.current[activeIndexRef.current]?.seekTo(seconds, true),
    }
    playerRef.current = methods
  }, [playerRef])

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
        autoplay: index === activeIndexRef.current ? 1 : 0,
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
          if (index === activeIndexRef.current && videoId) {
            event.target.playVideo()
            setIsPlaying(true)
          }
          exposeMethods()
        },
        onStateChange: (event) => {
          const state = window.YT.PlayerState
          if (index === activeIndexRef.current) {
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
          if (index === activeIndexRef.current) {
            setTimeout(() => handleSongEndRef.current(), 1000)
          }
        },
      },
    })
    lastLoadedVideoIds.current[index] = videoId
  }, [setIsPlaying, exposeMethods])

  // Load YouTube IFrame API once
  useEffect(() => {
    if (window._ytApiLoaded) {
      if (window.YT?.Player) {
        isApiReadyRef.current = true
        if (currentSong?.youtube_id) createPlayer(0, currentSong.youtube_id)
        createPlayer(1, '')
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

  // Combined Sync and Swap Effect
  useEffect(() => {
    if (!currentSong?.youtube_id || !isApiReadyRef.current) return
    
    const curIndex = activeIndex
    const nextIndex = 1 - curIndex
    const songId = currentSong.youtube_id
    
    // Check if the song is already loaded/cued in either player
    if (lastLoadedVideoIds.current[curIndex] === songId) {
      // Already active, ensure it's playing if needed
      // (Sometimes it might be paused or newly loaded)
      return 
    }
    
    if (lastLoadedVideoIds.current[nextIndex] === songId) {
      // It's in the other player! Swap.
      setActiveIndex(nextIndex)
      playersRef.current[nextIndex]?.playVideo()
      setIsPlaying(true)
      // Stop the old player
      playersRef.current[curIndex]?.pauseVideo()
    } else {
      // Not in either player, load it into the active one
      const activePlayer = playersRef.current[curIndex]
      if (activePlayer) {
        activePlayer.loadVideoById(songId)
        lastLoadedVideoIds.current[curIndex] = songId
        setIsPlaying(true)
      } else {
        createPlayer(curIndex, songId)
      }
    }
  }, [currentSong?.youtube_id, activeIndex, createPlayer, setIsPlaying])

  // Preload Next Song in Inactive Player
  useEffect(() => {
    const inactiveIndex = 1 - activeIndex
    if (!nextSong?.youtube_id || !isApiReadyRef.current) return
    
    // Don't preload if the inactive player already has this song
    if (lastLoadedVideoIds.current[inactiveIndex] === nextSong.youtube_id) return
    
    const inactivePlayer = playersRef.current[inactiveIndex]
    if (inactivePlayer) {
      inactivePlayer.cueVideoById(nextSong.youtube_id)
      lastLoadedVideoIds.current[inactiveIndex] = nextSong.youtube_id
    } else {
      createPlayer(inactiveIndex, nextSong.youtube_id)
    }
  }, [nextSong?.youtube_id, activeIndex, createPlayer])

  // Track playback progress
  useEffect(() => {
    const interval = setInterval(() => {
      const activePlayer = playersRef.current[activeIndexRef.current]
      if (activePlayer) {
        const time = activePlayer.getCurrentTime?.() || 0
        const dur = activePlayer.getDuration?.() || 0
        setCurrentTime(time)
        setDuration(dur)
      }
    }, 500)
    return () => clearInterval(interval)
  }, [setCurrentTime, setDuration])

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
