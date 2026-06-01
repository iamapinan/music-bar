# Changelog - Music Bar

การเปลี่ยนแปลงทั้งหมดของโปรเจกต์จะถูกบันทึกไว้ในไฟล์นี้ตามหลัก Keep a Changelog.

## [Unreleased]

### Changed
- ทำความสะอาดโค้ดที่ไม่ได้ใช้งานทั่วทั้งโปรเจกต์ (Clean Unused Code) ปราศจาก Warning ในระดับ TypeScript Compiler (`tsc`) 100%:
  - แก้ไขพารามิเตอร์ `request: Request` ที่ไม่ได้ใช้งานใน API Route Handlers (`DELETE` ใน `app/api/players/[id]` และ `GET` ใน `app/api/playlists/[id]/songs`) เป็น `_request: Request` เพื่อรักษาตำแหน่งตามมาตรฐานของ Next.js Route Handlers
  - ลบ Unused Imports ของแพ็กเกจไอคอนจาก `lucide-react` (เช่น `Music` ใน `components/bottom-nav.tsx` และ `Disc3` ใน `components/player-bottom-bar.tsx`)
  - ลบการดึงตัวแปรที่ไม่ได้ใช้ `isAutoPlayEnabled` จาก Context ของ `usePlayer()` ในเครื่องเล่นเพลงเบื้องหลัง (`components/persistent-player.tsx`)
  - ลบพารามิเตอร์ดัชนีลูป `i` ที่ไม่ได้ใช้งานในลูปแสดง Playlist แทร็ก (`components/queue-list.tsx`)
  - ลบโมดูล `ScrollArea` ที่ไม่ได้อ้างอิง และตัวแปรอ้างอิง canvas `qrCanvasRef` (รวมถึง `useRef` ใน React) ออกจากหน้าขอเพลงของลูกค้า (`components/request-view.tsx`) เนื่องจากเปลี่ยนไปใช้การดึง QR Code API แทนแล้ว
  - ลบการอิมพอร์ต React ที่ไม่ได้เรียกใช้งานใน `components/theme-provider.tsx`

### Added
- เพิ่มระบบและปุ่มบังคับอัปเดตแอปพลิเคชัน (PWA Force Update & Cache Clearing) เพื่อความเสถียร 100%:
  - สร้าง Utility กลาง `lib/app-update.ts` ทำหน้าที่ประสานงานกับ Service Worker ตรวจสอบเวอร์ชันใหม่ และส่งข้อความ `SKIP_WAITING` เพื่ออัปเดตระบบทันที
  - เพิ่มระบบล้าง Cache Storage ทั้งหมดในเบราว์เซอร์พร้อมบังคับ Hard Reload เมื่อไม่พบการอัปเดตของ Service Worker เพื่อการันตีการได้ไฟล์แอปเวอร์ชันล่าสุด
  - ติดตั้งปุ่ม "บังคับอัปเดตแอป" สไตล์ Premium Silver ในหน้าควบคุมผู้ดูแลระบบ (`components/admin-view.tsx`)
  - ติดตั้งปุ่ม "อัปเดตแอป" สไตล์มินิมัลลิสต์แบบพรีเมียมในหน้าขอเพลงลูกค้า (`components/request-view.tsx`)
  - ติดตั้งปุ่ม "อัปเดตแอป" สไตล์กึ่งโปร่งใส (Glassmorphism) ใน Header ของเครื่องเล่นเพลงหลัก (`components/player-view.tsx`)
- แยกการแสดงผลรูปปกเพลย์ลิสต์ตามมุมมอง (Playlist Cover View-Specific Sizing):
  - มุมมอง Cards Grid: รูปปกแสดงผลแบบ `aspect-square` เต็มการ์ด สัดส่วนสี่เหลี่ยมจัตุรัสสมบูรณ์
  - มุมมอง Table/List: รูปปกแสดงผลขนาดกะทัดรัด `w-8 h-8` ไม่รบกวนสัดส่วนตารางรายการ
- ปรับระดับความโค้งมนของกล่องคอนโซลควบคุมทุกกล่อง (Admin Containers) เป็น `rounded-lg` เพื่อความสม่ำเสมอของดีไซน์ SaaS พรีเมียม:
  - กล่องสถิติ Stats Bar, กล่องจัดการ Playlist Manager, กล่องพื้นที่ทำงาน Workspace
  - กล่องกรอก PIN ล็อกอิน (Pin Entry Modal) เปลี่ยนจาก `rounded-2xl` เป็น `rounded-lg`
