# แผนงานการเล่นเพลงทันทีจากหน้า Admin และการแสดงตัวอย่างเพลงใน YouTube Playlist ก่อนนำเข้า

แผนงานนี้มีเป้าหมายเพื่อตอบสนองความต้องการของผู้ใช้งานใน 2 ประเด็นหลัก:
1. **การกดฟังเพลงทันทีจากหน้า Admin ไปยังตัวเล่นหลัก**: อำนวยความสะดวกให้ผู้ดูแลระบบสามารถควบคุมการทดลองฟังหรือสั่งเล่นเพลงใดๆ ในเพลย์ลิสต์ เพลงจากการค้นหา หรือคำขอเพลงจากลูกค้า ไปยังเครื่องเล่นหลักของร้านได้โดยตรง
2. **การพรีวิวรายชื่อเพลงใน YouTube Playlist**: เพิ่มความสามารถให้ผู้ใช้กดตรวจสอบและดูรายชื่อเพลงที่มีอยู่ทั้งหมดภายในเพลย์ลิสต์ของ YouTube ที่ค้นหาเจอก่อนที่จะตัดสินใจกดนำเข้า (Import) เข้าสู่ระบบ พร้อมความสามารถในการกดลองเล่นเพลงเหล่านั้นจากหน้าพรีวิวได้ทันที

---

## 🛠️ รายการเปลี่ยนแปลงที่เสนอ (Proposed Changes)

### 1. ปรับปรุง Player Context (โครงสร้างการเล่นเพลง)

#### 📂 [MODIFY] [player-context.tsx](file:///Users/apinan/Developments/music-bar/context/player-context.tsx)
- เพิ่มฟังก์ชัน `playSongImmediately` ใน interface `PlayerContextValue` เพื่อสั่งเล่นเพลงใดๆ ทันที
- เพิ่มตัวแปรสถานะ `customSong` (ประเภท `PlaylistSong | SongRequest | null`) และ `customSongRef` (useRef) สำหรับเก็บเพลงพิเศษที่ผู้ดูแลระบบสั่งให้เล่นทันที (Bypassing normal queue logic)
- อัปเดต `currentSong` (computed value) ให้ตรวจสอบและส่ง `customSong` ออกไปก่อน หากมีข้อมูล
- อัปเดตฟังก์ชันสิ้นสุดเพลง `handleSongEnd` และข้ามเพลง `handleSkip`, `handlePrevious` ให้ทำการเคลียร์ค่า `customSong` เป็น `null` เมื่อเพลงจบหรือผู้ใช้กดข้าม เพื่อให้ระบบกลับคืนสู่สถานะการเล่นคิวปกติ (Playlist หรือ Request)

---

### 2. สร้าง API สำหรับดึงรายชื่อเพลงใน YouTube Playlist

#### 📂 [NEW] [route.ts](file:///Users/apinan/Developments/music-bar/app/api/youtube/playlist-items/route.ts)
- พัฒนา API Route ใหม่เพื่อดึงรายชื่อเพลงภายใน YouTube Playlist ผ่าน `https://www.googleapis.com/youtube/v3/playlistItems`
- ตรวจสอบ API Key: หากไม่ได้รับกำหนด ค่าจะถูกจำลองข้อมูลเพลงเริ่มต้น (Mock Data) สำหรับช่วง Demo เพื่อการทำงานที่ต่อเนื่อง
- จัดรูปแบบข้อมูลผลลัพธ์ของแต่ละเพลงที่ส่งกลับให้พร้อมใช้งาน เช่น `id`, `youtube_id`, `title`, `thumbnail`, และ `channelTitle`

---

### 3. ปรับปรุงหน้าแผงควบคุมระบบจัดการ Admin

