export interface Playlist {
  id: number
  name: string
  description: string | null
  is_default: boolean
  is_enabled: boolean
  song_count?: number
  cover_thumbnail?: string | null
  created_at: string
  updated_at: string
}

export interface PlaylistSong {
  id: number
  playlist_id: number
  youtube_id: string
  title: string
  thumbnail: string | null
  duration: string | null
  artist: string | null
  position: number
  created_at: string
}

export interface SongRequest {
  id: number
  youtube_id: string
  title: string
  thumbnail: string | null
  duration: string | null
  requested_by: string | null
  device_id: string | null
  status: 'pending' | 'playing' | 'played' | 'skipped'
  played_at: string | null
  created_at: string
}

export interface YouTubeSearchResult {
  id: string
  title: string
  thumbnail: string
  channelTitle: string
  duration?: string
}

export interface YouTubePlaylistResult {
  id: string
  title: string
  thumbnail: string
  channelTitle: string
  itemCount: number
}

export interface PlayerState {
  isPlaying: boolean
  currentSong: PlaylistSong | SongRequest | null
  currentIndex: number
  volume: number
  playMode: 'playlist' | 'request'
  shuffle: boolean
  selectedPlaylists: number[]
}

export interface QueueItem {
  type: 'request' | 'playlist'
  song: PlaylistSong | SongRequest
  playlistName?: string
}