- รีแฟคเตอร์ `PlaylistCover` component ให้รับพารามิเตอร์ `className` เพื่อรองรับการปรับแต่งขนาดตามบริบทการใช้งาน (Context-Aware Sizing)
- ปรับปรุงและบังคับใช้ระบบธีมสว่างสำหรับหน้าผู้ดูแลระบบ (/admin) ให้สมบูรณ์แบบ 100% (Complete Light Theme Enforcement):
  - ใช้กลไกสลับการถอดคลาส `dark` และกำหนดคลาส `admin-mode` บนอิลิเมนต์ `<html>` แบบไดนามิกผ่าน `useEffect` เพื่อให้โครงสร้างนอกแอป (Radix Portals, Modals, Selects) กลายเป็นสีขาวสว่างได้อย่างทั่วถึง
  - เขียนทับการตั้งค่าสไตล์ของกล่องแจ้งเตือน Sonner Toasts ด้วย `body.admin-mode [data-sonner-toast]` ให้ใช้สีพื้นหลังและสีขอบของธีมสว่าง
  - ปรับปรุงการแสดงผลแถบเลื่อน Scrollbars เป็นสีสว่างสวยงามกลมกลืน
- ปรับโฉมอินเตอร์เฟสผู้ดูแลระบบ (/admin) ใหม่ทั้งหมดเป็นสไตล์ Premium Light Theme Music Console ที่ตอบสนองความต้องการระดับสูง:
  - ดีไซน์สีพื้นหลังเป็นโทนสีสว่างแบบมินิมัลลิสต์ระดับพรีเมียม (SaaS-style Off-White Theme) ร่วมกับบานหน้าต่างกระจกโปร่งแสงและเส้นขอบสีเงินบางเบาคมชัด
  - ออกแบบเลย์เอาต์การแสดงผลเต็มแผ่นหน้าจอ (Full Screen Width) โดยเอากำหนดขอบเขตขนาดพิกเซลคงที่ออกเพื่อความกว้างขวางเต็มสายตา
  - ติดตั้งแถบแผงข้างควบคุมที่พับและยืดหดได้อย่างมีอิสระ (Toggleable & Resizable Sidebar) ด้วยเทคนิค Drag-Resize เมาส์ลากแบ่งเส้นตั้งอย่างราบรื่น
  - ปรับปรุงมุมมองรายการเพลย์ลิสต์ให้เรียงรายเป็นตาราง Grid Thumbnail View ของภาพหน้าปกทรงจัตุรัสแบบ Spotify (รูปภาพเด่นบน หัวข้อและรายละเอียดอยู่ล่าง)
  - ปรับสเกลรายการเพลงในฝั่ง Workspace ให้ยืดสุดความสูงของหน้าจอ (Full Div Height)
  - เพิ่มสวิตช์เลือกสลับเลย์เอาต์ "รายการ (List)" และ "ตารางปกย่อ (Grid Thumbnail)" สำหรับแทร็กเพลงใน Workspace และผลลัพธ์การค้นหาจาก YouTube
  - ขจัดสัญลักษณ์สัญลักษณ์ Emoji ออกทั้งหมดเพื่อรักษาความสะอาดตาเรียบร้อยและเป็นทางการ
