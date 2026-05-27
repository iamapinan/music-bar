# แผนการพัฒนา Android App ด้วย Kotlin สำหรับเปิด WebView และเล่นเพลงในเบื้องหลังต่อเนื่อง

แผนงานนี้กำหนดขึ้นเพื่อสร้างแอปพลิเคชัน Android เนทีฟ (Native APK) ด้วยภาษา Kotlin โดยมีจุดประสงค์หลักเพื่อเปิดเว็บแอปพลิเคชัน `https://musicbar.gracer.ai` ผ่าน WebView และทำให้สามารถเล่นเพลงได้อย่างต่อเนื่องโดยไม่ถูกระบบปฏิบัติการ Android ปิดการทำงาน (Background Task Kill) แม้จะปิดหน้าจอหรือสลับแอปพลิเคชันไปทำงานอื่น

---

## สรุปแนวทางการแก้ปัญหา (Proposed Approach)

เพื่อไม่ให้แอปพลิเคชันถูกบีบให้หยุดทำงาน (Killed) หรือแชร์ทรัพยากรเสียงหยุดทำงานในเบื้องหลัง เราจะใช้กลไกต่อไปนี้ร่วมกัน:
1. **Foreground Service (ประเภท `mediaPlayback`):** รันเซอร์วิสเบื้องหน้าพร้อมไอคอนแจ้งเตือน (Persistent Notification) เพื่อระบุให้ Android OS ทราบว่าแอปพลิเคชันนี้กำลังทำงานที่สำคัญอยู่และห้ามเคลียร์หน่วยความจำ
2. **WakeLock และ WifiLock:** ป้องกัน CPU หลับ (Deep Sleep) และป้องกันการตัดสัญญาณ Wi-Fi ขณะที่ปิดหน้าจอ เพื่อให้ WebView ทำงานและสตรีมมิ่งเพลงได้ต่อเนื่อง
3. **การกำหนดค่า WebView เฉพาะตัว:** ปลดล็อกข้อจำกัดของการเล่นไฟล์มีเดียเบื้องหลัง, เปิดใช้งาน DOM Storage/JS, และควบคุมการเปิด/ปิดเสียงอย่างระมัดระวัง (หลีกเลี่ยงการเรียก `webView.onPause()` เมื่อแอปเข้าสู่เบื้องหลัง)
4. **Runtime Permission:** รองรับการขอสิทธิ์ในยุคใหม่ เช่น `POST_NOTIFICATIONS` บน Android 13+ (API 33+) เพื่อให้แน่ใจว่าระบบสามารถรัน Foreground Service ได้อย่างสมบูรณ์

---

## รายการไฟล์ที่จะสร้างและแก้ไข (Proposed Changes)

เราจะสร้างโครงสร้างโปรเจกต์ Android ในโฟลเดอร์ `mobile/android` ใหม่ทั้งหมด โดยมีไฟล์สำคัญดังนี้:

### โครงสร้าง Gradle & Settings

#### [NEW] [settings.gradle.kts](file:///Users/apinan/Developments/music-bar/mobile/android/settings.gradle.kts)
- ตั้งชื่อโปรเจกต์และเชื่อมต่อแอปโมดูล (`:app`)

#### [NEW] [build.gradle.kts](file:///Users/apinan/Developments/music-bar/mobile/android/build.gradle.kts)
- ไฟล์ Gradle ระดับโปรเจกต์เพื่อนำเข้า Android Gradle Plugin และ Kotlin Plugin

#### [NEW] [gradle.properties](file:///Users/apinan/Developments/music-bar/mobile/android/gradle.properties)
- ตั้งค่าคุณสมบัติสำหรับคอมไพล์ เช่น เปิดใช้งาน AndroidX และจัดสรรหน่วยความจำ JVM

#### [NEW] [app/build.gradle.kts](file:///Users/apinan/Developments/music-bar/mobile/android/app/build.gradle.kts)
- ไฟล์ Gradle ระดับแอปโมดูล กำหนด SDK (Compile SDK: 35, Target SDK: 34, Min SDK: 26) และตั้งค่า Dependency สำหรับ AndroidX, WebView, และ Material Components

---

### โครงสร้าง Android Manifest & Assets

