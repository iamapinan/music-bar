# แผนงานการเปิด/ปิดสไลด์บาร์เพลย์ลิสต์และการเพิ่มคำแนะนำในการค้นหา (Toggle Slide Bar & Local Related Suggestions Plan)

แผนงานนี้มีเป้าหมายเพื่อเพิ่มความยืดหยุ่นในการแสดงผลสไลด์บาร์เพลย์ลิสต์ที่ด้านล่างของเครื่องเล่นเพลง และเพิ่มระบบแนะนำคีย์เวิร์ดอัจฉริยะในหน้าค้นหาเพลย์ลิสต์จาก YouTube โดยใช้ชื่อเพลย์ลิสต์ที่มีอยู่แล้วในระบบ

---

## 🛠️ รายการเปลี่ยนแปลงที่เสนอ (Proposed Changes)

### 1. โครงสร้างสถานะเครื่องเล่น (Player State & Context)

#### 📂 [MODIFY] [player-context.tsx](file:///Users/apinan/Developments/music-bar/context/player-context.tsx)
- เพิ่มตัวแปรสถานะ `showPlaylistRail` (ประเภท `boolean`) เพื่อควบคุมการซ่อน/แสดงแถบสไลด์บาร์เพลย์ลิสต์
- เพิ่มฟังก์ชัน `setShowPlaylistRail` ใน Context Value
- มีการจัดเก็บสถานะ `showPlaylistRail` ลงใน `localStorage` เพื่อรักษาสถานะเมื่อผู้ใช้รีเฟรชหน้าเว็บ (ค่าเริ่มต้น: `true`)

---

### 2. แถบเครื่องเล่นเพลงด้านล่าง (Bottom Playback Bar)

#### 📂 [MODIFY] [player-bottom-bar.tsx](file:///Users/apinan/Developments/music-bar/components/player-bottom-bar.tsx)
- ดึงสถานะ `showPlaylistRail` และ `setShowPlaylistRail` จาก `usePlayer()`
- เพิ่มสวิตช์ Toggle "แสดงแถบสไลด์ / ซ่อนแถบสไลด์" ในส่วนแผงควบคุมฝั่งขวา (สำหรับผู้ดูแลระบบเมื่อเข้าหน้า `/admin`)
- ปรับเงื่อนไขการแสดงผล `playlistRail` ให้ขึ้นอยู่กับสถานะ `showPlaylistRail` ด้วย (ถ้าเปิดสวิตช์และเงื่อนไขอื่นๆ ครบจึงจะแสดง)

---

### 3. หน้าผู้ดูแลระบบและการค้นหา (Admin View & Youtube Playlist Search)

#### 📂 [MODIFY] [admin-view.tsx](file:///Users/apinan/Developments/music-bar/components/admin-view.tsx)
- ในหน้าค้นหา YouTube Playlist (แท็บค้นหา เมื่อเลือกประเภทเป็น "เพลย์ลิสต์ YouTube") เพิ่มระบบดึงชื่อของ Local Playlists (เพลย์ลิสต์ในเครื่อง) มาแสดงเป็นปุ่มแนะนำ (Suggestions)
- เมื่อคลิกที่ปุ่มชื่อเพลย์ลิสต์แนะนำ ระบบจะทำการกรอกคีย์เวิร์ดคำนั้นลงในช่องค้นหาทันที ช่วยเพิ่มความสะดวกในการค้นหาเพลย์ลิสต์แนวเพลงเดียวกันบน YouTube

---

## 🧪 แผนการตรวจสอบและทดสอบ (Verification Plan)

### การทดสอบแบบอัตโนมัติ (Automated Tests)
- ตรวจสอบไวยากรณ์และการ Type Checking ของ TypeScript หลังการเพิ่ม State ใหม่:
  ```bash
  npx tsc --noEmit --noUnusedLocals --noUnusedParameters
  ```

### การตรวจสอบด้วยตนเอง (Manual Verification)
- **สไลด์บาร์เพลย์ลิสต์**:
  1. ไปที่หน้าผู้ดูแลระบบ `/admin` 
  2. ทดสอบเลื่อนสวิตช์ "ซ่อนแถบสไลด์" บนแผงควบคุมเครื่องเล่นด้านล่าง และยืนยันว่าแถบ `playlistRail` ได้หายไปจากหน้าจอจริง
  3. ทดสอบสลับกลับเป็น "แสดงแถบสไลด์" และยืนยันว่าสไลด์บาร์เพลย์ลิสต์ปรากฏขึ้นมาใหม่
- **การค้นหาแนะนำ**:
  1. ไปที่แท็บค้นหาในหน้า `/admin`
  2. เลือกหมวดค้นหาเป็น "เพลย์ลิสต์ YouTube"
  3. ตรวจสอบว่ามีรายการปุ่มแนะนำชื่อตามเพลย์ลิสต์ที่ร้านมีอยู่แสดงขึ้นมาใต้ช่องค้นหา
  4. ทดสอบกดปุ่มแนะนำ และดูว่าคำถูกนำไปใส่ในช่องค้นหาพร้อมค้นหาได้อย่างถูกต้อง
