'use client'

import { Music2, Play, Clock, User } from 'lucide-react'
import type { PlaylistSong, SongRequest } from '@/lib/types'
import { cn } from '@/lib/utils'

interface SongItemProps {
  song: PlaylistSong | SongRequest
  isPlaying?: boolean
  showRequestedBy?: boolean
  onClick?: () => void
  actions?: React.ReactNode
}

export function SongItem({ song, isPlaying, showRequestedBy, onClick, actions }: SongItemProps) {
  const requestedBy = 'requested_by' in song ? song.requested_by : null

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg transition-all',
        isPlaying 
          ? 'bg-primary/20 glow-primary' 
          : 'bg-card hover:bg-card/80',
        onClick && 'cursor-pointer'
      )}
    >
      {/* Thumbnail */}
      <div className="relative w-14 h-14 rounded overflow-hidden flex-shrink-0 bg-muted">
        {song.thumbnail ? (
          <img
            src={song.thumbnail}
            alt={song.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music2 className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
        {isPlaying && (
          <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
            <Play className="w-6 h-6 text-primary-foreground fill-current" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-medium truncate text-sm',
          isPlaying && 'text-primary'
        )}>
          {song.title}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          {song.duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {song.duration}
            </span>
          )}
          {showRequestedBy && requestedBy && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {requestedBy}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      {actions && (
        <div className="flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}
