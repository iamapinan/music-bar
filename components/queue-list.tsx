'use client'

import { Music2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { ListMusic } from 'lucide-react'
import { usePlayer } from '@/context/player-context'
import { cn } from '@/lib/utils'

export function QueueList() {
  const { isPlaying, currentSong, requests, playlistSongs } = usePlayer()

  if (!currentSong) return null

  return (
    <div className="flex flex-col h-full bg-background">
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
            <QueueItem 
              key={`req-${req.id}`} 
              title={req.title} 
              position={i + 1} 
              type="request" 
              badge={req.requested_by || 'ลูกค้า'} 
            />
          ))}

          {/* Playlist */}
          {playlistSongs.map((song, i) => (
            <QueueItem 
              key={`pl-${song.id}-${i}`} 
              title={song.title} 
              position={requests.length + i} 
              type="playlist" 
            />
          ))}

          {requests.length === 0 && playlistSongs.length === 0 && (
            <p className="text-center py-10 text-muted-foreground text-sm">ไม่มีเพลงในคิว</p>
          )}
        </div>
      </ScrollArea>
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
