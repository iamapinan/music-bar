export interface Playlist {
  id: number
  tenant_id?: string
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
  tenant_id?: string
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
  tenant_id?: string
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

export interface Tenant {
  id: string
  slug: string
  name: string
  display_name: string | null
  logo_url: string | null
  is_active: boolean
}

export interface AppUser {
  id: string
  firebase_uid: string
  email: string
  name: string | null
  photo_url: string | null
  is_super_admin?: boolean
}

export interface TenantMembership {
  tenant_id: string
  role: 'owner' | 'admin' | 'staff'
  slug: string
  name: string
  display_name: string | null
  logo_url: string | null
  is_active: boolean
}

export interface AdminGrant {
  id: string
  tenant_id: string
  email: string
  role: 'owner' | 'admin' | 'staff'
  created_at: string
  tenant_name?: string
  tenant_slug?: string
  user_name?: string | null
  user_photo_url?: string | null
  user_id?: string | null
}

export interface StoreApplication {
  id: string
  store_name: string
  requested_slug: string | null
  applicant_name: string
  applicant_email: string
  phone: string | null
  notes: string | null
  status: 'pending' | 'approved' | 'rejected'
  approved_tenant_id: string | null
  approved_tenant_slug?: string | null
  reviewed_by_user_id: string | null
  reviewed_by_email?: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
}
