# รายการงานระบบสลับสไลด์บาร์และแนะนำคีย์เวิร์ดเพลย์ลิสต์ (Toggle Slide Bar & Local Suggestions Tasks)

- [x] ปรับปรุง Player Context (`context/player-context.tsx`)
    - [x] เพิ่ม `showPlaylistRail` และ `setShowPlaylistRail` ใน interface `PlayerContextValue`
    - [x] ประกาศสถานะ `showPlaylistRail` พร้อมการโหลดและเซฟค่าจาก `localStorage`
    - [x] ส่งค่าสถานะผ่าน `PlayerContext.Provider`
- [x] ปรับปรุงแถบควบคุมเพลงด้านล่าง (`components/player-bottom-bar.tsx`)
    - [x] ดึงสถานะ `showPlaylistRail` และ `setShowPlaylistRail` จาก `usePlayer()`
    - [x] เพิ่มสวิตช์ Toggle สำหรับซ่อน/แสดงแถบสไลด์ในพื้นที่แผงควบคุมผู้ดูแลระบบ
    - [x] เชื่อมโยงสถานะเพื่อควบคุมการแสดงผลของ `playlistRail`
- [x] เพิ่มคำแนะนำค้นหาในแผงจัดการ (`components/admin-view.tsx`)
    - [x] ดึงรายการชื่อเพลย์ลิสต์ทั้งหมดที่มีอยู่ในระบบ
    - [x] แสดงปุ่มแนะนำ (Suggestions) ในหน้าค้นหา YouTube Playlist
    - [x] ตรวจสอบให้การกดปุ่มแนะนำกรอกข้อมูลลงช่องสืบค้นได้ทันที
- [x] การตรวจสอบและบันทึกประวัติ
    - [x] ทดสอบ compile และรัน typecheck ผ่าน `tsc`
    - [x] บันทึกการพัฒนาลงใน `CHANGELOG.md`
    - [x] ทำการ Git commit ผลงานทั้งหมด
