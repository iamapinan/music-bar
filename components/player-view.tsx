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
    isFullscreen, setIsVideoMode, setIsFullscreen, showControls, setShowControls,
    togglePlay
  } = usePlayer()

  if (!currentSong) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] text-center p-6">
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
    <div 
      className={cn(
        'relative flex flex-col h-[100dvh] overflow-hidden transition-all duration-300 bg-background',
        isFullscreen && 'fixed inset-0 z-50'
      )}
    >
      {/* ===== FULL-PAGE TOUCH OVERLAY (topmost, captures all taps to show controls) ===== */}
      <div 
        className="absolute inset-0 z-[80]"
        onClick={() => {
          if (!showControls) {
            setShowControls(true)
          }
        }}
        onTouchStart={() => {
          if (!showControls) {
            setShowControls(true)
          }
        }}
        style={{ pointerEvents: showControls ? 'none' : 'auto' }}
      />

      {/* Fullscreen header bar */}
      {isFullscreen && (
        <div className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-between p-4 glass border-b border-border/10 shrink-0 transition-opacity z-[100]",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
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

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative min-h-0">
        <div className="w-full h-full max-w-5xl flex flex-col items-center justify-center relative">
          
          {/* Artwork / Thumbnail / Video Target Container */}
          <div className={cn(
            "relative w-full overflow-hidden shadow-2xl border border-white/5 transition-all duration-500 bg-black/50",
            (isFullscreen && isVideoMode) 
              ? "fixed inset-0 z-[60] w-screen h-screen max-w-none aspect-auto rounded-none m-0 border-none" 
              : isVideoMode
                ? "max-w-4xl aspect-video rounded-xl sm:rounded-2xl"
              : "max-w-4xl aspect-video rounded-2xl sm:rounded-[2rem]"
          )}>
            {/* The actual target where PersistentYouTubePlayer will move the iframe */}
            <div id="video-target-rect" className="w-full h-full absolute inset-0" />

            {/* Interaction Overlay on video: toggle play when controls visible */}
            <div 
              className="absolute inset-0 z-[70] cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                if (showControls) {
                  togglePlay()
                } else {
                  setShowControls(true)
                }
              }}
            />
            
            {/* Thumbnail for Music Mode */}
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
            
            {/* Top Controls (Video/Fullscreen buttons) */}
            <div className={cn(
              "absolute inset-0 flex items-start justify-between p-4 transition-opacity z-[95] pointer-events-none",
              showControls ? "opacity-100" : "opacity-0"
            )}>
              <button
                className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center gap-1.5 justify-center hover:bg-black/60 transition-all pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsVideoMode(!isVideoMode)
                }}
                title={isVideoMode ? 'โหมดเพลง' : 'โหมดวิดีโอ'}
              >
                <div className={cn("w-2 h-2 rounded-full", isVideoMode ? "bg-red-500 animate-pulse" : "bg-white/40")} />
              </button>

              <button
                className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-all pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsFullscreen(!isFullscreen)
                }}
                title={isFullscreen ? 'ย่อหน้าจอ' : 'ขยายเต็มจอ'}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5 text-white" /> : <Maximize2 className="w-5 h-5 text-white" />}
              </button>
            </div>

            {/* Song Info Overlay (bottom of video) */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 p-6 sm:p-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity pointer-events-none z-[90]",
              showControls ? "opacity-100" : "opacity-0"
            )}>
              <div className="flex items-center gap-3 mb-3">
                {playMode === 'request' && (
                  <Badge className="bg-accent text-accent-foreground border-none text-[10px] uppercase tracking-widest px-3 py-0.5 rounded-full">
                    Song Request
                  </Badge>
                )}
                {isShuffle && (
                  <Badge variant="outline" className="text-[10px] uppercase tracking-widest px-3 py-0.5 border-white/20 text-white rounded-full bg-white/5 backdrop-blur-sm">
                    Shuffle Mode
                  </Badge>
                )}
              </div>
              <h2 className="text-2xl sm:text-4xl font-black line-clamp-2 leading-[1.1] tracking-tighter text-white drop-shadow-lg mb-2">
                {currentSong.title}
              </h2>
              <p className="text-lg sm:text-xl text-white/70 font-medium drop-shadow-md">
                {'requested_by' in currentSong && (currentSong as SongRequest).requested_by 
                  ? `Requested by: ${(currentSong as SongRequest).requested_by}`
                  : 'Music Bar Selection'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
