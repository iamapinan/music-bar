'use client'

import {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, ReactNode
} from 'react'
import useSWR from 'swr'
import type { PlaylistSong, SongRequest } from '@/lib/types'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

interface PlayerContextValue {
  // State
  isPlaying: boolean
  currentSong: PlaylistSong | SongRequest | null
  playMode: 'playlist' | 'request'
  volume: number
  isMuted: boolean
  isShuffle: boolean
  isVideoMode: boolean
  isAutoPlayEnabled: boolean
  isFullscreen: boolean
  currentTime: number
  duration: number
  currentIndex: number
  requests: SongRequest[]
  playlistSongs: PlaylistSong[]
  isRequestsEnabled: boolean
  showControls: boolean
  // Controls
  togglePlay: () => void
  handleSkip: () => void
  handlePrevious: () => void
  handleVolumeChange: (values: number[]) => void
  toggleMute: () => void
  toggleShuffle: () => void
  handleSongEnd: () => void
  playByIndex: (index: number) => void
  setIsPlaying: (v: boolean) => void
  setIsVideoMode: (v: boolean) => void
  setIsAutoPlayEnabled: (v: boolean) => void
  setIsFullscreen: (v: boolean) => void
  setIsRequestsEnabled: (v: boolean) => void
  setShowControls: (v: boolean) => void
  setCurrentTime: (v: number) => void
  setDuration: (v: number) => void
  // Player ref for YouTube component
  playerRef: React.MutableRefObject<YouTubePlayerMethods | null>
}

