'use client'

import {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, ReactNode
} from 'react'
import useSWR from 'swr'
import type { Playlist, PlaylistSong, SongRequest } from '@/lib/types'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

const parseSetting = <T,>(value: unknown, fallback: T): T => {
  if (value === undefined || value === null) return fallback
  if (typeof value !== 'string') return value as T
  try {
    return JSON.parse(value) as T
  } catch {
    return value as T
  }
}

interface PlayerContextValue {
  // State
  isPlaying: boolean
  currentSong: PlaylistSong | SongRequest | null
  nextSong: PlaylistSong | SongRequest | null
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
  playlists: Playlist[]
  activePlaylistIds: number[]
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
  playSong: (song: PlaylistSong) => void
  setActivePlaylistIds: (ids: number[]) => Promise<void>
  setIsPlaying: (v: boolean) => void
  setIsVideoMode: (v: boolean) => void
  setIsAutoPlayEnabled: (v: boolean) => void
  setIsFullscreen: (v: boolean) => void
  setIsRequestsEnabled: (v: boolean) => void
  setShowControls: (v: boolean) => void
  setCurrentTime: (v: number) => void
  setDuration: (v: number) => void
  mutatePlaylist: () => Promise<any>
  mutateRequests: () => Promise<any>
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
  const [activePlaylistIds, setActivePlaylistIdsState] = useState<number[]>([])
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

  // ===================== Player Ping & Registration =====================
  useEffect(() => {
    if (typeof window === 'undefined') return

    const getOrCreateDeviceId = () => {
      let id = localStorage.getItem('music_bar_device_id')
      if (!id) {
        id = crypto.randomUUID()
        localStorage.setItem('music_bar_device_id', id)
      }
      return id
    }

    const getDeviceType = () => {
      const ua = navigator.userAgent
      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'Tablet'
      if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'Mobile'
      return 'Desktop'
    }

    const deviceId = getOrCreateDeviceId()
    const deviceType = getDeviceType()
    
    if (!localStorage.getItem('music_bar_device_name')) {
      localStorage.setItem('music_bar_device_name', `${deviceType} Player`)
    }

    const pingServer = async () => {
      try {
        const res = await fetch('/api/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            device_id: deviceId,
            device_name: localStorage.getItem('music_bar_device_name'),
            device_type: deviceType,
          })
        })
        if (res.ok) {
          const data = await res.json()
          // If the admin deactivated this player remotely, we can potentially pause playback here
          // but for now we just register the player.
          if (data.is_active === false && isPlaying) {
             playerRef.current?.pause()
             setIsPlaying(false)
          }
        }
      } catch (err) {
        console.error('Player ping failed', err)
      }
    }

    // Initial ping and then interval every 30s
    pingServer()
    const interval = setInterval(pingServer, 30000)
    return () => clearInterval(interval)
  }, [isPlaying])

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
      setIsRequestsEnabled(parseSetting(dbSettings.is_requests_enabled, true))
    }
    const storedPlaylistIds = parseSetting<unknown[]>(dbSettings?.active_playlist_ids, [])
    if (Array.isArray(storedPlaylistIds)) {
      setActivePlaylistIdsState(storedPlaylistIds.map(Number).filter(Boolean))
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

  const setActivePlaylistIds = useCallback(async (ids: number[]) => {
    const nextIds = [...new Set(ids.map(Number).filter(Boolean))]
    setActivePlaylistIdsState(nextIds)
    setCurrentIndex(0)
    setPlayMode('playlist')
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'active_playlist_ids', value: nextIds }),
      })
      mutateSettings()
    } catch {}
  }, [mutateSettings])

  // ===================== Data =====================
  const { data: playlists = [] } = useSWR<Playlist[]>('/api/playlists', fetcher, { refreshInterval: 15000 })
  const defaultPlaylistId = playlists?.find((p: { is_default: boolean }) => p.is_default)?.id || playlists?.[0]?.id || 1
  const enabledPlaylistIds = activePlaylistIds.filter(id => playlists.some(playlist => playlist.id === id && playlist.is_enabled))
  const playbackPlaylistIds = enabledPlaylistIds.length > 0 ? enabledPlaylistIds : [defaultPlaylistId]
  const playlistSongsKey = playbackPlaylistIds.join(',')

  const { data: playlistSongs = [], mutate: mutateSongs } = useSWR<PlaylistSong[]>(
    playlistSongsKey ? `playlist-songs:${playlistSongsKey}` : null,
    async () => {
      const songGroups = await Promise.all(
        playbackPlaylistIds.map(id => fetcher(`/api/playlists/${id}/songs`) as Promise<PlaylistSong[]>)
      )
      return songGroups.flat()
    },
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

  const nextSong: PlaylistSong | SongRequest | null = (() => {
    if (playMode === 'request') {
      if (requests.length > 1) return requests[1]
      return playlistSongs[currentIndex] || null
    } else {
      if (requests.length > 0) return requests[0]
      if (playlistSongs.length === 0) return null
      const nextIdx = isShuffle
        ? Math.floor(Math.random() * playlistSongs.length)
        : (currentIndex + 1) % playlistSongs.length
      return playlistSongs[nextIdx] || null
    }
  })()

  // Auto-switch to request mode when requests arrive and no song is playing
  useEffect(() => {
    if (requests.length > 0 && playMode === 'playlist' && !currentSong && isInitialized) {
      setPlayMode('request')
    }
  }, [requests.length, playMode, currentSong, isInitialized])

  // Keep currentIndex within bounds when playlistSongs changes
  useEffect(() => {
    if (playlistSongs.length > 0 && currentIndex >= playlistSongs.length) {
      setCurrentIndex(0)
    }
  }, [playlistSongs.length, currentIndex])

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
      const finishedId = reqs[0].id
      
      // Optimistically update local state to next request immediately
      const remainingReqs = reqs.slice(1)
      mutateRequests(remainingReqs, false)
      
      if (remainingReqs.length === 0) {
        setPlayMode('playlist')
      }

      // Update backend in background
      fetch('/api/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: finishedId, status: 'played' }),
      }).then(() => mutateRequests())
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

  const playSong = useCallback((song: PlaylistSong) => {
    const index = playlistSongsRef.current.findIndex(item => item.id === song.id && item.playlist_id === song.playlist_id)
    if (index >= 0) {
      setPlayMode('playlist')
      setCurrentIndex(index)
    }
  }, [])

  if (!isInitialized) return null

  return (
    <PlayerContext.Provider value={{
      isPlaying, currentSong, nextSong, playMode, volume, isMuted, isShuffle, isVideoMode, isAutoPlayEnabled,
      isFullscreen,
      currentTime, duration,
      currentIndex, requests, playlistSongs, playlists, activePlaylistIds: playbackPlaylistIds,
      togglePlay, handleSkip, handlePrevious, handleVolumeChange,
      toggleMute, toggleShuffle, handleSongEnd, playByIndex, playSong, setActivePlaylistIds, setIsPlaying, setIsVideoMode, setIsAutoPlayEnabled,
      setIsFullscreen, setIsRequestsEnabled: handleSetIsRequestsEnabled, setCurrentTime, setDuration,
      mutatePlaylist: mutateSongs, mutateRequests,
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