#### 📂 [MODIFY] [admin-view.tsx](file:///Users/apinan/Developments/music-bar/components/admin-view.tsx)
- **ระบบเล่นเพลงทันทีจากหน้า Admin**:
  - เชื่อมต่อและดึงฟังก์ชัน `playSongImmediately`, `currentSong`, `isPlaying`, และ `togglePlay` จาก `usePlayer()`
  - เพิ่มปุ่ม Dynamic Play/Pause ในรายการเพลงทั้งหมดในหน้าระบบ:
    - เพลงในเพลย์ลิสต์ (`activeWorkspaceTab === "tracks"`) ทั้งใน List View และ Grid View
    - ผลลัพธ์จากการค้นหาคลังเพลง YouTube (`activeWorkspaceTab === "search"`) ทั้งใน List View และ Grid View
    - แทร็กเพลงคำขอจากลูกค้า (`activeWorkspaceTab === "requests"`) ทั้งใน List View และ Grid View
  - หากเพลงที่กำลังแสดงตรงกับ `currentSong` และเครื่องกำลังเล่นอยู่ ปุ่มจะเปลี่ยนเป็นสถานะ Pause เมื่อกดจะทำการหยุดเล่น หากเป็นเพลงอื่นจะสั่ง `playSongImmediately` เพื่อเล่นเพลงใหม่ทันที
- **ระบบพรีวิวดูรายชื่อเพลงใน YouTube Playlist ก่อน Import**:
  - เพิ่มสถานะควบคุมความคมชัดของ Modal: `activePreviewPlaylist`, `previewSongs`, `isLoadingPreview`, และ `isPreviewModalOpen`
  - นำเข้าไอคอน `Play`, `Pause`, และ `Eye` จาก `lucide-react` มาใช้งานในหน้าควบคุม
  - ปรับปรุงการแสดงผลในแท็บค้นหา YouTube Playlist: เพิ่มปุ่ม "ดูรายชื่อเพลง" (ไอคอน `Eye`) เคียงคู่กับปุ่มนำเข้าปกติ
  - พัฒนา Custom Preview Modal ตกแต่งด้วย CSS/Tailwind ธีม Premium Dark Mode แสดงรายชื่อปกเพลง หัวข้อ และศิลปิน
  - ภายใน Preview Modal รองรับการกดฟังแต่ละเพลงได้ทันที และมีปุ่มนำเข้า (Import) ครอบคลุมอยู่ภายใน Modal ช่วยเพิ่มทางเลือกที่สะดวกสบาย

---

## 🧪 แผนการตรวจสอบและทดสอบ (Verification Plan)

### การทดสอบความถูกต้องของโค้ด (Type Checking & Build)
- ตรวจสอบคอมไพล์ TypeScript:
  ```bash
  npx tsc --noEmit --noUnusedLocals --noUnusedParameters
  ```

### การตรวจสอบการทำงานด้วยตนเอง (Manual Verification)
1. **การกดเล่นเพลงทันที**:
   - ไปที่หน้าควบคุม `/admin`
   - ในแต่ละส่วน (เพลงในเพลย์ลิสต์, แถบค้นหาเดี่ยว, แถวคำขอเพลง) ลองกดปุ่มเล่นเพลง
   - ยืนยันว่าหน้าจอตัวเล่นหลัก (Persistent Player) และแถบควบคุมด้านล่างแสดงสถานะเล่นเพลงและเพลงที่เลือกรวมถึงเสียงเล่นขึ้นมาถูกต้อง
   - ยืนยันว่าเมื่อกดปุ่มเดียวกันซ้ำขณะเล่นอยู่ เพลงจะหยุด และเมื่อกดข้ามเพลง คิวจะกลับมาเล่นในแบบปกติ
2. **การพรีวิวรายชื่อเพลง YouTube Playlist**:
   - ไปที่แท็บค้นหาในหน้า `/admin` เลือกหมวด "เพลย์ลิสต์ YouTube"
   - พิมพ์คำค้นหาและยืนยันการขึ้นปุ่ม "ดูรายชื่อเพลง" (ไอคอนดวงตา) ข้างๆ ปุ่ม Import
   - กดปุ่ม "ดูรายชื่อเพลง" และยืนยันว่ามี Modal ค่อยๆ สไลด์/เปิดออกมาอย่างลื่นไหลพร้อมรายชื่อเพลงภายในเพลย์ลิสต์
   - ทดสอบกดปุ่มเล่นเพลงเดี่ยวจากในหน้า Modal พรีวิว และยืนยันว่าเพลงนั้นถูกส่งไปเล่นที่ตัวเล่นหลักจริง
   - กดปุ่ม "นำเข้าเพลย์ลิสต์นี้" จากภายใน Modal และยืนยันว่าเพลย์ลิสต์ถูกบันทึกเข้าระบบเรียบร้อย
