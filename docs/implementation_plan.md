# แผนการจัดขนาดรูปภาพปกและปรับระดับความโค้งมนของกล่องควบคุม (Playlist Thumbnail Scaling & Container Border-Radius Adjustments)

แผนงานนี้จัดทำขึ้นเพื่อแก้ไขการแสดงผลรูปปกเพลย์ลิสต์ในมุมมองรายการ (List View / Table) ที่มีขนาดใหญ่ผิดปกติเนื่องจากการใช้ภาพขนาดดั้งเดิม และปรับแต่งลักษณะความโค้งมนของกล่องคอนโซลหลัก (Admin Containers) ทั้งหมดในหน้าร้านให้เป็น `rounded-lg` เพื่อความกลมเกลียดพรีเมียม

---

## หัวข้อที่ต้องการการรีวิวจากผู้ใช้งาน (User Review Required)

> [!NOTE]
> - **การแยกสไตล์การแสดงรูปปก (Playlist Cover View Separation):**
>   - ใน **มุมมองตาราง (Grid View)** รูปภาพปกจะแสดงผลแบบสี่เหลี่ยมจัตุรัสเต็มแผ่นการ์ด (`aspect-square w-full h-full text-lg`)
>   - ใน **มุมมองรายการ (List View / Table)** รูปภาพปกจะแสดงผลขนาดกะทัดรัดขนาดกว้างยาว `w-8 h-8` พร้อมตัวหนังสือขนาดเล็ก `text-[10px]` สำหรับกรณีไม่มีหน้าปก เพื่อรักษาความสมมาตรของตาราง
> - **การปรับความโค้งมนของกล่อง (Container Roundness -> lg):**
>   - กล่องข้อมูลหลักในแผงผู้ดูแลระบบ (`admin-surface`) รวมถึงกล่องใส่ PIN ล็อกอิน (`PinEntry`) จะเปลี่ยนจาก `rounded` หรือ `rounded-2xl` เป็นระดับความโค้งมนปกติแบบ `rounded-lg` เพื่อตอบสนองสุนทรียภาพแห่งความทันสมัยและสม่ำเสมอ

---

## รายการไฟล์ที่จะสร้างและแก้ไข (Proposed Changes)

### 1. แผงหน้าการทำงานหลักของผู้ดูแลระบบ (Admin View Component)

#### [MODIFY] [admin-view.tsx](file:///Users/apinan/Developments/music-bar/components/admin-view.tsx)
- ปรับแต่งฟังก์ชัน `PlaylistCover` ให้รับพารามิเตอร์ `className` เข้ามาเพื่อควบคุมมิติความกว้างและส่วนสูงของกล่องและรูปภาพปก
- ในมุมมองตาราง (Cards View) ให้กำหนดสไตล์ปกเป็น `aspect-square w-full h-full text-lg` บน wrapper
- ในมุมมองตารางรายการ (Table View) ให้ส่งพารามิเตอร์ `className="w-8 h-8 text-[10px]"` เข้าสู่ `PlaylistCover`
- เปลี่ยนคลาสความโค้งมนของกล่องคอนโซลควบคุม `.admin-surface` ทั้ง 3 จุด จาก `rounded` เป็น `rounded-lg`

---

### 2. กล่องลงทะเบียน PIN (Pin Entry Component)

#### [MODIFY] [pin-entry.tsx](file:///Users/apinan/Developments/music-bar/components/pin-entry.tsx)
- เปลี่ยนคลาสความโค้งมนของกล่องกรอกข้อมูลความปลอดภัยหลักจาก `rounded-2xl` เป็น `rounded-lg` เพื่อความเสมอกันกับแผงคอนโซลควบคุมหลัก

---

## แผนการตรวจสอบความถูกต้อง (Verification Plan)

### การคอมไพล์โปรแกรม (Build Verification)
- รันคำสั่ง `bun run build` หรือ `npm run build` เพื่อให้แน่ใจว่า Next.js สามารถแปลภาษาและประเภทข้อมูล TypeScript ได้อย่างสมบูรณ์แบบ

### การตรวจสอบด้วยสายตาและการใช้งาน (Manual Verification)
1. เข้าไปที่หน้าผู้ดูแลระบบ ตรวจสอบความโค้งมนของกล่อง PIN ล็อกอินว่ากลายเป็น `rounded-lg`
2. ทดสอบเปลี่ยนมุมมองของเพลย์ลิสต์ระหว่าง Cards View และ Table View
3. ตรวจสอบว่ารูปภาพปกใน Table View แสดงผลในขนาดกะทัดรัด `w-8 h-8` เป็นสัดส่วนเรียบร้อย สวยงาม และไม่มีรูปขนาดยักษ์ผิดส่วน
4. ตรวจสอบแผงคอนโซลทั้ง 3 กล่องหลักในแผงแอดมินว่ามีความโค้งมนระดับ `rounded-lg`


