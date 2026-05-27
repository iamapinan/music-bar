# Task List - Build Android APK

- [x] **Environment Verification**
  - [x] ตรวจสอบความพร้อมของ SDK, Node.js และ JDK เวอร์ชันในระบบ
  - [x] ตรวจสอบสิทธิ์การทำงานของ `gradlew` ในโฟลเดอร์ `mobile/android`

- [x] **Execution of Build Commands**
  - [x] รันการล้างแคชเก่าด้วย `./gradlew clean`
  - [x] รันการสร้าง Debug APK ด้วย `./gradlew assembleDebug`
  - [x] รันการสร้าง Release APK ด้วย `./gradlew assembleRelease`

- [/] **Verification & Validation**
  - [x] ยืนยันความสมบูรณ์และพิกัดของไฟล์ APK ที่สร้างสำเร็จ
  - [/] เพิ่มประวัติการทำงานลงใน `CHANGELOG.md` และส่งมอบผลลัพธ์
  - [ ] ทำการ Git commit หลังการสร้างเอกสารและไฟล์ระบบ
