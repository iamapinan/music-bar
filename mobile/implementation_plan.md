# Implementation Plan - Build Android APK

## 1. Overview
กระบวนการสร้างไฟล์ Android Package (.apk) สำหรับแอปพลิเคชัน Music Bar Mobile (React Native) เพื่อให้นำไปติดตั้งและทดสอบบนอุปกรณ์ Android จริงได้ โดยมีทั้งรูปแบบ Debug APK และ Release APK (ใช้ debug key เพื่อความสะดวกรวดเร็วในการทดสอบ)

---

## 2. Proposed Changes

### [Build Environment Verification]
- ตรวจสอบความถูกต้องของ Android SDK, Node.js และ JDK เวอร์ชันในระบบ
- ตรวจสอบความพร้อมของ Gradle Wrapper ในโฟลเดอร์ `mobile/android`

### [Build Commands Execution]
- เข้าสู่ไดเรกทอรี `mobile/android`
- รันคำสั่งล้างโฟลเดอร์ build เก่า (Clean Build) เพื่อป้องกันแคชค้าง: `./gradlew clean`
- ทำการสร้าง APK สำหรับการทดสอบ (Debug Build): `./gradlew assembleDebug`
- ทำการสร้าง APK สำหรับการจำหน่ายหรือใช้งานภายนอก (Release Build): `./gradlew assembleRelease`

### [Build Output Verification]
- ตรวจสอบไฟล์ผลลัพธ์ที่สร้างขึ้น:
  - **Debug APK:** [app-debug.apk](file:///Users/apinan/Developments/music-bar/mobile/android/app/build/outputs/apk/debug/app-debug.apk)
  - **Release APK:** [app-release.apk](file:///Users/apinan/Developments/music-bar/mobile/android/app/build/outputs/apk/release/app-release.apk)

---

## 3. Verification Plan

### Automated / Manual Verification
1. **การตรวจสอบไฟล์ APK:**
   - ตรวจดูขนาดไฟล์และความสมบูรณ์ของไฟล์ APK ในไดเรกทอรีผลลัพธ์
   - ตรวจสอบโครงสร้างไฟล์ ZIP ภายในแอปพลิเคชันเพื่อความมั่นใจว่าไม่มีความเสียหาย
2. **การทดสอบติดตั้ง:**
   - แนะนำผู้ใช้ทดลองติดตั้งไฟล์ APK บนเครื่องจำลอง (Emulator) หรืออุปกรณ์ Android จริง