#### [NEW] [AndroidManifest.xml](file:///Users/apinan/Developments/music-bar/mobile/android/app/src/main/AndroidManifest.xml)
- ขอสิทธิ์การใช้งานที่จำเป็น (`INTERNET`, `WAKE_LOCK`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK`, `POST_NOTIFICATIONS`)
- ประกาศ `MainActivity` และ `BackgroundAudioService`

#### [NEW] [strings.xml](file:///Users/apinan/Developments/music-bar/mobile/android/app/src/main/res/values/strings.xml)
- กำหนดค่า Resource ข้อความของแอป

#### [NEW] [colors.xml](file:///Users/apinan/Developments/music-bar/mobile/android/app/src/main/res/values/colors.xml)
- กำหนดจานสีของแอปพลิเคชัน (โทนสีมืดเข้ากับหน้าเว็บของ Music Bar)

#### [NEW] [themes.xml](file:///Users/apinan/Developments/music-bar/mobile/android/app/src/main/res/values/themes.xml)
- กำหนดสไตล์ของแอปเป็น `Theme.MaterialComponents.DayNight.NoActionBar`

#### [NEW] [activity_main.xml](file:///Users/apinan/Developments/music-bar/mobile/android/app/src/main/res/layout/activity_main.xml)
- เลย์เอาต์หลักที่มีเฉพาะ `WebView` แบบเต็มหน้าจอ

---

### โค้ดโปรแกรมเมอร์ (Kotlin Source Files)

#### [NEW] [BackgroundAudioService.kt](file:///Users/apinan/Developments/music-bar/mobile/android/app/src/main/java/ai/gracer/musicbar/BackgroundAudioService.kt)
- เซอร์วิสเบื้องหน้าที่รับผิดชอบเรื่องความต่อเนื่องในการเปิดเพลง
- สร้าง Notification Channel และ persistent notification พร้อมปุ่มปิดแอป (Exit)
- จัดการและถือครอง `WakeLock` และ `WifiLock` เพื่อป้องกันไม่ให้โทรศัพท์นอนหลับ
- รันตัวเองแบบ `START_STICKY` เพื่อให้มั่นใจว่าจะถูกเปิดใช้งานใหม่ทันทีถ้าเกิดขัดข้อง

#### [NEW] [MainActivity.kt](file:///Users/apinan/Developments/music-bar/mobile/android/app/src/main/java/ai/gracer/musicbar/MainActivity.kt)
- เริ่มต้นและเชื่อมต่อ (Bind) กับ `BackgroundAudioService`
- จัดการเรื่องการขอสิทธิ์แจ้งเตือน (`POST_NOTIFICATIONS`) ที่ระดับ runtime สำหรับ Android 13 ขึ้นไป
- โหลดและควบคุม WebView ด้วยการอนุญาตพิเศษ เช่น
  - `mediaPlaybackRequiresUserGesture = false` (เปิดมีเดียได้อัตโนมัติ)
  - ไม่ทำลายหรือหยุด WebView เมื่อแอปถูกย่อหน้าต่าง (ไม่เรียก `webView.onPause()`)
- รองรับปุ่มกดย้อนกลับภายใน WebView (WebView Back History Support)

---

## แผนการทดสอบและการรันเพื่อสร้าง APK (Verification & Build Plan)

### ขั้นตอนสร้างและคอมไพล์แอปพลิเคชัน
1. เราจะทำการดาวน์โหลดไฟล์ Gradle Wrapper ผ่านเครื่องมือ `gradle wrapper` เวอร์ชันที่รองรับการคอมไพล์
2. รันคำสั่งตรวจสอบและคอมไพล์โปรเจกต์:
   ```bash
   ./gradlew assembleDebug
   ```
3. เมื่อสร้างสำเร็จแล้ว ไฟล์ APK จะถูกบันทึกอยู่ที่:
   `/Users/apinan/Developments/music-bar/mobile/android/app/build/outputs/apk/debug/app-debug.apk`

### แผนการทดสอบการใช้งานจริง (Manual Verification)
1. ติดตั้ง APK ลงในเครื่องจริงหรือ Emulator
2. เปิดแอปและยอมรับสิทธิ์การส่งการแจ้งเตือน (Notifications)
3. ตรวจสอบว่าเปิดเว็บ `https://musicbar.gracer.ai` ขึ้นมาได้ปกติ
4. ทดลองเลือกและเริ่มเล่นเพลง
5. ทดสอบปัดแอปพลิเคชันไปที่พื้นหลัง (Background) หรือทำการกดปุ่มล็อกหน้าจอ เพื่อยืนยันว่าเสียงเพลงยังเล่นต่อโดยสมบูรณ์ไม่มีการหยุดค้าง
6. เปิดแผงควบคุมแจ้งเตือน ตรวจสอบว่า Notification ของแอป "Music Bar" แสดงปุ่มสั่งการ "ปิดแอป" และทำงานได้ถูกต้อง
