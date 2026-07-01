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

export function PersistentYouTubePlayer() {
  const { 
    isPlaying, currentSong, nextSong, handleSongEnd, setIsPlaying, playerRef, volume, 
    isVideoMode, setCurrentTime, setDuration, isFullscreen,
    playMode, currentIndex, audioRef
  } = usePlayer()
  const CROSSFADE_SECONDS = 5

  const isPlayingRef = useRef(isPlaying)
  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])

  const audioPlaybackRef = useRef<{ currentTime: number; duration: number }>({ currentTime: 0, duration: 0 })

  const ytPlayerRefs = useRef<[YTPlayer | null, YTPlayer | null]>([null, null])
  const activeSlotRef = useRef<0 | 1>(0)
  const preloadedSlotRef = useRef<0 | 1 | null>(null)
  const crossfadeTimerRef = useRef<number | null>(null)
  const isCrossfadingRef = useRef(false)
  const expectedVideoRef = useRef('')
  const isApiReadyRef = useRef(false)
  const isPlayerReadyRef = useRef(false)
  const currentVideoRef = useRef<string>('')
  const containerRef = useRef<HTMLDivElement>(null)
  const slot0Ref = useRef<HTMLDivElement>(null)
  const slot1Ref = useRef<HTMLDivElement>(null)
  const slotRefs = [slot0Ref, slot1Ref] as const
  const lastPlayedKeyRef = useRef<string>('')
  const [videoRect, setVideoRect] = useState<DOMRect | null>(null)

  const handleSongEndRef = useRef(handleSongEnd)
  const volumeRef = useRef(volume)

  useEffect(() => { handleSongEndRef.current = handleSongEnd }, [handleSongEnd])
  useEffect(() => { volumeRef.current = volume }, [volume])

  // --- Audio URL playback helpers ---
  const isAudioModeRef = useRef(false)

  // Sync isAudioModeRef based on whether audioRef has an active src
  useEffect(() => {
    isAudioModeRef.current = !!(audioRef.current && audioRef.current.src && audioRef.current.src !== '')
  }, [currentSong?.audio_url, currentSong?.youtube_id, audioRef])

  const setupAudioEvents = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    isAudioModeRef.current = true

    audio.onended = () => {
      audioPlaybackRef.current = { currentTime: 0, duration: 0 }
      handleSongEndRef.current()
    }
    audio.ontimeupdate = () => {
      if (audioRef.current) {
        audioPlaybackRef.current = {
          currentTime: audioRef.current.currentTime || 0,
          duration: audioRef.current.duration || 0,
        }
      }
    }
    audio.onerror = () => {
        const err = audioRef.current?.error
        console.warn('Audio playback error:', {
            code: err?.code,
            message: err?.message,
            src: audioRef.current?.src?.slice(0, 80),
            networkState: audioRef.current?.networkState,
            readyState: audioRef.current?.readyState,
        })
        isAudioModeRef.current = false
    }
  }, [audioRef])

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current.load()
    }
    isAudioModeRef.current = false
    audioPlaybackRef.current = { currentTime: 0, duration: 0 }
  }, [audioRef])

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
    const getActivePlayer = () => ytPlayerRefs.current[activeSlotRef.current]
    const methods: YouTubePlayerMethods = {
      play: () => {
        if (isAudioModeRef.current && audioRef.current) {
          audioRef.current.play().catch(() => {})
        } else {
          const player = getActivePlayer()
          if (player && isPlayerReadyRef.current && typeof player.playVideo === 'function') {
            player.playVideo()
          }
        }
      },
      pause: () => {
        if (isAudioModeRef.current && audioRef.current) {
          audioRef.current.pause()
        } else {
          ytPlayerRefs.current.forEach((player) => {
            if (player && typeof player.pauseVideo === 'function') player.pauseVideo()
          })
          if (crossfadeTimerRef.current) {
            window.clearInterval(crossfadeTimerRef.current)
            crossfadeTimerRef.current = null
            isCrossfadingRef.current = false
          }
        }
      },
      setVolume: (v: number) => {
        if (isAudioModeRef.current && audioRef.current) {
          audioRef.current.volume = v / 100
        } else {
          const player = getActivePlayer()
          if (player && isPlayerReadyRef.current && typeof player.setVolume === 'function') {
            player.setVolume(v)
          }
        }
      },
      loadVideo: (id: string) => {
        if (!isAudioModeRef.current) {
          const player = getActivePlayer()
          if (player && isPlayerReadyRef.current && typeof player.loadVideoById === 'function') {
            player.loadVideoById(id)
          }
        }
      },
      seekTo: (seconds: number) => {
        if (isAudioModeRef.current && audioRef.current) {
          audioRef.current.currentTime = seconds
        } else {
          const player = getActivePlayer()
          if (player && isPlayerReadyRef.current && typeof player.seekTo === 'function') {
            player.seekTo(seconds, true)
          }
        }
      },
    }
    playerRef.current = methods
  }, [playerRef])

  const setSlotVisibility = useCallback((slot: 0 | 1) => {
    slotRefs.forEach((ref, index) => {
      if (!ref.current) return
      const isActive = index === slot
      ref.current.style.opacity = isActive ? '1' : '0'
      ref.current.style.pointerEvents = isActive && isVideoMode ? 'auto' : 'none'
      ref.current.style.zIndex = isActive ? '2' : '1'
    })
  }, [isVideoMode, slotRefs])

  const destroySlot = useCallback((slot: 0 | 1) => {
    const player = ytPlayerRefs.current[slot]
    if (player) {
      try { player.destroy() } catch {}
      ytPlayerRefs.current[slot] = null
    }
    if (slotRefs[slot].current) {
      slotRefs[slot].current.innerHTML = ''
    }
  }, [slotRefs])

  const initPlayer = useCallback((videoId: string, slot: 0 | 1 = activeSlotRef.current) => {
    if (!isApiReadyRef.current || !videoId) return

    destroySlot(slot)
    isPlayerReadyRef.current = false

    if (slotRefs[slot].current) {
      const div = document.createElement('div')
      div.id = `yt-persistent-player-${slot}`
      slotRefs[slot].current.innerHTML = ''
      slotRefs[slot].current.appendChild(div)
    }

    ytPlayerRefs.current[slot] = new window.YT.Player(`yt-persistent-player-${slot}`, {
      width: '100%',
      height: '100%',
      videoId,
      playerVars: {
        autoplay: slot === activeSlotRef.current ? 1 : 0,
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
          isPlayerReadyRef.current = true
          if (typeof event.target.setVolume === 'function') {
            event.target.setVolume(slot === activeSlotRef.current ? volumeRef.current : 0)
          }
          if (slot === activeSlotRef.current && typeof event.target.playVideo === 'function') {
            event.target.playVideo()
          }
          if (slot === activeSlotRef.current) setIsPlaying(true)
          exposeMethods()
        },
        onStateChange: (event) => {
          const state = window.YT.PlayerState
          if (slot !== activeSlotRef.current) return
          if (event.data === state.ENDED) {
            handleSongEndRef.current()
          } else if (event.data === state.PLAYING) {
            setIsPlaying(true)
            if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing'
          } else if (event.data === state.PAUSED) {
            if (document.visibilityState === 'hidden' && isPlayingRef.current) {
              // Automatically paused by browser in background, but the app intends to keep playing.
              // Attempt to resume playback after a short delay.
              const activePlayer = ytPlayerRefs.current[activeSlotRef.current]
              if (activePlayer && typeof activePlayer.playVideo === 'function') {
                setTimeout(() => {
                  const latestActivePlayer = ytPlayerRefs.current[activeSlotRef.current]
                  if (latestActivePlayer && typeof latestActivePlayer.playVideo === 'function' && isPlayingRef.current) {
                    latestActivePlayer.playVideo()
                  }
                }, 200)
              }
              if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing'
            } else {
              setIsPlaying(false)
              if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused'
            }
          } else if (event.data === state.CUED) {
            // Autoplay blocked by browser or cued by loader
            setIsPlaying(false)
            if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused'
          }
        },
        onError: () => {
          setTimeout(() => handleSongEndRef.current(), 1000)
        },
      },
    })
    if (slot === activeSlotRef.current) {
      currentVideoRef.current = videoId
      expectedVideoRef.current = videoId
      setSlotVisibility(slot)
    }
  }, [destroySlot, exposeMethods, setIsPlaying, setSlotVisibility, slotRefs])

  const preloadNext = useCallback((videoId?: string) => {
    if (isAudioModeRef.current) return
    if (!videoId || !isApiReadyRef.current || videoId === currentVideoRef.current) return
    const standbySlot = activeSlotRef.current === 0 ? 1 : 0
    if (preloadedSlotRef.current === standbySlot && expectedVideoRef.current === videoId) return
    preloadedSlotRef.current = standbySlot
    expectedVideoRef.current = videoId
    initPlayer(videoId, standbySlot)
  }, [initPlayer])

  const startCrossfade = useCallback((videoId?: string) => {
    if (isAudioModeRef.current) return
    if (!videoId || isCrossfadingRef.current || !isPlayingRef.current) return
    const nextSlot = preloadedSlotRef.current ?? (activeSlotRef.current === 0 ? 1 : 0)
    const currentSlot = activeSlotRef.current
    const currentPlayer = ytPlayerRefs.current[currentSlot]
    let nextPlayer = ytPlayerRefs.current[nextSlot]

    if (!nextPlayer || expectedVideoRef.current !== videoId) {
      initPlayer(videoId, nextSlot)
      nextPlayer = ytPlayerRefs.current[nextSlot]
    }
    if (!currentPlayer || !nextPlayer) return

    isCrossfadingRef.current = true
    nextPlayer.setVolume(0)
    nextPlayer.playVideo()

    const startedAt = Date.now()
    crossfadeTimerRef.current = window.setInterval(() => {
      const progress = Math.min(1, (Date.now() - startedAt) / (CROSSFADE_SECONDS * 1000))
      const targetVolume = volumeRef.current
      currentPlayer.setVolume(Math.round(targetVolume * (1 - progress)))
      nextPlayer?.setVolume(Math.round(targetVolume * progress))

      if (progress >= 1) {
        if (crossfadeTimerRef.current) window.clearInterval(crossfadeTimerRef.current)
        crossfadeTimerRef.current = null
        try { currentPlayer.stopVideo() } catch {}
        activeSlotRef.current = nextSlot
        preloadedSlotRef.current = null
        currentVideoRef.current = videoId
        isCrossfadingRef.current = false
        setSlotVisibility(nextSlot)
        handleSongEndRef.current()
      }
    }, 120)
  }, [initPlayer, setSlotVisibility])

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
    if (!currentSong) return

	    // Prefer audio_url over YouTube if available
	    if (currentSong.audio_url && currentSong.audio_url.trim() !== '') {
	      const songKey = `${playMode}-${currentIndex}-${currentSong.youtube_id}-${(currentSong as any)?.id}`
	      if (songKey === lastPlayedKeyRef.current) return
	      lastPlayedKeyRef.current = songKey
	
	      // Audio is created and started by playSongImmediately (for autoplay).
	      // If we're here from next/prev (not from a click), the audio hasn't
	      // been started yet — start it now.
	      if (!audioRef.current?.src) {
	        try {
	          const audio = new Audio(currentSong.audio_url)
	          audio.volume = volumeRef.current / 100
	          audio.play().catch(() => {})
	          audioRef.current = audio
	          isAudioModeRef.current = true
	        } catch {}
	      } else {
	        isAudioModeRef.current = true
	      }
	
	      setupAudioEvents()
	      exposeMethods()
	      return
	    }
	
	    // No audio_url — skip playback (YT-only songs not allowed)
	    if (lastPlayedKeyRef.current !== `${playMode}-${currentIndex}-${(currentSong as any)?.id}`) {
	      lastPlayedKeyRef.current = `${playMode}-${currentIndex}-${(currentSong as any)?.id}`
	      setIsPlaying(false)
	    }
	  }, [currentSong?.youtube_id, currentSong?.audio_url, playMode, currentIndex, (currentSong as any)?.id, initPlayer, exposeMethods, setIsPlaying, setupAudioEvents, stopAudio])

  useEffect(() => {
    preloadNext(nextSong?.youtube_id)
  }, [nextSong?.youtube_id, preloadNext])

  useEffect(() => {
    ;(window as any).MusicBarNativePlayer = {
      preloadNext: () => preloadNext(nextSong?.youtube_id),
      startCrossfade: () => startCrossfade(nextSong?.youtube_id),
    }
    return () => {
      if ((window as any).MusicBarNativePlayer) {
        delete (window as any).MusicBarNativePlayer
      }
    }
  }, [nextSong?.youtube_id, preloadNext, startCrossfade])

  // Track playback progress
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAudioModeRef.current) {
        const { currentTime, duration } = audioPlaybackRef.current
        setCurrentTime(currentTime)
        setDuration(duration)
        return
      }

      const activePlayer = ytPlayerRefs.current[activeSlotRef.current]
      if (currentVideoRef.current && activePlayer && isPlayerReadyRef.current) {
        const time = typeof activePlayer.getCurrentTime === 'function' ? activePlayer.getCurrentTime() : 0
        const dur = typeof activePlayer.getDuration === 'function' ? activePlayer.getDuration() : 0
        setCurrentTime(time)
        setDuration(dur)

        if (nextSong?.youtube_id) {
          preloadNext(nextSong.youtube_id)
          if (dur > CROSSFADE_SECONDS + 2 && dur - time <= CROSSFADE_SECONDS) {
            startCrossfade(nextSong.youtube_id)
          }
        }

        // Safety sync: If React thinks it's playing but the actual player is not
        if (typeof (activePlayer as any).getPlayerState === 'function') {
          const actualState = (activePlayer as any).getPlayerState()
          const state = window.YT?.PlayerState
          if (state) {
            const isActualPlaying = actualState === state.PLAYING || actualState === state.BUFFERING
            if (isPlayingRef.current && !isActualPlaying && actualState !== state.ENDED) {
              setIsPlaying(false)
            }
          }
        }
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [nextSong?.youtube_id, preloadNext, setCurrentTime, setDuration, setIsPlaying, startCrossfade])

  useEffect(() => {
    return () => {
      if (crossfadeTimerRef.current) window.clearInterval(crossfadeTimerRef.current)
      stopAudio()
      destroySlot(0)
      destroySlot(1)
    }
  }, [destroySlot, stopAudio])

  return (
    <div
      aria-hidden={!isVideoMode}
      style={
        isVideoMode && videoRect
          ? {
              position: 'fixed',
              top: (isFullscreen && isVideoMode) ? 0 : videoRect.top,
              left: (isFullscreen && isVideoMode) ? 0 : videoRect.left,
              width: (isFullscreen && isVideoMode) ? '100vw' : videoRect.width,
              height: (isFullscreen && isVideoMode) ? '100dvh' : videoRect.height,
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
      <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
        <div ref={slotRefs[0]} style={{ position: 'absolute', inset: 0, opacity: 1 }} />
        <div ref={slotRefs[1]} style={{ position: 'absolute', inset: 0, opacity: 0 }} />
      </div>
    </div>
  )
}
