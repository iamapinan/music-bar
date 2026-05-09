'use client'

import { useState } from 'react'
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Music2, Shuffle, Maximize2, Minimize2, ListMusic
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { usePlayer } from '@/context/player-context'
import type { SongRequest } from '@/lib/types'

export function PlayerView() {
  const {
    isPlaying, currentSong, playMode, volume, isMuted, isShuffle, isVideoMode, isAutoPlayEnabled,
    isFullscreen, currentTime, duration, playerRef,
    requests, playlistSongs,
    togglePlay, handleSkip, handlePrevious, handleVolumeChange,
    toggleMute, toggleShuffle, setIsVideoMode, setIsAutoPlayEnabled, setIsFullscreen
  } = usePlayer()

  const [showSidebar, setShowSidebar] = useState(true)
  const [isDraggingTime, setIsDraggingTime] = useState(false)
  const [dragTime, setDragTime] = useState(0)

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const displayTime = isDraggingTime ? dragTime : currentTime

  if (!currentSong) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100dvh-4rem)] text-center p-6">
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30">
            <Music2 className="w-14 h-14 text-primary/60" />
          </div>
          <div className="absolute inset-0 w-28 h-28 rounded-full bg-primary/10 animate-ping" />
        </div>
        <h2 className="text-xl font-semibold mb-2 gradient-text">ยังไม่มีเพลง</h2>
        <p className="text-muted-foreground text-sm">เพิ่มเพลงใน playlist หรือรอให้ลูกค้าขอเพลง</p>
      </div>
    )
  }

  const QueueContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border/50 bg-background/95 backdrop-blur z-10 shrink-0">
        <ListMusic className="w-5 h-5 text-primary" />
        <span className="font-semibold">คิวเพลง</span>
        {requests.length > 0 && (
          <Badge variant="secondary" className="ml-auto text-xs px-2 h-6 bg-accent/10 text-accent border-accent/20">
            {requests.length} คำขอ
          </Badge>
        )}
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-2 pr-3">
          {/* Now Playing */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20 shadow-sm">
            <div className="flex-shrink-0 w-6 flex items-center justify-center">
              {isPlaying ? (
                <div className="playing-bars scale-75">
                  <div className="playing-bar" />
                  <div className="playing-bar" />
                  <div className="playing-bar" />
                </div>
              ) : (
                <Music2 className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-primary">{currentSong.title}</p>
              <p className="text-xs text-primary/70 mt-0.5">กำลังเล่น</p>
            </div>
          </div>

          {/* Pending requests */}
          {requests.slice(1).map((req, i) => (
            <QueueItem key={`req-${req.id}`} title={req.title} position={i + 1} type="request" badge={req.requested_by || 'ลูกค้า'} />
          ))}

          {/* Playlist */}
          {playlistSongs.map((song, i) => (
            <QueueItem key={`pl-${song.id}-${i}`} title={song.title} position={requests.length + i} type="playlist" />
          ))}

          {requests.length === 0 && playlistSongs.length === 0 && (
            <p className="text-center py-10 text-muted-foreground text-sm">ไม่มีเพลงในคิว</p>
          )}
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <div className={cn(
      'flex overflow-hidden transition-all duration-300',
      isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'h-[calc(100dvh-4rem)]'
    )}>
      {/* Main Player Area */}
      <div className="flex-1 flex flex-col relative min-w-0 bg-gradient-to-b from-background to-background/50">
        {/* Fullscreen header */}
        {isFullscreen && (
          <div className="flex items-center justify-between p-4 glass border-b border-border/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Music2 className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold gradient-text">Music Bar</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(false)} className="rounded-full hover:bg-white/10">
              <Minimize2 className="w-5 h-5" />
            </Button>
          </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 min-h-0 overflow-y-auto">
          <div className="w-full max-w-[420px] flex flex-col items-center">
            
            {/* Artwork / Thumbnail / Video Target */}
            <div className={cn(
              "relative w-full aspect-square overflow-hidden shadow-2xl border border-white/5 mb-8 group bg-black/50 transition-all duration-500",
              (isFullscreen && isVideoMode) 
                ? "fixed inset-0 z-[60] w-screen h-screen max-w-none rounded-none m-0 border-none" 
                : "rounded-2xl sm:rounded-[2rem]"
            )}>
              <div id="video-target-rect" className="w-full h-full absolute inset-0" />
              
              {!isVideoMode && (
                currentSong.thumbnail ? (
                  <img
                    src={currentSong.thumbnail}
                    alt={currentSong.title}
                    className={cn(
                      "w-full h-full object-cover transition-transform duration-700",
                      isPlaying ? "scale-105" : "scale-100 grayscale-[0.2]"
                    )}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-card">
                    <Music2 className="w-24 h-24 text-muted-foreground/30" />
                  </div>
                )
              )}
              
              {!isVideoMode && <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />}
              
              <button
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 z-10"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5 text-white" /> : <Maximize2 className="w-5 h-5 text-white" />}
              </button>
              
              <button
                className="absolute top-4 left-4 h-10 px-3 rounded-full bg-black/40 backdrop-blur-md flex items-center gap-1.5 justify-center hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 z-10"
                onClick={() => setIsVideoMode(!isVideoMode)}
              >
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-medium text-white">{isVideoMode ? 'Music' : 'Video'}</span>
              </button>
            </div>

            {/* Song Info */}
            <div className="w-full text-center mb-8 px-2">
              <div className="flex items-center justify-center gap-2 mb-3">
                {playMode === 'request' && (
                  <Badge className="bg-accent/20 text-accent border-accent/30 text-xs px-2.5 py-0.5 rounded-full">
                    คิวเพลงขอ
                  </Badge>
                )}
                {isShuffle && (
                  <Badge variant="outline" className="text-xs px-2.5 py-0.5 border-primary/40 text-primary rounded-full">
                    สุ่ม
                  </Badge>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold line-clamp-2 leading-tight tracking-tight text-foreground mb-2">
                {currentSong.title}
              </h2>
              <p className="text-base text-muted-foreground font-medium">
                {'requested_by' in currentSong && (currentSong as SongRequest).requested_by 
                  ? `ขอโดย: ${(currentSong as SongRequest).requested_by}`
                  : 'Music Bar Playlist'
                }
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full px-4 mb-6">
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
                className="cursor-pointer mb-2"
              />
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium px-1">
                <span>{formatTime(displayTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Volume & Autoplay Controls */}
            <div className="w-full flex items-center gap-6 mb-8 px-4">
              <div className="flex items-center gap-2 shrink-0">
                <Switch 
                  id="autoplay-mode" 
                  checked={isAutoPlayEnabled} 
                  onCheckedChange={setIsAutoPlayEnabled}
                  className="data-[state=checked]:bg-primary"
                />
                <label htmlFor="autoplay-mode" className="text-xs font-medium text-muted-foreground cursor-pointer">
                  Autoplay
                </label>
              </div>

              <div className="flex-1 flex items-center gap-3">
                <Button size="icon" variant="ghost" className="w-10 h-10 rounded-full hover:bg-white/5 shrink-0" onClick={toggleMute}>
                  {isMuted
                    ? <VolumeX className="w-5 h-5 text-muted-foreground" />
                    : <Volume2 className="w-5 h-5 text-muted-foreground" />
                  }
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="flex-1 cursor-pointer"
                />
              </div>
            </div>

            {/* Playback Controls */}
            <div className="w-full flex items-center justify-between px-2 sm:px-6">
              <Button
                size="icon"
                variant="ghost"
                className={cn('w-12 h-12 rounded-full transition-colors', isShuffle ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground')}
                onClick={toggleShuffle}
                title="สุ่มเพลง"
              >
                <Shuffle className="w-5 h-5" />
              </Button>

              <div className="flex items-center gap-4 sm:gap-6">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handlePrevious}
                  className="w-14 h-14 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                  disabled={playMode === 'request'}
                >
                  <SkipBack className="w-7 h-7" />
                </Button>

                <Button
                  size="icon"
                  onClick={togglePlay}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_40px_-10px] shadow-primary transition-all hover:scale-105 active:scale-95"
                >
                  {isPlaying ? <Pause className="w-10 h-10 sm:w-12 sm:h-12" /> : <Play className="w-10 h-10 sm:w-12 sm:h-12 ml-1.5" />}
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleSkip}
                  className="w-14 h-14 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                >
                  <SkipForward className="w-7 h-7" />
                </Button>
              </div>

              {/* Desktop Toggle Sidebar */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowSidebar(!showSidebar)} 
                className={cn(
                  "hidden lg:flex w-12 h-12 rounded-full transition-colors",
                  showSidebar ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <ListMusic className="w-5 h-5" />
              </Button>

              {/* Mobile/Tablet Toggle Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="flex lg:hidden w-12 h-12 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5"
                  >
                    <ListMusic className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh] p-0 border-t-2 border-primary/20 sm:h-[100vh] sm:max-w-md sm:side-right sm:border-l-2">
                  <SheetTitle className="sr-only">Queue</SheetTitle>
                  <QueueContent />
                </SheetContent>
              </Sheet>
            </div>

          </div>
        </div>
      </div>

      {/* Desktop Sidebar Panel */}
      {showSidebar && (
        <div className="hidden lg:flex flex-col w-[380px] shrink-0 border-l border-border/50 bg-card/40 backdrop-blur-md">
          <QueueContent />
        </div>
      )}
    </div>
  )
}

function QueueItem({ title, position, type, badge }: {
  title: string; position: number; type: 'request' | 'playlist'; badge?: string
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card/60 hover:bg-card border border-transparent hover:border-border/50 transition-all group">
      <span className="text-xs font-medium text-muted-foreground w-6 text-center tabular-nums">{position}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{title}</p>
        {badge && <p className="text-xs text-muted-foreground mt-0.5">ขอโดย: {badge}</p>}
      </div>
      {type === 'request' && (
        <Badge variant="outline" className="text-[10px] h-5 px-2 bg-accent/5 border-accent/30 text-accent flex-shrink-0 rounded-full">ขอ</Badge>
      )}
    </div>
  )
}
