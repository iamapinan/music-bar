import { Platform } from 'react-native';

// ในกรณีรันบน Android Emulator ให้ใช้ 10.0.2.2 เพื่อเข้าถึง localhost ของเครื่อง host
// หากรันบนเครื่องจริง ให้เปลี่ยนเป็น IP ของเครื่องคอมพิวเตอร์ในวงแลนเดียวกัน
export const API_CONFIG = {
  BASE_URL: Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000',
  ENDPOINTS: {
    PLAYLISTS: '/api/playlists',
    SONGS: (playlistId: string) => `/api/playlists/${playlistId}/songs`,
    REQUESTS: '/api/requests',
  }
};
