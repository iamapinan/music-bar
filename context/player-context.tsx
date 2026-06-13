'use client'

import {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, ReactNode
} from 'react'
import { usePathname } from 'next/navigation'
import useSWR from 'swr'
import { Store } from 'lucide-react'
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
  isPlaylistLoading: boolean
  playlists: Playlist[]
  activePlaylistIds: number[]
  isRequestsEnabled: boolean
  showControls: boolean
  showPlaylistRail: boolean
  resumePosition: number
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
  playSongImmediately: (song: any) => void
  setActivePlaylistIds: (ids: number[]) => Promise<void>
  setIsPlaying: (v: boolean) => void
  setIsVideoMode: (v: boolean) => void
  setIsAutoPlayEnabled: (v: boolean) => void
  setIsFullscreen: (v: boolean) => void
  setIsRequestsEnabled: (v: boolean) => void
  setShowControls: (v: boolean) => void
  setCurrentTime: (v: number) => void
  setDuration: (v: number) => void
  setShowPlaylistRail: (v: boolean) => void
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
  const pathname = usePathname()
  const tenantSlug = pathname?.match(/^\/play\/([^/]+)/)?.[1] || null
  const shouldLoadPlayerData = pathname !== '/'
  const tenantStoragePrefix = tenantSlug ? `music_bar:${tenantSlug}` : 'music_bar'
  const apiPath = useCallback((path: string) => {
    if (!tenantSlug) return path
    const separator = path.includes('?') ? '&' : '?'
    return `${path}${separator}tenant=${encodeURIComponent(tenantSlug)}`
  }, [tenantSlug])

  const [isPlaying, setIsPlaying] = useState(false)
  const { data: tenantInfo } = useSWR(
    tenantSlug ? `/api/tenants/by-slug/${tenantSlug}` : null,
    fetcher
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [volume, setVolume] = useState(100)
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
  const [showPlaylistRail, setShowPlaylistRail] = useState(true)
  const [resumePosition, setResumePosition] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)
  const [nextShuffleIndex, setNextShuffleIndex] = useState(0)
  const playerRef = useRef<YouTubePlayerMethods | null>(null)
  const [customSong, setCustomSong] = useState<PlaylistSong | SongRequest | null>(null)
  const customSongRef = useRef<PlaylistSong | SongRequest | null>(null)

  // Load saved state + playback position
  useEffect(() => {
    try {
      const saved = localStorage.getItem('music_bar_player_state')
      const tenantSaved = localStorage.getItem(`${tenantStoragePrefix}:player_state`)
      const stateValue = tenantSaved || saved
      if (stateValue) {
        const parsed = JSON.parse(stateValue)
        if (parsed.currentIndex !== undefined) setCurrentIndex(parsed.currentIndex)
        if (parsed.playMode) setPlayMode(parsed.playMode)
        if (parsed.isVideoMode !== undefined) setIsVideoMode(parsed.isVideoMode)
        if (parsed.isAutoPlayEnabled !== undefined) setIsAutoPlayEnabled(parsed.isAutoPlayEnabled)
        if (parsed.showPlaylistRail !== undefined) setShowPlaylistRail(parsed.showPlaylistRail)
      }

      // Restore last played song and position (valid up to 30 minutes)
      const savedPlayback = localStorage.getItem(`${tenantStoragePrefix}:playback_state`)
      if (savedPlayback) {
        const parsed = JSON.parse(savedPlayback)
        if (parsed?.song?.youtube_id && typeof parsed.position === 'number' && parsed.position > 1) {
          const age = Date.now() - (parsed.savedAt || 0)
          if (age < 30 * 60 * 1000) {
            setCustomSong(parsed.song)
            customSongRef.current = parsed.song
            setResumePosition(parsed.position)
          }
        }
      }
    } catch {}
    setIsInitialized(true)
  }, [tenantStoragePrefix])

  // Save state
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(`${tenantStoragePrefix}:player_state`, JSON.stringify({
        currentIndex,
        playMode,
        isVideoMode,
        isAutoPlayEnabled,
        showPlaylistRail
      }))
    }
  }, [currentIndex, playMode, isVideoMode, isAutoPlayEnabled, showPlaylistRail, isInitialized, tenantStoragePrefix])

  // ===================== Player Ping & Registration =====================
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!shouldLoadPlayerData) return
    if (!tenantSlug) return // Must have a tenant context to register

    const getOrCreateDeviceId = () => {
      let id = localStorage.getItem(`${tenantStoragePrefix}:device_id`) || localStorage.getItem('music_bar_device_id')
      if (!id) {
        id = crypto.randomUUID()
      }
      localStorage.setItem(`${tenantStoragePrefix}:device_id`, id)
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
    
    if (!localStorage.getItem(`${tenantStoragePrefix}:device_name`)) {
      localStorage.setItem(`${tenantStoragePrefix}:device_name`, `${deviceType} Player`)
    }

    const pingServer = async () => {
      try {
        const res = await fetch(apiPath('/api/players'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            device_id: deviceId,
            device_name: localStorage.getItem(`${tenantStoragePrefix}:device_name`),
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
  }, [isPlaying, apiPath, tenantStoragePrefix, shouldLoadPlayerData])

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
  const { data: dbSettings, mutate: mutateSettings } = useSWR(shouldLoadPlayerData ? apiPath('/api/settings') : null, fetcher, {
    refreshInterval: 3000
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
      await fetch(apiPath('/api/settings'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'is_requests_enabled', value: enabled }),
      })
      mutateSettings()
    } catch {}
  }, [mutateSettings, apiPath])

  const setActivePlaylistIds = useCallback(async (ids: number[]) => {
    const nextIds = [...new Set(ids.map(Number).filter(Boolean))]
    setActivePlaylistIdsState(nextIds)
    setCurrentIndex(0)
    setPlayMode('playlist')
    try {
      await fetch(apiPath('/api/settings'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'active_playlist_ids', value: nextIds }),
      })
      mutateSettings()
    } catch {}
  }, [mutateSettings, apiPath])

  // ===================== Data =====================
  const { data: playlists = [] } = useSWR<Playlist[]>(shouldLoadPlayerData ? apiPath('/api/playlists') : null, fetcher, { refreshInterval: 5000 })
  const defaultPlaylistId = playlists.find((p: { is_default: boolean }) => p.is_default)?.id || playlists[0]?.id
  const enabledPlaylistIds = activePlaylistIds.filter(id => playlists.some(playlist => playlist.id === id && playlist.is_enabled))
  const playbackPlaylistIds = enabledPlaylistIds.length > 0
    ? enabledPlaylistIds
    : defaultPlaylistId
      ? [defaultPlaylistId]
      : []
  const playlistSongsKey = playbackPlaylistIds.length > 0
    ? `${tenantSlug || 'active'}:${playbackPlaylistIds.join(',')}`
    : ''

  const { data: playlistSongs = [], isLoading: isPlaylistLoading, mutate: mutateSongs } = useSWR<PlaylistSong[]>(
    playlistSongsKey ? `playlist-songs:${playlistSongsKey}` : null,
    async () => {
      const songGroups = await Promise.all(
        playbackPlaylistIds.map(id => fetcher(apiPath(`/api/playlists/${id}/songs`)) as Promise<PlaylistSong[]>)
      )
      return songGroups.flat()
    },
    { refreshInterval: 10000, keepPreviousData: true }
  )

  const { data: requests = [], mutate: mutateRequests } = useSWR<SongRequest[]>(
    shouldLoadPlayerData ? apiPath('/api/requests') : null,
    fetcher,
    { refreshInterval: 3000 }
  )

  // ===================== Current Song =====================
  const currentSong: PlaylistSong | SongRequest | null =
    customSong
      ? customSong
      : (playMode === 'request' && requests.length > 0
        ? requests[0]
        : playlistSongs[currentIndex] ?? null)

  const nextSong: PlaylistSong | SongRequest | null = (() => {
    if (playMode === 'request') {
      if (requests.length > 1) return requests[1]
      return playlistSongs[currentIndex] || null
    } else {
      if (requests.length > 0) return requests[0]
      if (playlistSongs.length === 0) return null
      const nextIdx = isShuffle
        ? nextShuffleIndex
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
  const nextShuffleIndexRef = useRef(nextShuffleIndex)
  const finishingRequestIdsRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    if (isShuffle && playlistSongs.length > 0) {
      let nextIdx = Math.floor(Math.random() * playlistSongs.length)
      if (playlistSongs.length > 1 && nextIdx === currentIndex) {
        nextIdx = (nextIdx + 1) % playlistSongs.length
      }
      setNextShuffleIndex(nextIdx)
      nextShuffleIndexRef.current = nextIdx
    }
  }, [currentIndex, isShuffle, playlistSongs.length])

  useEffect(() => { playModeRef.current = playMode }, [playMode])
  useEffect(() => { requestsRef.current = requests }, [requests])
  useEffect(() => { currentIndexRef.current = currentIndex }, [currentIndex])
  useEffect(() => { isShuffleRef.current = isShuffle }, [isShuffle])
  useEffect(() => { playlistSongsRef.current = playlistSongs }, [playlistSongs])

  const handleSongEnd = useCallback(async () => {
    if (customSongRef.current) {
      setCustomSong(null)
      customSongRef.current = null
      
      const reqs = requestsRef.current
      if (reqs.length > 0) {
        setPlayMode('request')
      } else {
        setPlayMode('playlist')
      }
      setIsPlaying(true)
      return
    }

    const mode = playModeRef.current
    const reqs = requestsRef.current
    const idx = currentIndexRef.current
    const shuffle = isShuffleRef.current
    const songs = playlistSongsRef.current

    if (mode === 'request' && reqs.length > 0) {
      const finishedId = reqs[0].id
      if (finishingRequestIdsRef.current.has(finishedId)) return
      finishingRequestIdsRef.current.add(finishedId)
      
      // Optimistically update local state to next request immediately
      const remainingReqs = reqs.slice(1)
      mutateRequests(remainingReqs, false)
      
      if (remainingReqs.length === 0) {
        setPlayMode('playlist')
      }

      // Update backend in background
      fetch(apiPath('/api/requests'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: finishedId, status: 'played' }),
      })
        .then(() => mutateRequests())
        .finally(() => finishingRequestIdsRef.current.delete(finishedId))
    } else {
      // Playlist mode: advance to next song
      if (songs.length === 0) return

      const next = shuffle
        ? nextShuffleIndexRef.current
        : (idx + 1) % songs.length
      setCurrentIndex(next)

      // Check if there are pending requests to play next
      if (reqs.length > 0) {
        setPlayMode('request')
      }
    }
  }, [apiPath, mutateRequests])

  const handlePrevious = useCallback(() => {
    if (customSongRef.current) {
      setCustomSong(null)
      customSongRef.current = null
      
      const reqs = requestsRef.current
      if (reqs.length > 0) {
        setPlayMode('request')
      } else {
        setPlayMode('playlist')
      }
      setIsPlaying(true)
      return
    }

    if (playModeRef.current === 'playlist') {
      const songs = playlistSongsRef.current
      const idx = currentIndexRef.current
      const shuffle = isShuffleRef.current
      if (songs.length === 0) return
      const prev = shuffle
        ? Math.floor(Math.random() * songs.length) // For previous, random is fine as we don't display "Previous Song"
        : (idx - 1 + songs.length) % songs.length
      setCurrentIndex(prev)
    }
  }, [])

  const handleSkip = useCallback(async () => {
    if (customSongRef.current) {
      setCustomSong(null)
      customSongRef.current = null
      
      const reqs = requestsRef.current
      if (reqs.length > 0) {
        setPlayMode('request')
      } else {
        setPlayMode('playlist')
      }
      setIsPlaying(true)
      return
    }

    const mode = playModeRef.current
    const reqs = requestsRef.current

    if (mode === 'request' && reqs.length > 0) {
      const skippedId = reqs[0].id
      if (finishingRequestIdsRef.current.has(skippedId)) return
      finishingRequestIdsRef.current.add(skippedId)
      try {
        await fetch(apiPath('/api/requests'), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: skippedId, status: 'skipped' }),
        })
      } catch {
      } finally {
        finishingRequestIdsRef.current.delete(skippedId)
      }
      await mutateRequests()
      if (reqs.length <= 1) setPlayMode('playlist')
    } else {
      await handleSongEnd()
    }
  }, [apiPath, handleSongEnd, mutateRequests])

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

  // ===================== Save/Resume Playback Position =====================
  // Save current song + position every 5 seconds while playing
  useEffect(() => {
    if (!isInitialized || !currentSong) return

    const savePosition = () => {
      try {
        localStorage.setItem(`${tenantStoragePrefix}:playback_state`, JSON.stringify({
          song: {
            youtube_id: currentSong.youtube_id,
            title: currentSong.title,
            thumbnail: currentSong.thumbnail || '',
            artist: 'artist' in currentSong && currentSong.artist ? currentSong.artist : '',
            requested_by: 'requested_by' in currentSong ? (currentSong.requested_by || '') : '',
          },
          position: currentTime,
          savedAt: Date.now(),
        }))
      } catch {}
    }

    const interval = setInterval(savePosition, 5000)
    return () => {
      clearInterval(interval)
      savePosition() // Save on unmount / song change
    }
  }, [currentSong?.youtube_id, isInitialized, tenantStoragePrefix, currentTime])

  // Seek to saved resume position once player is ready
  useEffect(() => {
    if (resumePosition <= 0 || !currentSong) return

    const seek = (): boolean => {
      if (playerRef.current?.seekTo) {
        playerRef.current.seekTo(resumePosition)
        setResumePosition(0)
        return true
      }
      return false
    }

    // Try immediately (player might already be ready)
    if (seek()) return

    // Poll every 200ms until player is ready, up to 10s
    const interval = setInterval(() => {
      if (seek()) clearInterval(interval)
    }, 200)
    const timeout = setTimeout(() => clearInterval(interval), 10000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [resumePosition, currentSong?.youtube_id, playerRef])

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

  const playSongImmediately = useCallback((song: any) => {
    const formattedSong = {
      ...song,
      id: song.id || 999999,
      playlist_id: song.playlist_id || 999999,
      youtube_id: song.youtube_id,
      title: song.title,
      thumbnail: song.thumbnail || '',
      artist: song.artist || song.channelTitle || 'Music Bar',
    }
    setCustomSong(formattedSong)
    customSongRef.current = formattedSong
    setIsPlaying(true)
  }, [])

  if (!isInitialized) return null

  const isStoreClosed = tenantInfo && tenantInfo.is_active === false
  const isAdminPath = pathname?.startsWith('/admin')

  if (isStoreClosed && !isAdminPath) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background p-6 text-center overflow-hidden">
        {/* Ambient glow washes */}
        <div className="pointer-events-none absolute -left-1/4 -top-1/4 h-[80%] w-[80%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="pointer-events-none absolute -bottom-1/4 -right-1/4 h-[80%] w-[80%] rounded-full bg-emerald-500/10 blur-[120px] animate-pulse" />
        
        <div className="relative z-10 max-w-md w-full rounded-3xl border border-white/10 bg-black/40 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_50px_rgba(16,185,129,0.15)]">
            <Store className="h-10 w-10" />
          </div>
          
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Music Bar</p>
          <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            ร้านปิดให้บริการชั่วคราว
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            ขออภัยในความไม่สะดวก ขณะนี้ร้าน <span className="font-semibold text-white">"{tenantInfo.display_name || tenantInfo.name}"</span> ยังไม่เปิดให้บริการระบบสตรีมเครื่องเล่นและขอเพลงในขณะนี้
          </p>
          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-xs text-white/40">กรุณาสอบถามพนักงานหรือผู้ดูแลร้านเพื่อเปิดให้บริการระบบ</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <PlayerContext.Provider value={{
      isPlaying, currentSong, nextSong, playMode, volume, isMuted, isShuffle, isVideoMode, isAutoPlayEnabled,
      isFullscreen,
      currentTime, duration,
      currentIndex, requests, playlistSongs, isPlaylistLoading, playlists, activePlaylistIds: playbackPlaylistIds,
      togglePlay, handleSkip, handlePrevious, handleVolumeChange,
      toggleMute, toggleShuffle, handleSongEnd, playByIndex, playSong, playSongImmediately, setActivePlaylistIds, setIsPlaying, setIsVideoMode, setIsAutoPlayEnabled,
      setIsFullscreen, setIsRequestsEnabled: handleSetIsRequestsEnabled, setCurrentTime, setDuration,
      mutatePlaylist: mutateSongs, mutateRequests,
      playerRef, isRequestsEnabled, showControls, setShowControls,
      showPlaylistRail, setShowPlaylistRail,
      resumePosition
    }}>
      {children}
    </PlayerContext.Provider>
  )
}

// Type for WakeLockSentinel (not in all TS libs)
interface WakeLockSentinel {
  release: () => Promise<void>
}
