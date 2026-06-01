# รายการงานทำความสะอาดโค้ดที่ไม่ได้ใช้งาน (Clean Unused Code Tasks)

- [x] ปรับปรุง API Routes (`app/api/...`)
    - [x] แก้ไข `request: Request` เป็น `_request: Request` ใน `app/api/players/[id]/route.ts`
    - [x] แก้ไข `request: Request` เป็น `_request: Request` ใน `app/api/playlists/[id]/songs/route.ts`
- [x] ปรับปรุง UI Components (`components/...`)
    - [x] ลบ Unused Import `Music` ใน `components/bottom-nav.tsx`
    - [x] ลบการดึง `isAutoPlayEnabled` ที่ไม่ได้ใช้ใน `components/persistent-player.tsx`
    - [x] ลบ Unused Import `Disc3` ใน `components/player-bottom-bar.tsx`
    - [x] ลบพารามิเตอร์ `i` ที่ไม่ได้ใช้ใน `.map` ใน `components/queue-list.tsx`
    - [x] ลบ `ScrollArea` อิมพอร์ต และ `qrCanvasRef` ที่ไม่ได้ใช้ใน `components/request-view.tsx`
    - [x] ลบ `import * as React` ที่ไม่ได้ใช้ใน `components/theme-provider.tsx`
- [x] ตรวจสอบความถูกต้องและคุณภาพ
    - [x] รันตรวจสอบประเภทข้อมูลด้วย `tsc` เพื่อดูว่า Warning ถูกลบออกไปทั้งหมดหรือไม่
    - [x] บันทึกการพัฒนาลงใน `CHANGELOG.md`
    - [x] ทำการ Git commit ผลงานการพัฒนาและทำความสะอาดโค้ด