export interface YouTubePlayerMethods {
  play: () => void
  pause: () => void
  setVolume: (v: number) => void
  loadVideo: (id: string) => void
  seekTo: (seconds: number) => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider')
  return ctx
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isVideoMode, setIsVideoMode] = useState(false)
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(true) // Default: ON
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playMode, setPlayMode] = useState<'playlist' | 'request'>('playlist')
  const [isRequestsEnabled, setIsRequestsEnabled] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const playerRef = useRef<YouTubePlayerMethods | null>(null)

  // Load saved state
  useEffect(() => {
    try {
      const saved = localStorage.getItem('music_bar_player_state')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.currentIndex !== undefined) setCurrentIndex(parsed.currentIndex)
        if (parsed.playMode) setPlayMode(parsed.playMode)
        if (parsed.isVideoMode !== undefined) setIsVideoMode(parsed.isVideoMode)
        if (parsed.isAutoPlayEnabled !== undefined) setIsAutoPlayEnabled(parsed.isAutoPlayEnabled)
      }
    } catch {}
    setIsInitialized(true)
  }, [])

  // Save state
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('music_bar_player_state', JSON.stringify({
        currentIndex,
        playMode,
        isVideoMode,
        isAutoPlayEnabled
      }))
    }
  }, [currentIndex, playMode, isVideoMode, isAutoPlayEnabled, isInitialized])

  // ===================== Auto-hide Controls =====================
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isPlayingRef = useRef(isPlaying)

  useEffect(() => {
    isPlayingRef.current = isPlaying
    if (!isPlaying) {
      setShowControls(true)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    } else {
      resetHideTimer()
    }
  }, [isPlaying])

  const resetHideTimer = useCallback(() => {
    setShowControls(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => {
      if (isPlayingRef.current) setShowControls(false)
    }, 3000)
  }, [])

  useEffect(() => {
    const handleActivity = () => resetHideTimer()
    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('mousedown', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('touchstart', handleActivity)
    resetHideTimer()
    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('mousedown', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('touchstart', handleActivity)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [resetHideTimer])

  // ===================== Settings Sync =====================
  const { data: dbSettings, mutate: mutateSettings } = useSWR('/api/settings', fetcher, {
    refreshInterval: 30000
  })

  useEffect(() => {
    if (dbSettings?.is_requests_enabled !== undefined) {
      setIsRequestsEnabled(JSON.parse(JSON.stringify(dbSettings.is_requests_enabled)))
    }
  }, [dbSettings])

  const handleSetIsRequestsEnabled = useCallback(async (enabled: boolean) => {
    setIsRequestsEnabled(enabled)
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'is_requests_enabled', value: enabled }),
      })
      mutateSettings()
    } catch {}
  }, [mutateSettings])

  // ===================== Data =====================
  const { data: playlists } = useSWR('/api/playlists', fetcher, { refreshInterval: 15000 })
  const defaultPlaylistId = playlists?.find((p: { is_default: boolean }) => p.is_default)?.id || 1

  const { data: playlistSongs = [] } = useSWR<PlaylistSong[]>(
    `/api/playlists/${defaultPlaylistId}/songs`,
    fetcher,
    { refreshInterval: 10000 }
  )

  const { data: requests = [], mutate: mutateRequests } = useSWR<SongRequest[]>(
    '/api/requests',
    fetcher,
    { refreshInterval: 3000 }
  )

  // ===================== Current Song =====================
  const currentSong: PlaylistSong | SongRequest | null =
    playMode === 'request' && requests.length > 0
      ? requests[0]
      : playlistSongs[currentIndex] ?? null

  // Auto-switch to request mode when requests arrive and no song is playing
  useEffect(() => {
    if (requests.length > 0 && playMode === 'playlist' && !currentSong && isInitialized) {
      setPlayMode('request')
    }
  }, [requests.length, playMode, currentSong, isInitialized])

  // ===================== Song End / Skip / Previous =====================
  // Use refs so callbacks always see latest values (no stale closure)
  const playModeRef = useRef(playMode)
  const requestsRef = useRef(requests)
  const currentIndexRef = useRef(currentIndex)
  const isShuffleRef = useRef(isShuffle)
  const playlistSongsRef = useRef(playlistSongs)

  useEffect(() => { playModeRef.current = playMode }, [playMode])
  useEffect(() => { requestsRef.current = requests }, [requests])
  useEffect(() => { currentIndexRef.current = currentIndex }, [currentIndex])
  useEffect(() => { isShuffleRef.current = isShuffle }, [isShuffle])
  useEffect(() => { playlistSongsRef.current = playlistSongs }, [playlistSongs])

  const handleSongEnd = useCallback(async () => {
    const mode = playModeRef.current
    const reqs = requestsRef.current
    const idx = currentIndexRef.current
    const shuffle = isShuffleRef.current
    const songs = playlistSongsRef.current

    if (mode === 'request' && reqs.length > 0) {
      // Mark current request as played
      try {
        await fetch('/api/requests', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: reqs[0].id, status: 'played' }),
        })
      } catch {}
      await mutateRequests()

      // After mutation, if this was the last request, go back to playlist
      if (reqs.length <= 1) {
        setPlayMode('playlist')
      }
      // If more requests, the next one automatically becomes requests[0]
    } else {
      // Playlist mode: advance to next song
      if (songs.length === 0) return

      const next = shuffle
        ? Math.floor(Math.random() * songs.length)
        : (idx + 1) % songs.length
      setCurrentIndex(next)

      // Check if there are pending requests to play next
      if (reqs.length > 0) {
        setPlayMode('request')
      }
    }
  }, [mutateRequests])

  const handlePrevious = useCallback(() => {
    if (playModeRef.current === 'playlist') {
      const songs = playlistSongsRef.current
      const idx = currentIndexRef.current
      const shuffle = isShuffleRef.current
      if (songs.length === 0) return
      const prev = shuffle
        ? Math.floor(Math.random() * songs.length)
        : (idx - 1 + songs.length) % songs.length
      setCurrentIndex(prev)
    }
  }, [])

  const handleSkip = useCallback(async () => {
    const mode = playModeRef.current
    const reqs = requestsRef.current

    if (mode === 'request' && reqs.length > 0) {
      try {
        await fetch('/api/requests', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: reqs[0].id, status: 'skipped' }),
        })
      } catch {}
      await mutateRequests()
      if (reqs.length <= 1) setPlayMode('playlist')
    } else {
      await handleSongEnd()
    }
  }, [handleSongEnd, mutateRequests])

  // ===================== Play Controls =====================
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      playerRef.current?.pause()
      setIsPlaying(false)
    } else {
      playerRef.current?.play()
      setIsPlaying(true)
    }
  }, [isPlaying])

  const handleVolumeChange = useCallback((values: number[]) => {
    const v = values[0]
    setVolume(v)
    setIsMuted(v === 0)
    playerRef.current?.setVolume(v)
  }, [])

  const toggleMute = useCallback(() => {
    const next = !isMuted
    setIsMuted(next)
    playerRef.current?.setVolume(next ? 0 : volume)
  }, [isMuted, volume])

  const toggleShuffle = useCallback(() => setIsShuffle(s => !s), [])

  // ===================== Media Session =====================
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentSong) return

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: 'requested_by' in currentSong
        ? currentSong.requested_by || 'ลูกค้า'
        : 'Music Bar',
      album: 'Music Bar',
      artwork: currentSong.thumbnail
        ? [{ src: currentSong.thumbnail, sizes: '512x512', type: 'image/jpeg' }]
        : [],
    })

    navigator.mediaSession.setActionHandler('play', () => {
      playerRef.current?.play()
      setIsPlaying(true)
    })
    navigator.mediaSession.setActionHandler('pause', () => {
      playerRef.current?.pause()
      setIsPlaying(false)
    })
    navigator.mediaSession.setActionHandler('nexttrack', handleSongEnd)
    navigator.mediaSession.setActionHandler('previoustrack', handlePrevious)
    navigator.mediaSession.setActionHandler('stop', () => {
      playerRef.current?.pause()
      setIsPlaying(false)
    })
  }, [currentSong, handleSongEnd, handlePrevious])

  // Sync Media Session playback state
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
  }, [isPlaying])

  // Page Visibility API — resume playback when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isPlaying) {
        setTimeout(() => playerRef.current?.play(), 300)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isPlaying])

  // Wake Lock API — prevent screen from sleeping
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null

    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && isPlaying) {
        try {
          wakeLock = await (navigator as Navigator & { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock.request('screen')
        } catch {}
      }
    }

    const releaseWakeLock = async () => {
      if (wakeLock) {
        await wakeLock.release()
        wakeLock = null
      }
    }

    if (isPlaying) {
      requestWakeLock()
    } else {
      releaseWakeLock()
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isPlaying) requestWakeLock()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      releaseWakeLock()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [isPlaying])

  const playByIndex = useCallback((index: number) => {
    setPlayMode('playlist')
    setCurrentIndex(index)
  }, [])

  if (!isInitialized) return null

  return (
    <PlayerContext.Provider value={{
      isPlaying, currentSong, playMode, volume, isMuted, isShuffle, isVideoMode, isAutoPlayEnabled,
      isFullscreen,
      currentTime, duration,
      currentIndex, requests, playlistSongs,
      togglePlay, handleSkip, handlePrevious, handleVolumeChange,
      toggleMute, toggleShuffle, handleSongEnd, playByIndex, setIsPlaying, setIsVideoMode, setIsAutoPlayEnabled,
      setIsFullscreen, setIsRequestsEnabled: handleSetIsRequestsEnabled, setCurrentTime, setDuration,
      playerRef, isRequestsEnabled, showControls, setShowControls
    }}>
      {children}
    </PlayerContext.Provider>
  )
}

// Type for WakeLockSentinel (not in all TS libs)
interface WakeLockSentinel {
  release: () => Promise<void>
}
