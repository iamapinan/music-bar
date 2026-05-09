'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Music2, Shuffle, ListMusic, LayoutDashboard, Home, Tv, Maximize2, Minimize2
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
    isRequestsEnabled, setIsRequestsEnabled, showControls
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

  if (!currentSong) return null

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 transition-all duration-500",
      (pathname === '/' && isVideoMode && isFullscreen && !showControls) ? "translate-y-24 opacity-0 pointer-events-none" : "translate-y-0 opacity-100 pointer-events-auto"
    )}>
      <div className="max-w-7xl mx-auto glass border border-white/10 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] rounded-2xl pointer-events-auto overflow-hidden bg-background/50">
        
        {/* Progress Bar (Integrated at top) */}
        <div className="absolute top-0 left-0 right-0 group px-6 h-1 hover:h-2 transition-all cursor-pointer">
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

        <div className="flex items-center justify-between gap-4 px-4 h-20 sm:h-24">
          
          {/* Left: Navigation & Song Info */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="hidden lg:flex items-center gap-1 border-r border-white/10 pr-4 mr-2">
              <Link href="/">
                <Button variant="ghost" size="icon" className={cn("w-10 h-10 rounded-xl", pathname === '/' && "bg-primary/10 text-primary")}>
                  <Home className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="ghost" size="icon" className={cn("w-10 h-10 rounded-xl", pathname === '/admin' && "bg-primary/10 text-primary")}>
                  <LayoutDashboard className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            <div className="relative group shrink-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-muted border border-white/5">
                {currentSong.thumbnail ? (
                  <img src={currentSong.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music2 className="w-6 h-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold truncate text-foreground leading-tight">
                {currentSong.title}
              </h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mt-0.5 truncate uppercase tracking-wider">
                {'requested_by' in currentSong 
                  ? `โดย: ${currentSong.requested_by || 'ลูกค้า'}` 
                  : 'Playlist'}
              </p>
            </div>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="flex items-center gap-2 sm:gap-6">
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
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
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
          <div className="flex items-center justify-end gap-2 sm:gap-4 flex-1">
            
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

            {/* Autoplay Switch (Desktop) */}
            <div className="hidden md:flex items-center gap-2 mr-2">
              <Switch 
                checked={isAutoPlayEnabled} 
                onCheckedChange={setIsAutoPlayEnabled}
                className="scale-75"
              />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Auto</span>
            </div>

            {/* Video Mode Toggle */}
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                'w-10 h-10 rounded-full hidden sm:flex', 
                isVideoMode ? 'text-primary bg-primary/10' : 'text-muted-foreground'
              )}
              onClick={() => setIsVideoMode(!isVideoMode)}
              title={isVideoMode ? 'โหมดเพลง' : 'โหมดวิดีโอ'}
            >
              <Tv className="w-4 h-4" />
            </Button>

            {/* Fullscreen Toggle */}
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                'w-10 h-10 rounded-full hidden sm:flex', 
                isFullscreen ? 'text-primary bg-primary/10' : 'text-muted-foreground'
              )}
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'ย่อหน้าจอ' : 'ขยายเต็มจอ'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>

            {/* Shuffle Toggle */}
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                'w-10 h-10 rounded-full hidden sm:flex', 
                isShuffle ? 'text-primary bg-primary/10' : 'text-muted-foreground'
              )}
              onClick={toggleShuffle}
              title="สุ่มเพลง"
            >
              <Shuffle className="w-4 h-4" />
            </Button>

            {/* Volume Control (Desktop) */}
            <div className="hidden sm:flex items-center gap-2 w-24 lg:w-32 mr-2">
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

            {/* Playlist Toggle */}
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-white/10 lg:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("w-10 h-10 rounded-xl", isVideoMode && "text-primary bg-primary/10")}
                onClick={() => setIsVideoMode(!isVideoMode)}
              >
                <Tv className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("w-10 h-10 rounded-xl", isFullscreen && "text-primary bg-primary/10")}
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
              <Link href="/">
                <Button variant="ghost" size="icon" className={cn("w-10 h-10 rounded-xl", pathname === '/' && "bg-primary/10 text-primary")}>
                  <Home className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="ghost" size="icon" className={cn("w-10 h-10 rounded-xl", pathname === '/admin' && "bg-primary/10 text-primary")}>
                  <LayoutDashboard className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <ListMusic className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md p-0 border-l border-white/10 z-[110]">
                <SheetTitle className="sr-only">คิวเพลง</SheetTitle>
                <QueueList />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  )
}
