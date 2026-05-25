# Implementation Plan - Native Android Background Playback & Stability

## 1. Overview
ปรับปรุงแอปพลิเคชัน React Native (Music Bar Mobile) เพื่อให้รองรับการทำงานเบื้องหลัง (Background Playback) ได้อย่างสมบูรณ์แบบ ไม่โดนระบบปฏิบัติการ Android ปิดหรือยกเลิกการทำงานเมื่อแอปพลิเคชันอยู่เบื้องหลังหรือเมื่อล็อกหน้าจอ โดยการนำการเข้าถึง API แบบ Native และการตั้งค่าระบบที่จำเป็นมาประยุกต์ใช้

---

## 2. Proposed Changes

### [Android Native Component]

#### [MODIFY] [AndroidManifest.xml](file:///Users/apinan/Developments/music-bar/mobile/android/app/src/main/AndroidManifest.xml)
- เพิ่มสิทธิ์การร้องขอข้ามการประหยัดแบตเตอรี่ (Battery Optimization):
  `<uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />`
- ประกาศ `foregroundServiceType="mediaPlayback"` สำหรับการให้บริการเบื้องหลังของ `react-native-track-player` เพื่อความเข้ากันได้กับ Android 14+ (API 34+)

#### [NEW] [BackgroundOptimizationModule.kt](file:///Users/apinan/Developments/music-bar/mobile/android/app/src/main/java/com/musicbarmobile/BackgroundOptimizationModule.kt)
- สร้าง Native Module ภาษา Kotlin เพื่อเชื่อมต่อ API การตรวจสอบและการส่งผู้ใช้ไปยังการอนุญาต "ข้ามการประหยัดแบตเตอรี่" (Ignore Battery Optimizations) ของ Android
- `isBatteryOptimizationIgnored`: ตรวจสอบสถานะว่าแอปข้ามการประหยัดแบตเตอรี่หรือยัง
- `requestIgnoreBatteryOptimization`: เปิดหน้าต่างขออนุญาตข้ามการประหยัดแบตเตอรี่จากผู้ใช้

#### [NEW] [BackgroundOptimizationPackage.kt](file:///Users/apinan/Developments/music-bar/mobile/android/app/src/main/java/com/musicbarmobile/BackgroundOptimizationPackage.kt)
- สร้าง ReactPackage เพื่อลงทะเบียน `BackgroundOptimizationModule` ให้แอป React Native ใช้งานได้

#### [MODIFY] [MainApplication.kt](file:///Users/apinan/Developments/music-bar/mobile/android/app/src/main/java/com/musicbarmobile/MainApplication.kt)
- ลงทะเบียน `BackgroundOptimizationPackage` ในลิสต์ของแพ็กเกจด้วยคำสั่ง `add(BackgroundOptimizationPackage())`

---

### [React Native Application Component]

#### [MODIFY] [playback-service.ts](file:///Users/apinan/Developments/music-bar/mobile/src/data/services/playback-service.ts)
- ปรับเปลี่ยนค่า `appKilledPlaybackBehavior` จาก `StopPlaybackAndRemoveNotification` เป็น `ContinuePlayback` เพื่อให้การเล่นเพลงเบื้องหลังดำเนินต่อได้ถึงแม้ผู้ใช้จะปัดหน้าต่างแอปทิ้ง (Swiped away)
- เพิ่มคุณสมบัติ `Capabilities` และการจัดการ Foreground Service ให้เหมาะสมกับการควบคุมของระบบ OS

#### [MODIFY] [player-screen.tsx](file:///Users/apinan/Developments/music-bar/mobile/src/presentation/screens/player-screen.tsx)
- แก้ไขปัญหาข้อผิดพลาด `ReferenceError: MOCK_TRACKS is not defined` โดยการสร้างโครงสร้างข้อมูลแบบ Fallback ที่ถูกต้องปลอดภัย
- เพิ่มระบบการแจ้งเตือนและการขอสิทธิ์แจ้งเตือนบน Android 13+ (`POST_NOTIFICATIONS`) เพื่อแสดงตัวควบคุมเครื่องเล่นเพลงบนแถบแจ้งเตือนและการล็อกหน้าจอ
- แสดงปุ่ม/การเตือนในหน้าจอสำหรับผู้ใช้เพื่อขอข้ามการประหยัดแบตเตอรี่ (Battery Optimization) เมื่อแอปพยายามรันเบื้องหลังแล้วตรวจพบว่ายังไม่ได้รับอนุญาต

---

## 3. Verification Plan

### Automated / Manual Verification
1. **การตรวจสอบสิทธิ์และการทำงานเบื้องหลัง:**
   - ตรวจสอบผ่าน Emulator หรือเครื่องจริงว่าแอปเรียกใช้งานสิทธิ์ขอแจ้งเตือน `POST_NOTIFICATIONS` ใน Android 13+
   - ตรวจสอบหน้าต่างแจ้งขอข้ามการประหยัดแบตเตอรี่ (Battery Optimization) เมื่อกดปุ่มหรือเมื่อเปิดแอป
2. **การทดสอบการเล่นเพลงเบื้องหลัง:**
   - ทดสอบเล่นเพลง แล้วย่อแอปให้อยู่เบื้องหลัง (Background)
   - ทดสอบล็อกหน้าจอโทรศัพท์ (Screen Lock) และประเมินว่าเพลงยังคงเล่นต่ออย่างราบรื่น
   - ทดสอบปัดแอปพลิเคชันออกจาก Recents Apps (Swipe kill) และตรวจดูว่า Foreground Service ยังสามารถคงสถานะการเล่นได้ตามการตั้งค่า `ContinuePlayback`
