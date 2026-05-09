# Music Bar - System Flow

## Architecture Overview

```
Next.js App (App Router)
├── Pages
│   ├── / (PlayerView)         - หน้าเล่นเพลง [Admin/Bar display]
│   ├── /request (RequestView) - หน้าขอเพลง [Customer device]
│   └── /admin (AdminView)     - หน้าจัดการ [Admin only, PIN protected]
│
├── API Routes
│   ├── /api/auth              - PIN authentication (session)
│   ├── /api/playlists         - CRUD playlists
│   ├── /api/playlists/[id]/songs    - CRUD songs in playlist
│   ├── /api/playlists/[id]/export   - Export playlist as CSV
│   ├── /api/playlists/import-youtube - Import YouTube playlist
│   ├── /api/requests          - CRUD song requests (with device_id filter)
│   └── /api/youtube/search    - Search YouTube API (video/playlist)
│
└── Database (Neon PostgreSQL)
    ├── playlists
    ├── playlist_songs
    └── song_requests
```

## Data Flow

### การเล่นเพลง (Player)
```
1. Fetch /api/requests (poll 3s) --> ถ้ามี pending requests
   └── เล่นเพลงตาม request queue (FIFO)
       └── เมื่อเพลงจบ PATCH status='played' แล้วเล่นต่อไป
   
2. ถ้าไม่มี requests --> เล่นจาก default playlist
   └── shuffle หรือ sequential ตาม state
   
3. Queue Display:
   [Now Playing] -> [Request 2] -> [Request 3] -> [Playlist songs...]
```

### การขอเพลง (Customer Request)
```
Customer device
├── สร้าง Device ID ใน localStorage (ถาวร)
├── ค้นหาเพลงผ่าน YouTube Search API
├── POST /api/requests (พร้อม device_id)
├── GET /api/requests?device_id=XXX --> ดูคิวของตัวเอง + position
└── QR Code --> URL /request สำหรับแสดงในร้าน
```

### การจัดการ Admin
```
Admin (PIN protected)
├── Playlist Tab:
│   ├── สร้าง playlist ใหม่
│   ├── ตั้ง default / enable / disable / delete
│   ├── Export เป็น CSV
│   └── Multi-select สำหรับ continuous play
│
├── Search Tab:
│   ├── ค้นหาเพลง YouTube → เพิ่มใน playlist
│   └── ค้นหา YouTube Playlist → Import ทั้ง playlist
│
└── Requests Tab:
    ├── ดูคิวทั้งหมด
    └── ลบคำขอออกได้
```

## Key Features

| Feature | Implementation |
|---------|---------------|
| Shuffle | Client-side random index, toggle state |
| Fullscreen | CSS fixed overlay, toggle state |
| Queue Display | requests.slice(1) + playlistSongs combined |
| Device Tracking | localStorage UUID, sent with POST request |
| QR Code | api.qrserver.com free API, download via blob |
| YouTube Import | Pagination loop, max 200 songs |
| CSV Export | Server-side CSV generation, Content-Disposition header |
| Multi-playlist | UI selection state (TODO: player integration) |
