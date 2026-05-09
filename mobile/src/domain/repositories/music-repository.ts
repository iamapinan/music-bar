import { Track } from '../entities/track';

export interface IMusicRepository {
  getSongsByPlaylist(playlistId: string): Promise<Track[]>;
  getPendingRequests(): Promise<Track[]>;
  updateRequestStatus(requestId: string, status: 'played' | 'pending' | 'canceled'): Promise<void>;
  getDefaultPlaylistId(): Promise<string>;
}
