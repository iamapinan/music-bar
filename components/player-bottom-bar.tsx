'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Music2, Shuffle, ListMusic, LayoutDashboard, Home, Tv, Maximize2, Minimize2, MoreVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePlayer } from '@/context/player-context'
import { QueueList } from './queue-list'
import { cn } from '@/lib/utils'

export function PlayerBottomBar() {
  const {
    isPlaying, currentSong, volume, isMuted, isShuffle,
    currentTime, duration, playerRef,
    togglePlay, handleSkip, handlePrevious, handleVolumeChange,
    toggleMute, toggleShuffle, isAutoPlayEnabled, setIsAutoPlayEnabled,
    playMode, isVideoMode, setIsVideoMode, isFullscreen, setIsFullscreen,
    isRequestsEnabled, setIsRequestsEnabled, showControls,
    playlists, activePlaylistIds, setActivePlaylistIds
  } = usePlayer()

  const pathname = usePathname()
  const [isDraggingTime, setIsDraggingTime] = useState(false)
  const [dragTime, setDragTime] = useState(0)

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const displayTime = isDraggingTime ? dragTime : currentTime
  const enabledPlaylists = playlists.filter(playlist => playlist.is_enabled)
  const activePlaylistKey = activePlaylistIds.join(',')

  const activePlaylistCardRef = useRef<HTMLButtonElement | null>(null)
  const playlistRailRef = useRef<HTMLDivElement | null>(null)
  const playlistDriftIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const playlistDriftDirectionRef = useRef(1)
  const playlistDriftPausedRef = useRef(false)
  const playlistDriftResumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    activePlaylistCardRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }, [activePlaylistKey])

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

  const playlistRail = pathname !== '/admin' && enabledPlaylists.length > 0 && (
    <div className={cn(
      "border-b border-white/10 py-2 backdrop-blur-3xl",
      pathname === '/admin' ? "bg-[#07120f]/95" : "bg-black/10"
    )}>
      <div
        ref={setPlaylistRailRef}
        className="playlist-card-rail scrollbar-none flex items-center gap-2 overflow-x-auto px-[calc(50%-5.25rem)] sm:gap-3 sm:px-[calc(50%-6rem)]"
        onPointerDown={() => pausePlaylistDrift()}
        onTouchStart={() => pausePlaylistDrift()}
        onWheel={() => pausePlaylistDrift()}
      >
        {enabledPlaylists.map(playlist => {
          const isActive = activePlaylistIds.includes(playlist.id)
          const firstLetter = playlist.name.slice(0, 1).toUpperCase()
          const gradients = [
            'from-emerald-500 to-teal-700 text-emerald-100',
            'from-cyan-500 to-blue-700 text-cyan-100',
            'from-indigo-500 to-purple-700 text-indigo-100',
            'from-violet-500 to-fuchsia-700 text-violet-100',
            'from-rose-500 to-orange-700 text-rose-100',
          ]
          const gradClass = gradients[playlist.id % gradients.length]

          return (
            <button
              key={playlist.id}
              ref={isActive ? activePlaylistCardRef : undefined}
              type="button"
              onClick={() => setActivePlaylistIds(isActive ? [] : [playlist.id])}
              className={cn(
                'group flex h-16 shrink-0 items-center gap-2.5 rounded-2xl border px-2.5 text-left transition-all duration-300 active:scale-[0.98] sm:h-[4.5rem] sm:gap-3 sm:px-3',
                isActive
                  ? 'w-[10.5rem] border-primary/45 bg-primary/15 text-primary shadow-[0_8px_28px_rgba(16,185,129,0.2)] ring-1 ring-primary/15 sm:w-48'
                  : 'w-[8.75rem] scale-[0.92] border-white/10 bg-white/[0.035] text-white/55 hover:border-white/20 hover:bg-white/[0.07] hover:text-white/85 sm:w-40'
              )}
              aria-pressed={isActive}
            >
              {playlist.cover_thumbnail ? (
                <img
                  src={playlist.cover_thumbnail}
                  alt=""
                  className={cn('h-11 w-11 shrink-0 rounded-xl border border-white/10 object-cover shadow-md transition-all sm:h-12 sm:w-12', isActive && 'sm:h-14 sm:w-14')}
                />
              ) : (
                <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold shadow-md transition-all sm:h-12 sm:w-12', isActive && 'sm:h-14 sm:w-14', gradClass)}>
                  {firstLetter}
                </div>
              )}
              <span className="min-w-0">
                <span className="block text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  {isActive ? 'Playing' : 'Playlist'}
                </span>
                <span className="mt-1 block truncate text-xs font-semibold leading-none sm:text-sm">{playlist.name}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )

  if (!currentSong) {
    return (
      <div className={cn(
        "fixed right-0 bottom-0 left-0 z-[100] border-t border-white/10 bg-background/25 shadow-[0_-18px_70px_rgba(0,0,0,0.28)] backdrop-blur-3xl",
        pathname === '/admin' && "admin-player-dock"
      )}>
        {playlistRail}
      </div>
    )
  }

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-[100] transition-all duration-500",
      (pathname === '/' && isVideoMode && isFullscreen && !showControls) ? "translate-y-24 opacity-0 pointer-events-none" : "translate-y-0 opacity-100 pointer-events-auto"
    )}>
      <div className={cn(
        "player-ambient pointer-events-auto relative w-full overflow-hidden border-t border-white/10 bg-background/35 shadow-[0_-18px_70px_rgba(0,0,0,0.32)] backdrop-blur-3xl",
        pathname === '/admin' && "admin-player-dock"
      )}>
        {playlistRail}
        
        {/* Progress Bar (Integrated at top) */}
        <div className="group absolute right-0 bottom-[4.5rem] left-0 z-10 h-1 cursor-pointer transition-all hover:h-1.5 sm:bottom-24">
          <Slider
            value={[displayTime]}
            max={duration || 100}
            step={1}
            onValueChange={(vals) => {
              setIsDraggingTime(true)
              setDragTime(vals[0])
            }}
            onValueCommit={(vals) => {
              setIsDraggingTime(false)
              playerRef.current?.seekTo(vals[0])
            }}
            className="w-full absolute inset-0 opacity-0 group-hover:opacity-100 z-10 transition-opacity"
          />
          <div className="absolute inset-0 bg-primary/10">
            <div 
              className="h-full bg-primary transition-all duration-100" 
              style={{ width: `${(displayTime / (duration || 1)) * 100}%` }} 
            />
          </div>
        </div>

        <div className="relative z-10 flex h-[4.5rem] items-center justify-between gap-1 px-2.5 sm:h-24 sm:gap-4 sm:px-4">
          
          {/* Left: Navigation & Song Info */}
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
            <div className="hidden lg:flex items-center gap-1 border-r border-white/10 pr-4 mr-2">
              <Link href="/">
                <Button variant="ghost" size="icon" className={cn("w-10 h-10 rounded-full", pathname === '/' && "bg-primary/10 text-primary")}>
                  <Home className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="ghost" size="icon" className={cn("w-10 h-10 rounded-full", pathname === '/admin' && "bg-primary/10 text-primary")}>
                  <LayoutDashboard className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            <div className="relative group shrink-0">
              <div className="h-10 w-10 overflow-hidden rounded border border-white/10 bg-muted sm:h-16 sm:w-16">
                {currentSong.thumbnail ? (
                  <img src={currentSong.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music2 className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-base font-bold truncate text-foreground leading-tight">
                {currentSong.title}
              </h3>
              <p className="text-[9px] sm:text-xs text-muted-foreground font-medium mt-0.5 truncate uppercase tracking-wider">
                {'requested_by' in currentSong 
                  ? `${currentSong.requested_by || 'ลูกค้า'}` 
                  : 'Playlist'}
              </p>
            </div>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex shrink-0 flex-col items-center gap-1 px-0.5 sm:px-2">
            <div className="flex items-center gap-1 sm:gap-6">
              <Button
                size="icon"
                variant="ghost"
                onClick={handlePrevious}
                className="hidden sm:flex w-10 h-10 rounded-full text-muted-foreground hover:text-foreground disabled:opacity-30"
                disabled={playMode === 'request'}
              >
                <SkipBack className="w-5 h-5" />
              </Button>

              <Button
                size="icon"
                onClick={togglePlay}
                className="h-11 w-11 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/15 transition-all hover:scale-105 active:scale-95 sm:h-14 sm:w-14"
              >
                {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />}
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={handleSkip}
                className="w-10 h-10 rounded-full text-muted-foreground hover:text-foreground"
              >
                <SkipForward className="w-5 h-5" />
              </Button>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
              <span>{formatTime(displayTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Extra Controls */}
          <div className="flex flex-1 items-center justify-end gap-0 sm:gap-4">
            
            {/* Desktop Only Controls */}
            <div className="hidden lg:flex items-center gap-3">
               {/* Requests Toggle (Admin Only) */}
              {pathname === '/admin' && (
                <div className="flex items-center gap-2 mr-4 pr-4 border-r border-white/10">
                  <Switch 
                    checked={isRequestsEnabled} 
                    onCheckedChange={setIsRequestsEnabled}
                    className="scale-75 data-[state=checked]:bg-accent"
                  />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                    {isRequestsEnabled ? 'เปิดรับเพลง' : 'ปิดรับเพลง'}
                  </span>
                </div>
              )}

              {/* Autoplay Switch */}
              <div className="flex items-center gap-2 mr-2">
                <Switch 
                  checked={isAutoPlayEnabled} 
                  onCheckedChange={setIsAutoPlayEnabled}
                  className="scale-75"
                />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Auto</span>
              </div>

              <Button
                size="icon"
                variant="ghost"
                className={cn('w-10 h-10 rounded-full', isVideoMode ? 'text-primary bg-primary/10' : 'text-muted-foreground')}
                onClick={() => setIsVideoMode(!isVideoMode)}
              >
                <Tv className="w-4 h-4" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className={cn('w-10 h-10 rounded-full', isFullscreen ? 'text-primary bg-primary/10' : 'text-muted-foreground')}
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className={cn('w-10 h-10 rounded-full', isShuffle ? 'text-primary bg-primary/10' : 'text-muted-foreground')}
                onClick={toggleShuffle}
              >
                <Shuffle className="w-4 h-4" />
              </Button>

              {/* Volume */}
              <div className="flex items-center gap-2 w-24 lg:w-32 mr-2">
                <Button size="icon" variant="ghost" className="w-8 h-8 rounded-full shrink-0" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  className="flex-1 cursor-pointer"
                />
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-primary/10 text-primary hover:bg-primary/15"
                    title="เปิดคิวเพลง"
                  >
                    <ListMusic className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md p-0 border-l border-white/10 z-[130]">
                  <SheetTitle className="sr-only">คิวเพลง</SheetTitle>
                  <QueueList />
                </SheetContent>
              </Sheet>
            </div>

            {/* Mobile/Tablet "More" Menu & Primary Actions */}
            <div className="flex items-center gap-0.5 sm:gap-2 lg:hidden">
              {/* Video Toggle (Always useful) */}
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("hidden h-9 w-9 rounded-full min-[390px]:flex sm:h-10 sm:w-10", isVideoMode && "text-primary bg-primary/10")}
                onClick={() => setIsVideoMode(!isVideoMode)}
              >
                <Tv className="w-4 h-4" />
              </Button>

              {/* More Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full sm:h-10 sm:w-10">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 glass backdrop-blur-xl border-white/10 z-[120]">
                  <DropdownMenuItem onClick={() => setIsFullscreen(!isFullscreen)} className="flex items-center gap-2 py-3">
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    <span>{isFullscreen ? 'ย่อหน้าจอ' : 'ขยายเต็มจอ'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={toggleShuffle} className="flex items-center gap-2 py-3">
                    <Shuffle className={cn("w-4 h-4", isShuffle && "text-primary")} />
                    <span>สุ่มเพลง: {isShuffle ? 'เปิด' : 'ปิด'}</span>
                  </DropdownMenuItem>
                  <div className="h-px bg-white/10 my-1" />
                  <Link href="/">
                    <DropdownMenuItem className="flex items-center gap-2 py-3">
                      <Home className="w-4 h-4" />
                      <span>หน้าหลัก</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/admin">
                    <DropdownMenuItem className="flex items-center gap-2 py-3">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>หลังบ้าน (Admin)</span>
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Playlist (Main Mobile Action) */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="ml-0.5 h-10 w-10 rounded-full bg-primary/10 text-primary hover:bg-primary/15 sm:ml-1 sm:h-12 sm:w-12"
                  >
                    <ListMusic className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md p-0 border-l border-white/10 z-[130]">
                  <SheetTitle className="sr-only">คิวเพลง</SheetTitle>
                  <QueueList />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
