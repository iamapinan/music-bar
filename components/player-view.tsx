'use client'

import {
  Music2, Maximize2, Minimize2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { usePlayer } from '@/context/player-context'
import type { SongRequest } from '@/lib/types'

export function PlayerView() {
  const {
    isPlaying, currentSong, playMode, isShuffle, isVideoMode,
    isFullscreen, setIsVideoMode, setIsFullscreen
  } = usePlayer()

  if (!currentSong) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100dvh-10rem)] text-center p-6">
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
      'flex flex-col overflow-hidden transition-all duration-300',
      isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'h-[calc(100dvh-10rem)]'
    )}>
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

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 min-h-0 overflow-y-auto bg-gradient-to-b from-background to-background/50">
        <div className="w-full max-w-4xl flex flex-col items-center">
          
          {/* Artwork / Thumbnail / Video Target */}
          <div className={cn(
            "relative w-full max-w-[420px] aspect-square overflow-hidden shadow-2xl border border-white/5 mb-12 group bg-black/50 transition-all duration-500",
            (isFullscreen && isVideoMode) 
              ? "fixed inset-0 z-[60] w-screen h-screen max-w-none aspect-auto rounded-none m-0 border-none" 
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

          {/* Song Info (Main Stage) */}
          <div className="w-full text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-center gap-2 mb-6">
              {playMode === 'request' && (
                <Badge className="bg-accent/20 text-accent border-accent/30 text-[10px] uppercase tracking-widest px-4 py-1 rounded-full">
                  Song Request
                </Badge>
              )}
              {isShuffle && (
                <Badge variant="outline" className="text-[10px] uppercase tracking-widest px-4 py-1 border-primary/40 text-primary rounded-full">
                  Shuffle Mode
                </Badge>
              )}
            </div>
            <h2 className="text-4xl sm:text-6xl font-black line-clamp-2 leading-[1.1] tracking-tighter text-foreground mb-6 drop-shadow-sm">
              {currentSong.title}
            </h2>
            <p className="text-xl sm:text-2xl text-muted-foreground font-medium opacity-80 max-w-2xl mx-auto">
              {'requested_by' in currentSong && (currentSong as SongRequest).requested_by 
                ? `Requested by: ${(currentSong as SongRequest).requested_by}`
                : 'Music Bar Selection'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
