# แผนงานการลบโค้ดที่ไม่ได้ใช้งาน (Clean Unused Code Implementation Plan)

แผนงานนี้มีเป้าหมายเพื่อลบโค้ดและตัวแปรที่ไม่ได้ใช้งาน (Unused imports, unused variables, unused parameters) ตามที่ตรวจพบโดย TypeScript Compiler (`tsc`) เพื่อให้โค้ดของโครงการ Music Bar สะอาดขึ้น ปราศจาก Warning และง่ายต่อการบำรุงรักษา

## ⚠️ สิ่งที่ต้องคำนึง (User Review Required)

การลบพารามิเตอร์ของ Route Handlers (เช่น `request: Request`) อาจส่งผลกับ Signature ของฟังก์ชันได้ ดังนั้นเพื่อรักษาตำแหน่งของ `params` ในพารามิเตอร์ตัวที่สอง เราจะเปลี่ยนชื่อเป็น `_request` เพื่อหลีกเลี่ยงข้อผิดพลาดของ TypeScript compiler และรักษารูปแบบที่ถูกต้องของ Next.js API Routes

---

## 🛠️ รายการเปลี่ยนแปลงที่เสนอ (Proposed Changes)

### 1. Web Core API Components

#### 📂 [MODIFY] [route.ts](file:///Users/apinan/Developments/music-bar/app/api/players/%5Bid%5D/route.ts)
- เปลี่ยน `request: Request` ในฟังก์ชัน `DELETE` เป็น `_request: Request` เพื่อระบุว่าเป็นตัวแปรที่ตั้งใจไม่เรียกใช้งาน

#### 📂 [MODIFY] [route.ts](file:///Users/apinan/Developments/music-bar/app/api/playlists/%5Bid%5D/songs/route.ts)
- เปลี่ยน `request: Request` ในฟังก์ชัน `GET` เป็น `_request: Request`

---

### 2. Frontend User Interface Components

#### 📂 [MODIFY] [bottom-nav.tsx](file:///Users/apinan/Developments/music-bar/components/bottom-nav.tsx)
- ลบการอิมพอร์ต `Music` จากแพ็กเกจ `lucide-react` เนื่องจากไม่ได้ใช้งาน

#### 📂 [MODIFY] [persistent-player.tsx](file:///Users/apinan/Developments/music-bar/components/persistent-player.tsx)
- ลบการ Destructure ตัวแปร `isAutoPlayEnabled` จากการดึงข้อมูล `usePlayer()` เนื่องจากไม่ได้ถูกเรียกใช้ในฟังก์ชัน

#### 📂 [MODIFY] [player-bottom-bar.tsx](file:///Users/apinan/Developments/music-bar/components/player-bottom-bar.tsx)
- ลบการอิมพอร์ต `Disc3` จากแพ็กเกจ `lucide-react` เนื่องจากไม่ได้ใช้งาน

#### 📂 [MODIFY] [queue-list.tsx](file:///Users/apinan/Developments/music-bar/components/queue-list.tsx)
- ลบพารามิเตอร์ `i` (index) จากลูป `.map` ชั้นที่สอง ในส่วนการแสดงผล Playlist แทร็ก เนื่องจากไม่ได้ใช้งาน

#### 📂 [MODIFY] [request-view.tsx](file:///Users/apinan/Developments/music-bar/components/request-view.tsx)
- ลบการอิมพอร์ต `ScrollArea` จาก `@/components/ui/scroll-area`
- ลบการประกาศ `qrCanvasRef` (เนื่องจากการสร้าง QR Code เปลี่ยนไปใช้ API direct URL และไม่ได้อ้างอิง canvas แล้ว)

#### 📂 [MODIFY] [theme-provider.tsx](file:///Users/apinan/Developments/music-bar/components/theme-provider.tsx)
- ลบการอิมพอร์ต `import * as React from 'react'` เนื่องจากไม่ได้ใช้ฟีเจอร์ใดๆ ของ React โดยตรงในไฟล์นี้

---

## 🧪 แผนการตรวจสอบและทดสอบ (Verification Plan)

### การทดสอบแบบอัตโนมัติ (Automated Tests)
- รันคำสั่งตรวจสอบประเภทข้อมูลและการทำงานของ TypeScript ด้วย:
  ```bash
  npx tsc --noEmit --noUnusedLocals --noUnusedParameters
  ```
  เพื่อตรวจสอบว่าไม่มีข้อผิดพลาด `TS6133` (Unused code) หลงเหลืออยู่อีก
- รันคำสั่งตรวจสอบความถูกต้องของโครงสร้างและการคอมไพล์ของ Next.js:
  ```bash
  npm run build
  ```
  หรือ `bun run build`

### การตรวจสอบด้วยตนเอง (Manual Verification)
- ตรวจสอบว่าหน้าจอจัดการเพลย์ลิสต์ ระบบเล่นเพลงต่อเนื่อง คิวเพลง และหน้าจอขอเพลงของลูกค้าทำงานได้ตามปกติ ไหลลื่น ไม่มีข้อผิดพลาด
