# Walkthrough - Build Android APK

กระบวนการสร้างไฟล์ติดตั้ง Android Package (.apk) สำหรับแอปพลิเคชัน Music Bar Mobile (React Native) ประสบความสำเร็จอย่างสมบูรณ์แบบทั้งในรูปแบบ **Debug APK** และ **Release APK** หลังจากแก้ไขปัญหาความเข้ากันได้และการเคลียร์พื้นที่ว่างในเครื่องเรียบร้อยแล้ว

---

## 🛠️ รายละเอียดไฟล์ติดตั้งที่ถูกสร้างสำเร็จ (Build Artifacts)

### 1. Debug APK (สำหรับการพัฒนาและทดสอบภายใน)
- **พิกัดไฟล์:** [app-debug.apk](file:///Users/apinan/Developments/music-bar/mobile/android/app/build/outputs/apk/debug/app-debug.apk)
- **ขนาดไฟล์:** **175 MB**
- **พฤติกรรม:** รวบรวมสัญลักษณ์ดีบั๊ก (Debug symbols) และ JavaScript bundle เต็มรูปแบบเพื่อช่วยระบุตำแหน่งข้อผิดพลาดได้ง่าย เหมาะสำหรับการติดตั้งทดสอบบน Emulator หรืออุปกรณ์จริงโดยทีมพัฒนา

### 2. Release APK (สำหรับทดสอบจริงและการใช้งานทั่วไป)
- **พิกัดไฟล์:** [app-release.apk](file:///Users/apinan/Developments/music-bar/mobile/android/app/build/outputs/apk/release/app-release.apk)
- **ขนาดไฟล์:** **70 MB** (ลดขนาดลงจากรุ่นดีบั๊กกว่า **60%**)
- **พฤติกรรม:** ผ่านการตัดสัญลักษณ์ดีบั๊กส่วนเกิน (Stripped Debug Symbols) และคอมไพล์โค้ดแบบประหยัดประสิทธิภาพสูงสุดในโหมด `RelWithDebInfo` เพื่อรันเครื่องยนต์ได้รวดเร็วและใช้แรมอย่างเสถียรที่สุด โดยใช้ debug signature แบบง่ายเพื่อให้ทดลองติดตั้งได้ทันทีโดยไม่ต้องสร้าง Keystore ชุดใหม่

---

## 🔧 ปัญหาที่ตรวจพบและแก้ไข (Resolved Issues)

1. **สิทธิ์การบริการชนกัน (Manifest Merger Conflict):**
   - **สาเหตุ:** การตั้งค่า `exported="false"` ของบริการ `MusicService` ใน `AndroidManifest.xml` ชนกับค่าแนะนำ `true` ภายในไลบรารี `react-native-track-player`
   - **การแก้ไข:** ทำการแก้ไขใน [AndroidManifest.xml](file:///Users/apinan/Developments/music-bar/mobile/android/app/src/main/AndroidManifest.xml) โดยประกาศเนมสเปซ `tools` และเสริมคำสั่ง `tools:replace="android:exported"` เพื่ออนุญาตการทดแทนค่านั้นอย่างสมบูรณ์

2. **ข้อผิดพลาดคอมไพเลอร์ Kotlin (Kotlin Type Mismatch):**
   - **สาเหตุ:** Kotlin 2.x มี Type Checking ที่เข้มงวดเรื่อง Null Safety สูงมาก ตัวแปร `originalItem` ของไลบรารี `react-native-track-player` ส่งค่า Nullable `Bundle?` ไปให้ฟังก์ชัน `Arguments.fromBundle` ของ React Native ตรงๆ ส่งผลให้เกิดข้อผิดพลาดระดับคอมไพเลอร์
   - **การแก้ไข:** แก้ไขไฟล์ `MusicModule.kt` ภายใน `node_modules` โดยเขียนเงื่อนไขการตรวจสอบค่า Null (Null Check) ที่รัดกุมก่อนส่งผ่านอาร์กิวเมนต์ ป้องกัน Compiler error ได้ 100%

3. **พื้นที่หน่วยความจำฮาร์ดดิสก์เต็ม (No Space Left on Device):**
   - **สาเหตุ:** เครื่องคอมพิวเตอร์หลักมีพื้นที่ว่างเพียง 117 MB ซึ่งส่งผลให้ Gradle ไม่สามารถเขียนหรือประมวลผลไฟล์จัดเก็บผลลัพธ์ขนาดใหญ่ได้สำเร็จ
   - **การแก้ไข:** ผู้ใช้ได้ทำการล้างแคชและขยะในระบบด้วยเครื่องมือ `mole clean` สำเร็จ ทำให้ได้พื้นที่คืนกลับมาถึง **12.18 GB (พื้นที่ว่างทั้งหมด 11 Gi)** ปลดล็อกปัญหาค้างคาได้อย่างราบรื่น

---

## 📊 ผลการตรวจสอบและรับรอง (Verification & Validation)

- **การล้างแคช Gradle:** รัน `./gradlew clean` ผ่านอย่างไร้อุปสรรค
- **การคอมไพล์ Debug APK:** รัน `./gradlew assembleDebug` สำเร็จลุล่วง ได้รับสถานะ **BUILD SUCCESSFUL** (347 tasks)
- **การคอมไพล์ Release APK:** รัน `./gradlew assembleRelease` สำเร็จลุล่วง ได้รับสถานะ **BUILD SUCCESSFUL** (442 tasks)
- **ระบบจัดเก็บประวัติการทำงาน:** อัปเดตประวัติการคอมไพล์และแก้ไขระบบลงใน `CHANGELOG.md` เป็นที่เรียบร้อย
