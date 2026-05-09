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
  currentIndex: number
  requests: SongRequest[]
  playlistSongs: PlaylistSong[]
  // Controls
  togglePlay: () => void
  handleSkip: () => void
  handlePrevious: () => void
  handleVolumeChange: (values: number[]) => void
  toggleMute: () => void
  toggleShuffle: () => void
  handleSongEnd: () => void
  setIsPlaying: (v: boolean) => void
  setIsVideoMode: (v: boolean) => void
  // Player ref for YouTube component
  playerRef: React.MutableRefObject<YouTubePlayerMethods | null>
}

export interface YouTubePlayerMethods {
  play: () => void
  pause: () => void
  setVolume: (v: number) => void
  loadVideo: (id: string) => void
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
  const [playMode, setPlayMode] = useState<'playlist' | 'request'>('playlist')
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
        isVideoMode
      }))
    }
  }, [currentIndex, playMode, isVideoMode, isInitialized])

  // Fetch playlists
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

  const currentSong: PlaylistSong | SongRequest | null =
    playMode === 'request' && requests.length > 0
      ? requests[0]
      : playlistSongs[currentIndex] ?? null

  // Switch to request mode only if no song is playing (e.g. initial load or empty playlist)
  useEffect(() => {
    if (requests.length > 0 && playMode === 'playlist' && !currentSong && isInitialized) {
      setPlayMode('request')
    }
  }, [requests.length, playMode, currentSong, isInitialized])

  const handleSongEnd = useCallback(async () => {
    if (playMode === 'request' && requests.length > 0) {
      await fetch('/api/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requests[0].id, status: 'played' }),
      })
      await mutateRequests()
      // Note: requests array here is still the old one in closure.
      // If there was only 1 request, go back to playlist.
      if (requests.length <= 1) setPlayMode('playlist')
    } else {
      if (requests.length > 0) {
        // Pending requests wait until playlist song ends
        setPlayMode('request')
      } else {
        const next = isShuffle
          ? Math.floor(Math.random() * playlistSongs.length)
          : (currentIndex + 1) % (playlistSongs.length || 1)
        setCurrentIndex(next)
      }
    }
  }, [playMode, requests, playlistSongs.length, currentIndex, isShuffle, mutateRequests])

  const handlePrevious = useCallback(() => {
    if (playMode === 'playlist') {
      const prev = isShuffle
        ? Math.floor(Math.random() * playlistSongs.length)
        : (currentIndex - 1 + playlistSongs.length) % (playlistSongs.length || 1)
      setCurrentIndex(prev)
    }
  }, [playMode, currentIndex, playlistSongs.length, isShuffle])

  const handleSkip = useCallback(async () => {
    if (playMode === 'request' && requests.length > 0) {
      await fetch('/api/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requests[0].id, status: 'skipped' }),
      })
      mutateRequests()
    } else {
      handleSongEnd()
    }
  }, [playMode, requests, handleSongEnd, mutateRequests])

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

  // Media Session API — update on song change
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
        // Small delay to let browser settle
        setTimeout(() => {
          playerRef.current?.play()
        }, 300)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isPlaying])

  // Wake Lock API — prevent screen from sleeping on player page
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null

    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && isPlaying) {
        try {
          wakeLock = await (navigator as Navigator & { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock.request('screen')
        } catch {
          // Wake lock not supported or denied - continue without it
        }
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

    // Re-acquire after visibility change
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isPlaying) {
        requestWakeLock()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      releaseWakeLock()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [isPlaying])

  return (
    <PlayerContext.Provider value={{
      isPlaying, currentSong, playMode, volume, isMuted, isShuffle, isVideoMode,
      currentIndex, requests, playlistSongs,
      togglePlay, handleSkip, handlePrevious, handleVolumeChange,
      toggleMute, toggleShuffle, handleSongEnd, setIsPlaying, setIsVideoMode,
      playerRef,
    }}>
      {children}
    </PlayerContext.Provider>
  )
}

// Type for WakeLockSentinel (not in all TS libs)
interface WakeLockSentinel {
  release: () => Promise<void>
}
