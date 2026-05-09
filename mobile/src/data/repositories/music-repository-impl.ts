import { IMusicRepository } from '../../domain/repositories/music-repository';
import { Track } from '../../domain/entities/track';
import { API_CONFIG } from '../../config/api';

export class MusicRepositoryImpl implements IMusicRepository {
  async getSongsByPlaylist(playlistId: string): Promise<Track[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SONGS(playlistId)}`);
      if (!response.ok) return [];
      const data = await response.json();
      return this.mapToTracks(data);
    } catch (error) {
      console.error('Error fetching playlist songs:', error);
      return [];
    }
  }

  async getPendingRequests(): Promise<Track[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REQUESTS}`);
      if (!response.ok) return [];
      const data = await response.json();
      return this.mapToTracks(data);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      return [];
    }
  }

  async updateRequestStatus(requestId: string, status: 'played' | 'pending' | 'canceled'): Promise<void> {
    try {
      await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REQUESTS}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requestId, status }),
      });
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  }

  async getDefaultPlaylistId(): Promise<string> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PLAYLISTS}`);
      const playlists = await response.json();
      const defaultPlaylist = playlists.find((p: any) => p.is_default) || playlists[0];
      return String(defaultPlaylist?.id || '1');
    } catch {
      return '1';
    }
  }

  private mapToTracks(data: any[]): Track[] {
    return data.map(item => {
      // หมายเหตุ: การเล่นเพลง YouTube ในพื้นหลังบนมือถือจำเป็นต้องใช้ Direct Audio URL
      // ในที่นี้ผมจะใช้ลิงก์จาก API ของคุณ และแปลง youtube_id เป็นโครงสร้างที่เหมาะสม
      return {
        id: String(item.id),
        // ใช้บริการภายนอกหรือ Proxy ในการดึง Audio Stream
        url: `https://cobalt.tools/api/json?url=https://www.youtube.com/watch?v=${item.youtube_id}&downloadMode=audio`, 
        // หมายเหตุ: ลิงก์ด้านบนเป็นเพียงตัวอย่างการเข้าถึงข้อมูลเสียง คุณอาจต้องมีระบบดึงลิงก์ของตัวเอง
        title: item.title,
        artist: item.artist || (item.requested_by ? `Requested by ${item.requested_by}` : 'Music Bar'),
        artwork: item.thumbnail || 'https://picsum.photos/800/800',
        duration: item.duration,
      };
    });
  }
}
