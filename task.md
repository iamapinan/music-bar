# รายการงานระบบแก้ไข Seek Bar ไม่แสดงและกดไม่ได้ในหน้า Admin (Admin Seek Bar Fix Tasks)

- [x] ปรับปรุงบาร์เครื่องเล่นเพลงด้านล่าง (`components/player-bottom-bar.tsx`)
    - [x] เอาคลาส `overflow-hidden` ออกจากบาร์หลัก `player-ambient`
    - [x] ยืนยันการแสดงผลของ Seek Bar ในหน้า `/admin`
- [x] การตรวจสอบและบันทึกประวัติ
    - [x] ทดสอบ compile และรัน typecheck ผ่าน `tsc`
    - [x] บันทึกการพัฒนาลงใน `CHANGELOG.md`
    - [x] ทำการ Git commit ผลงานทั้งหมด
