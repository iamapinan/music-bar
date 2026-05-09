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
import { cn } from '@/lib/utils'
import { usePlayer } from '@/context/player-context'
import type { SongRequest } from '@/lib/types'

export function PlayerView() {
  const {
    isPlaying, currentSong, playMode, volume, isMuted, isShuffle,
    requests, playlistSongs,
    togglePlay, handleSkip, handlePrevious, handleVolumeChange,
    toggleMute, toggleShuffle,
  } = usePlayer()

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showQueue, setShowQueue] = useState(false)

  if (!currentSong) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
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

  return (
    <div className={cn(
      'flex flex-col overflow-hidden',
      isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'h-[calc(100dvh-4rem)]'
    )}>
      {/* Fullscreen header */}
      {isFullscreen && (
        <div className="flex items-center justify-between p-4 glass border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Music2 className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold gradient-text">Music Bar</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(false)}>
            <Minimize2 className="w-5 h-5" />
          </Button>
        </div>
      )}

      <div className={cn('p-4 space-y-4 flex flex-col', isFullscreen ? 'flex-1' : 'flex-none')}>
        {/* Thumbnail + visual (แทน iframe ที่ถูก hide ไปแล้ว) */}
        <div className={cn(
          'relative rounded-xl overflow-hidden bg-card border border-border/30 flex-none',
          isFullscreen ? 'aspect-video w-full max-h-[40vh] mx-auto' : 'aspect-video'
        )}>
          {currentSong.thumbnail ? (
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music2 className="w-16 h-16 text-muted-foreground/40" />
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {/* Playing indicator */}
          {isPlaying && (
            <div className="absolute bottom-3 left-3">
              <div className="playing-bars">
                <div className="playing-bar" />
                <div className="playing-bar" />
                <div className="playing-bar" />
                <div className="playing-bar" />
              </div>
            </div>
          )}
          {/* Fullscreen toggle */}
          <button
            className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-white" /> : <Maximize2 className="w-4 h-4 text-white" />}
          </button>
        </div>

        {/* Song Info */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {playMode === 'request' && (
                <Badge className="bg-accent/20 text-accent border-accent/30 text-xs px-2 py-0.5">
                  คิวเพลงขอ
                </Badge>
              )}
              {isShuffle && (
                <Badge variant="outline" className="text-xs px-2 py-0.5 border-primary/40 text-primary">
                  สุ่ม
                </Badge>
              )}
            </div>
            <h2 className="text-base font-semibold line-clamp-2 leading-snug">{currentSong.title}</h2>
            {'requested_by' in currentSong && (currentSong as SongRequest).requested_by && (
              <p className="text-sm text-muted-foreground mt-0.5">
                ขอโดย: {(currentSong as SongRequest).requested_by}
              </p>
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            className={cn('w-9 h-9 flex-shrink-0', isShuffle && 'text-primary bg-primary/10')}
            onClick={toggleShuffle}
            title="สุ่มเพลง"
          >
            <Shuffle className="w-4 h-4" />
          </Button>
        </div>

        {/* Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={handlePrevious}
              className="w-11 h-11 text-muted-foreground hover:text-foreground"
              disabled={playMode === 'request'}
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button
              size="icon"
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 glow-sm transition-all hover:scale-105"
            >
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={handleSkip}
              className="w-11 h-11 text-muted-foreground hover:text-foreground"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3 px-2">
            <Button size="icon" variant="ghost" className="w-8 h-8" onClick={toggleMute}>
              {isMuted
                ? <VolumeX className="w-4 h-4 text-muted-foreground" />
                : <Volume2 className="w-4 h-4 text-muted-foreground" />
              }
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-7 text-right tabular-nums">
              {isMuted ? 0 : volume}
            </span>
          </div>
        </div>
      </div>

      {/* Queue Section - Takes remaining space */}
      <div className="flex-1 flex flex-col min-h-0 border-t border-border/50">
        <div className="flex items-center gap-2 px-4 py-3 bg-background/95 backdrop-blur z-10">
          <ListMusic className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">คิวเพลง</span>
          {requests.length > 0 && (
            <Badge variant="outline" className="text-xs h-5 px-1.5 border-accent/40 text-accent">
              {requests.length} คำขอ
            </Badge>
          )}
        </div>

        <ScrollArea className="flex-1 px-4 pb-4">
          <div className="space-y-1.5 pr-2">
            {/* Now Playing */}
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex-shrink-0 w-4 flex items-center">
                {isPlaying ? (
                  <div className="playing-bars">
                    <div className="playing-bar" />
                    <div className="playing-bar" />
                    <div className="playing-bar" />
                  </div>
                ) : (
                  <Music2 className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-primary">{currentSong.title}</p>
                <p className="text-xs text-primary/60">กำลังเล่น</p>
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
              <p className="text-center py-6 text-muted-foreground text-sm">ไม่มีเพลงในคิว</p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

function QueueItem({ title, position, type, badge }: {
  title: string; position: number; type: 'request' | 'playlist'; badge?: string
}) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-card/60 hover:bg-card transition-colors">
      <span className="text-xs text-muted-foreground w-5 text-center tabular-nums">{position}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{title}</p>
        {badge && <p className="text-xs text-muted-foreground">ขอโดย: {badge}</p>}
      </div>
      {type === 'request' && (
        <Badge variant="outline" className="text-xs h-5 px-1.5 border-accent/30 text-accent flex-shrink-0">ขอ</Badge>
      )}
    </div>
  )
}
