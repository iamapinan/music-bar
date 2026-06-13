'use client'

import { useCallback, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { usePlayer } from '@/context/player-context'
import type { Playlist } from '@/lib/types'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const gradients = [
  'from-emerald-500 to-teal-700 text-emerald-100',
  'from-cyan-500 to-blue-700 text-cyan-100',
  'from-indigo-500 to-purple-700 text-indigo-100',
  'from-violet-500 to-fuchsia-700 text-violet-100',
  'from-rose-500 to-orange-700 text-rose-100',
]

/**
 * Ambient visualizer bars that dance while music plays.
 * Renders animated bars with different heights and random-ish animation delays.
 */
function AmbientVisualizer({ isPlaying }: { isPlaying: boolean }) {
  const bars = useRef<number[]>([])
  if (bars.current.length === 0) {
    bars.current = Array.from({ length: 36 }, () => Math.floor(Math.random() * 80 + 20))
  }

  return (
    <div className="pointer-events-none absolute inset-0 flex items-end justify-center gap-[3px] px-4 pb-2 sm:gap-[4px] sm:pb-4">
      {bars.current.map((height, i) => (
        <span
          key={i}
          className={cn(
            'w-[2px] rounded-full transition-all duration-300 sm:w-[3px]',
            isPlaying
              ? 'bg-primary/10 opacity-60'
              : 'bg-white/[0.04] opacity-30',
          )}
          style={{
            height: `${isPlaying ? height : 20}%`,
            animation: isPlaying
              ? `visualizer-bounce ${Math.random() * 0.6 + 0.4}s ease-in-out ${i * 0.06}s infinite alternate`
              : 'none',
            transformOrigin: 'bottom',
          }}
        />
      ))}
    </div>
  )
}

/**
 * Floating particles / shimmer overlay for ambient motion.
 */
function AmbientParticles({ isPlaying }: { isPlaying: boolean }) {
  const particles = useRef<{ x: number; y: number; size: number; delay: number; duration: number }[]>([])
  if (particles.current.length === 0) {
    particles.current = Array.from({ length: 12 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 8,
      duration: Math.random() * 4 + 3,
    }))
  }

  if (!isPlaying) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.current.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-primary/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animation: `particle-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

/**
 * Premium Now-Playing Stage — replaces the old bottom-bar playlist rail.
 * Rendered as a full-width stage card on the player-view page.
 */
export function PlayerStage() {
  const {
    isPlaying,
    currentSong,
    activePlaylistIds,
    setActivePlaylistIds,
    playlists,
    showPlaylistRail,
  } = usePlayer()

  const { data: allPlaylists = [] } = useSWR<Playlist[]>('/api/playlists', fetcher)
  const enabledPlaylists = allPlaylists.filter(p => p.is_enabled)
  const activePlaylistKey = activePlaylistIds.join(',')

  const activePlaylistCardRef = useRef<HTMLButtonElement | null>(null)
  const playlistRailRef = useRef<HTMLDivElement | null>(null)
  const playlistDriftIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const playlistDriftDirectionRef = useRef(1)
  const playlistDriftPausedRef = useRef(false)
  const playlistDriftResumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Scroll active playlist into view on change
  useEffect(() => {
    activePlaylistCardRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }, [activePlaylistKey])

  // Auto-drift the playlist rail (gentle horizontal scroll)
  const setPlaylistRailRef = useCallback((rail: HTMLDivElement | null) => {
    playlistRailRef.current = rail
    if (playlistDriftIntervalRef.current) clearInterval(playlistDriftIntervalRef.current)
    if (!rail || enabledPlaylists.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    playlistDriftIntervalRef.current = setInterval(() => {
      if (!playlistDriftPausedRef.current && rail.scrollWidth > rail.clientWidth) {
        const maxScroll = rail.scrollWidth - rail.clientWidth
        const nextScroll = rail.scrollLeft + playlistDriftDirectionRef.current

        if (nextScroll >= maxScroll) playlistDriftDirectionRef.current = -1
        if (nextScroll <= 0) playlistDriftDirectionRef.current = 1
        rail.scrollLeft = Math.max(0, Math.min(maxScroll, nextScroll))
      }
    }, 60)
  }, [enabledPlaylists.length])

  const pausePlaylistDrift = (resumeDelay = 2600) => {
    playlistDriftPausedRef.current = true
    if (playlistDriftResumeTimerRef.current) clearTimeout(playlistDriftResumeTimerRef.current)
    playlistDriftResumeTimerRef.current = setTimeout(() => {
      playlistDriftPausedRef.current = false
    }, resumeDelay)
  }

  useEffect(() => {
    return () => {
      if (playlistDriftIntervalRef.current) clearInterval(playlistDriftIntervalRef.current)
      if (playlistDriftResumeTimerRef.current) clearTimeout(playlistDriftResumeTimerRef.current)
    }
  }, [])

  if (!currentSong || !showPlaylistRail || enabledPlaylists.length === 0) return null

  return (
    <div className="player-stage-surface relative mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/30 sm:mt-4">
      {/* Ambient background — thumbnail as blurred backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {currentSong.thumbnail && (
          <img
            src={currentSong.thumbnail}
            alt=""
            className="absolute inset-[-24%] h-[148%] w-[148%] scale-105 object-cover blur-3xl opacity-30 saturate-[0.7]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.08),transparent_60%)]" />
      </div>

      {/* Visualizer bars */}
      <AmbientVisualizer isPlaying={isPlaying} />

      {/* Floating particles */}
      <AmbientParticles isPlaying={isPlaying} />

      {/* Playlist Rail */}
      <div className="relative z-10 py-3 sm:py-4">
        <div className="mb-2 px-4 sm:px-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary/60">
            Playlists
          </p>
        </div>
        <div
          ref={setPlaylistRailRef}
          className="playlist-card-rail scrollbar-none flex items-center gap-2 overflow-x-auto px-4 sm:gap-3 sm:px-6"
          onPointerDown={() => pausePlaylistDrift()}
          onTouchStart={() => pausePlaylistDrift()}
          onWheel={() => pausePlaylistDrift()}
        >
          {enabledPlaylists.map(playlist => {
            const isActive = activePlaylistIds.includes(playlist.id)
            const firstLetter = playlist.name.slice(0, 1).toUpperCase()
            const gradClass = gradients[playlist.id % gradients.length]

            return (
              <button
                key={playlist.id}
                ref={isActive ? activePlaylistCardRef : undefined}
                type="button"
                onClick={() => setActivePlaylistIds(isActive ? [] : [playlist.id])}
                className={cn(
                  'group flex shrink-0 items-center gap-2.5 rounded-2xl border px-2.5 text-left transition-all duration-300 active:scale-[0.98]',
                  isActive
                    ? 'h-16 w-[10.5rem] border-primary/45 bg-primary/15 text-primary shadow-[0_8px_28px_rgba(16,185,129,0.2)] ring-1 ring-primary/15 sm:h-[4.5rem] sm:w-48'
                    : 'h-14 w-[8.75rem] scale-[0.92] border-white/10 bg-white/[0.035] text-white/55 hover:border-white/20 hover:bg-white/[0.07] hover:text-white/85 sm:h-16 sm:w-40'
                )}
                aria-pressed={isActive}
              >
                {playlist.cover_thumbnail ? (
                  <img
                    src={playlist.cover_thumbnail}
                    alt=""
                    className={cn(
                      'h-11 w-11 shrink-0 rounded-xl border border-white/10 object-cover shadow-md transition-all sm:h-12 sm:w-12',
                      isActive && 'sm:h-14 sm:w-14'
                    )}
                  />
                ) : (
                  <div
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold shadow-md transition-all sm:h-12 sm:w-12',
                      isActive && 'sm:h-14 sm:w-14',
                      gradClass
                    )}
                  >
                    {firstLetter}
                  </div>
                )}
                <span className="min-w-0">
                  <span className="block text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    {isActive ? 'Playing' : 'Playlist'}
                  </span>
                  <span className="mt-1 block truncate text-xs font-semibold leading-none sm:text-sm">
                    {playlist.name}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
