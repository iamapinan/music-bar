# System Summary - Music Bar

ระบบ Music Bar เป็นระบบแอปพลิเคชันสำหรับความบันเทิงและการจัดการร้านอาหาร/บาร์ ซึ่งประกอบด้วย 2 ส่วนหลัก:

1. **Web Application (Next.js)** - อยู่ที่ Root Directory
   - พัฒนาด้วย Next.js, React, TailwindCSS, และ TypeScript
   - ใช้สไตล์และคอมโพเนนต์จาก shadcn/ui
   - ทำหน้าที่เป็นระบบหลังบ้าน (Admin/Dashboard) หรือหน้าเว็บหลักของร้าน

2. **Mobile Application (React Native)** - อยู่ในโฟลเดอร์ `/mobile`
   - พัฒนาด้วย React Native และ TypeScript
   - รองรับทั้ง iOS และ Android
   - มีระบบเล่นเพลง (React Native Track Player), แอนิเมชันที่สวยงาม (Reanimated) และระบบจัดการการตื่นของหน้าจอ (Keep Awake)

## Tech Stack & Architecture

- **Web:** Next.js (App Router), TypeScript, TailwindCSS, pnpm/bun
- **Mobile:** React Native (0.85.3), TypeScript, bun
- **Design Pattern:** ยึดหลัก Clean Architecture ในการแยก Logic, Data, และ UI Components

## สถานะปัจจุบัน
- กำลังเตรียมพร้อมสำหรับการสร้าง (Build) ไฟล์แอปพลิเคชันสำหรับระบบ Android (.apk)
