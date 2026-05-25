# Walkthrough - Background Playback & Native Optimization

เราได้พัฒนาและปรับปรุงระบบการทำงานเบื้องหลัง (Background Execution) ของแอปพลิเคชัน React Native (Music Bar Mobile) เพื่อให้แอปพลิเคชันสามารถเล่นเพลงเบื้องหลังได้อย่างมั่นคงและปลอดภัย 100% ไม่โดนระบบปฏิบัติการ Android ปิดหรือยกเลิกการทำงาน

## การเปลี่ยนแปลงที่เกิดขึ้น (Changes Made)

### 1. การตั้งค่าระบบระดับ Native (Android Native Layer)
- **สิทธิ์การใช้งาน (Permissions):** เพิ่มสิทธิ์ใน [AndroidManifest.xml](file:///Users/apinan/Developments/music-bar/mobile/android/app/src/main/AndroidManifest.xml)
  - `POST_NOTIFICATIONS`: สิทธิ์ในการส่งข้อมูลและแสดงแผงควบคุมเพลงบนแถบแจ้งเตือนและการล็อกหน้าจอ
  - `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`: สิทธิ์ในการร้องขอให้ผู้ใช้ข้ามการจัดสรรพลังงานแบตเตอรี่ (Battery Optimization Whitelisting)
- **บริการเบื้องหลัง (Foreground Service):** บังคับใช้ `foregroundServiceType="mediaPlayback"` บน Android 14+ (API 34+) เพื่อให้สอดคล้องกับมาตรฐานความปลอดภัยใหม่ของ Android
- **Native Module เชื่อมต่อไปยังระบบ Android:** 
  - สร้างโมดูล [BackgroundOptimizationModule.kt](file:///Users/apinan/Developments/music-bar/mobile/android/app/src/main/java/com/musicbarmobile/BackgroundOptimizationModule.kt) ภาษา Kotlin เพื่อเรียกใช้งาน Java/Kotlin System Service (`PowerManager`) สำหรับเช็กว่าแอปถูกจำกัดพลังงานหรือไม่ และมีเมธอดเปิดหน้าต่างตั้งค่าการข้ามระบบประหยัดพลังงานแบตเตอรี่
  - ลงทะเบียนผ่าน [BackgroundOptimizationPackage.kt](file:///Users/apinan/Developments/music-bar/mobile/android/app/src/main/java/com/musicbarmobile/BackgroundOptimizationPackage.kt)
  - ผูกโมดูลเข้ากับโปรเจกต์หลักใน [MainApplication.kt](file:///Users/apinan/Developments/music-bar/mobile/android/app/src/main/java/com/musicbarmobile/MainApplication.kt)

### 2. การควบคุมและพฤติกรรมของเครื่องเล่น (Audio Engine Layer)
- **ความมั่นคงในการทำงานเบื้องหลัง:** อัปเดตคุณสมบัติ `appKilledPlaybackBehavior` ใน [playback-service.ts](file:///Users/apinan/Developments/music-bar/mobile/src/data/services/playback-service.ts) ให้เป็น `ContinuePlayback` ซึ่งจะช่วยรักษาสถานะการเล่นเพลงและไม่ถูกทำลายแม้ผู้ใช้จะปิดหน้าต่างแอปพลิเคชันหลัก
- **แก้ไขข้อผิดพลาดระบบเสียง:** ปรับปรุงโครงสร้างตรวจสอบประเภทและเงื่อนไขค่า `null` ในเหตุการณ์เพลงเปลี่ยนเพื่อความปลอดภัยของ Type (TypeScript Type safety)

### 3. อินเตอร์เฟซและการขอสิทธิ์จากผู้ใช้ (UI & Application Layer)
- **แก้ไขข้อผิดพลาดแอปพลิเคชัน:** แก้ไขปัญหา `ReferenceError: MOCK_TRACKS is not defined` ในหน้าจอเล่นเพลงหลัก [player-screen.tsx](file:///Users/apinan/Developments/music-bar/mobile/src/presentation/screens/player-screen.tsx) โดยทดแทนด้วยโครงสร้าง `FALLBACK_TRACK` ที่ปลอดภัยและเสถียร
- **ขอสิทธิ์การแจ้งเตือนแบบไดนามิก:** เรียกขอสิทธิ์ `POST_NOTIFICATIONS` ทันทีที่เข้าแอปบนอุปกรณ์ Android 13+ เพื่อแสดงผลแถบควบคุมเพลง
- **แถบแจ้งเตือนระดับ Premium (Battery Exclusion Banner):** หากระบบตรวจพบว่าแอปยังคงอยู่ภายใต้การประหยัดพลังงานแบตเตอรี่ (ซึ่งเสี่ยงต่อการโดนปิดแอป) แอปจะแสดงการเตือนระดับพรีเมียมสี Rose อ่อนๆ ไม่มีอิโมจิ เพื่อให้ผู้ใช้สามารถกดเปิดหน้าต่างตั้งค่าระบบ Android ไปปิดการจำกัดพลังงานได้ทันที

---

## ผลการตรวจสอบและความถูกต้อง (Validation Results)

- **การตรวจสอบประเภท (Type-checking):** รัน `npx tsc --noEmit` เสร็จสิ้นสมบูรณ์ 100% ไม่มีข้อผิดพลาด
- **การตรวจสอบไวยากรณ์ (Linting):** รัน `npx eslint .` ผ่านเรียบร้อย ไร้คำเตือนและข้อผิดพลาด
- **ระบบจัดเก็บเวอร์ชัน:** ดำเนินการ Git Commit ไฟล์และโค้ดทั้งหมดเรียบร้อยแล้ว
