# รายการงานสำหรับการปรับปรุงธีมสว่างส่วนผู้ดูแลระบบแบบสมบูรณ์ (Tasks)

- `[x]` จัดตั้งกลไกการสลับคลาส `dark` และกำหนดคลาส `admin-mode` ใน `app/(system)/admin/page.tsx` ผ่าน `useEffect`
- `[x]` อัปเดตไฟล์สไตล์ส่วนกลาง `app/globals.css`:
  - `[x]` ประกาศค่าตัวแปร CSS ของธีมสว่างให้กับคลาส `html.admin-mode` และ `body.admin-mode`
  - `[x]` เพิ่มเฉดสีพื้นหลังแบบสว่างและลวดลายสำหรับ `html.admin-mode` และ `body.admin-mode`
  - `[x]` เพิ่มการควบคุมกล่องแจ้งเตือน Toasts ในธีมสว่างด้วย `body.admin-mode [data-sonner-toast]`
  - `[x]` เพิ่มการกำหนดค่าแถบเลื่อนหน้าจอ Scrollbars ในธีมสว่างด้วย `body.admin-mode ::-webkit-scrollbar-thumb`
- `[x]` รันตรวจสอบความถูกต้อง Next.js Build เพื่อเช็ค TypeScript
- `[x]` บันทึกประวัติการพัฒนาลงใน `CHANGELOG.md`
- `[x]` ดำเนินการ Git commit โค้ดที่ได้รับการแก้ไขอย่างเป็นระบบ




