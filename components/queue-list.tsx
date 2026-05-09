'use client'

import { Music2, ListMusic, X, Play } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SheetClose } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { usePlayer } from '@/context/player-context'
import { cn } from '@/lib/utils'

export function QueueList() {
  const { isPlaying, currentSong, requests, playlistSongs, currentIndex, playByIndex } = usePlayer()

  if (!currentSong) return null

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border/50 bg-background/95 backdrop-blur z-10 shrink-0">
        <ListMusic className="w-5 h-5 text-primary" />
        <span className="font-semibold">คิวเพลง</span>
        {requests.length > 0 && (
          <Badge variant="secondary" className="ml-2 text-xs px-2 h-6 bg-accent/10 text-accent border-accent/20">
            {requests.length}
          </Badge>
        )}
        
        <SheetClose asChild>
          <Button variant="ghost" size="icon" className="ml-auto w-8 h-8 rounded-full hover:bg-white/10">
            <X className="w-4 h-4 text-muted-foreground" />
          </Button>
        </SheetClose>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-none">
        <div className="space-y-2 pr-1 pb-10">
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

          {/* Pending requests (excluding now playing) */}
          {requests
            .filter(req => req.youtube_id !== currentSong.youtube_id)
            .map((req, i) => (
              <QueueItem 
                key={`req-${req.id}`} 
                title={req.title} 
                position={i + 1} 
                type="request" 
                badge={req.requested_by || 'ลูกค้า'} 
              />
            ))}

          {/* Up Next from Playlist (excluding now playing) */}
          <div className="pt-4 pb-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">ถัดไปจาก Playlist</p>
          </div>

          {playlistSongs
            .map((song, originalIndex) => ({ song, originalIndex }))
            .filter(({ originalIndex }) => originalIndex !== currentIndex)
            .map(({ song, originalIndex }, i) => {
              const pendingReqCount = requests.filter(req => req.youtube_id !== currentSong.youtube_id).length
              return (
                <QueueItem 
                  key={`pl-${song.id}-${originalIndex}`} 
                  title={song.title} 
                  position={pendingReqCount + i + 1} 
                  type="playlist"
                  onClick={() => playByIndex(originalIndex)}
                />
              )
            })}

          {requests.length <= 1 && playlistSongs.length <= 1 && !requests.some(r => r.youtube_id !== currentSong.youtube_id) && (
            <p className="text-center py-10 text-muted-foreground text-sm">ไม่มีเพลงถัดไป</p>
          )}
        </div>
      </div>
    </div>
  )
}

function QueueItem({ title, position, type, badge, onClick }: {
  title: string; position: number; type: 'request' | 'playlist'; badge?: string; onClick?: () => void
}) {
  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl bg-card/60 hover:bg-card border border-transparent hover:border-border/50 transition-all group",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <span className="text-xs font-medium text-muted-foreground w-6 text-center tabular-nums">{position}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{title}</p>
        {badge && <p className="text-xs text-muted-foreground mt-0.5">ขอโดย: {badge}</p>}
      </div>
      {type === 'request' && (
        <Badge variant="outline" className="text-[10px] h-5 px-2 bg-accent/5 border-accent/30 text-accent flex-shrink-0 rounded-full">ขอ</Badge>
      )}
      {type === 'playlist' && onClick && (
        <Play className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      )}
    </div>
  )
}