- กำหนดระดับความโค้งมนรูปภาพประกอบเป็นแบบมนปกติ (Standard Rounded Image) สำหรับรูปภาพทั้งหมดในระบบ เพื่อความคมชัดกะทัดรัด (เช่น หน้าเล่นเพลง แถบเครื่องเล่นด้านล่าง และกล่องรับคำขอ)
- เพิ่มระบบรองรับการยกเลิกการเลือกเพลย์ลิสต์ (Playlist Deselect Support) ทั้งในหน้าหลังบ้านและแถบเครื่องเล่นเพลงด้านล่าง (Deselect / Toggle Off เมื่อกดซ้ำตัวเดิม)
- พัฒนาแอปพลิเคชัน Android เนทีฟด้วยภาษา Kotlin (Native WebView App) สำหรับเปิดใช้งาน `https://musicbar.gracer.ai` โดยเฉพาะ:
  - ติดตั้งระบบ **Foreground Service** (ประเภท `mediaPlayback`) ทำงานเบื้องหลังพร้อมระบบควบคุมไอคอนแจ้งเตือนถาวร (Persistent Notification) และปุ่มคำสั่ง "ปิดแอป" (Exit) ที่สมบูรณ์
  - พัฒนาระบบถือครองทรัพยากรด้วย **WakeLock** และ **WifiLock (Full High Perf)** เพื่อล็อกการทำงานของซีพียูและเสาสัญญาณเชื่อมต่อ ไม่ให้หลับลึกขณะปิดหน้าจอหรือพักแอป
  - ปรับตั้งค่าสิทธิ์ภายในตัว WebView (ยกเว้นการเรียก `webView.onPause()` ใน Activity lifecycle) ทำให้จาวาสคริปต์สตรีมเพลงสามารถทำงานต่อในเบื้องหลังได้อย่างไร้รอยต่อ
  - อนุญาตการเล่นมีเดียอัตโนมัติ (`mediaPlaybackRequiresUserGesture = false`) และปรับตั้ง User-Agent ให้เสมือนเบราว์เซอร์สากลเพื่อความเข้ากันได้ 100%
  - จัดทำระบบคอมไพล์สำเร็จด้วย Gradle Kotlin DSL (.kts) บังคับสภาวะรันระดับ Java 21 และ Android SDK 34/35
  - สร้างไฟล์ติดตั้ง **Debug APK ขนาดเบาพิเศษ (5.5 MB)** สำเร็จและนำไปจัดวางบน Next.js Web App ที่ [public/app-debug.apk](file:///Users/apinan/Developments/music-bar/public/app-debug.apk) สำหรับให้บุคคลทั่วไปดาวน์โหลดได้โดยตรงผ่านระบบหน้าเว็บ
- เพิ่มไฟล์โครงสร้างพื้นฐานของโปรเจกต์สำหรับ Agent Development:
  - `.geminiignore` เพื่อละเว้นไฟล์ขนาดใหญ่และลดการใช้ Token
  - `SYSTEM_SUMMARY.md` บันทึกภาพรวมโครงสร้างของระบบ Music Bar (Next.js & React Native)
  - `CHANGELOG.md` เริ่มต้นบันทึกประวัติการพัฒนาและระบบ
- ประสบความสำเร็จในการคอมไพล์และสร้างไฟล์ติดตั้ง Android APK สำหรับแอปพลิเคชัน Music Bar Mobile:
  - **Debug APK (175 MB):** สำหรับการพัฒนาและดีบั๊กในระบบจำลอง/อุปกรณ์จริง
  - **Release APK (70 MB):** ผ่านการล้าง debug symbols และจัดโครงสร้างประสิทธิภาพสูงสุดสำหรับผู้ใช้จริง
- แก้ไขปัญหาความขัดแย้งของระบบ Android Native:
  - **Manifest Merger Conflict:** เพิ่มสิทธิ์การใช้ `tools:replace="android:exported"` ให้บริการเครื่องเล่นเพลงใน `AndroidManifest.xml` ขจัดข้อผิดพลาดในการรวบรวมไฟล์จัดเก็บระบบ
  - **Kotlin 2.x Type Mismatch:** ทำการเพิ่มเงื่อนไขการตรวจสอบค่า Null (Null Safety Checking) ให้แก่ตัวแปร `originalItem` ในโมดูลเครื่องเล่นเพลงของ `react-native-track-player` ภายใน `node_modules` ป้องกันปัญหา Type Mismatch ระดับคอมไพเลอร์
  - **Gradle Dependencies & Storage:** ติดตั้งโมดูล `react-native-worklets` คู่กับ `react-native-reanimated` v4 และแก้ไขปัญหาพื้นที่ดิสก์เต็มสำเร็จร่วมกับเครื่องมือล้างข้อมูลระบบ (`mole clean`)

### Fixed
- แก้ไขบั๊กหน้าเครื่องเล่นเพลงหลัก (`/`) ค้างที่สถานะ "ยังไม่มีเพลง" (Player Stuck on "No Songs"):
  - ปรับเปลี่ยนตรรกะการหาเพลย์ลิสต์เริ่มต้นให้มี Playlist Fallback เป็นเพลย์ลิสต์แรกของรายการ `playlists?.[0]?.id` ป้องกันความล้มเหลวหากไม่พบเพลย์ลิสต์รหัส `1`
  - เพิ่มระบบตรวจสอบดัชนีเพลงข้ามขอบเขต (Index Out of Bounds Protection) เมื่อสลับเพลย์ลิสต์หรือลบเพลงในเพลย์ลิสต์ โดยจะทำการรีเซ็ตดัชนีเป็น `0` อัตโนมัติ ป้องกันสถานะดนตรีกลายเป็น `null` ถาวร
