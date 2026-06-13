# Implementation Plan: Full Multi-Tenant Architecture + Google Login via Firebase Authentication

สถานะเอกสาร: **implemented รอบแรกแล้ว**

เป้าหมายคือแปลง Music Bar จากระบบร้านเดียวที่ใช้ PIN global เป็นระบบหลาย tenant เต็มรูปแบบ โดยใช้ Google Login ผ่าน Firebase Authentication สำหรับผู้ดูแลร้าน และแยกข้อมูลทุกส่วนของแต่ละร้านออกจากกันอย่างบังคับทั้งระดับ database, API, session, URL, localStorage และ UI state

เอกสารนี้เริ่มจาก implementation plan และถูกใช้เป็นแนวทางในการลงมือรอบแรกแล้ว โดยรอบแรกครอบคลุม Firebase Google login, tenant schema, tenant-scoped API routes, tenant-aware QR/request/player URLs, localStorage namespace และ database migration สำหรับ tenant `main`

ผลการ apply database migration:

- backup ก่อน migration: `database/backups/pre_multi_tenant_20260613_002537.sql`
- default tenant slug: `main`
- backfill แล้ว: playlists 44 รายการ, playlist songs 3382 รายการ, song requests 14 รายการ, app settings 3 รายการ, active players 9 รายการ

ผล verification:

- `npx tsc --noEmit` ผ่าน
- `npm run build` ผ่าน
- smoke test API tenant `main` ผ่าน:
  - `/api/tenants/by-slug/main`
  - `/api/playlists?tenant=main`
  - `/api/settings?tenant=main`
  - `/api/requests?tenant=main`

---

## 1. ขอบเขตและหลักการออกแบบ

### เป้าหมายหลัก

- รองรับหลายร้าน / หลายองค์กรใน database เดียว
- ผู้ใช้ login ด้วย Google ผ่าน Firebase Authentication
- ผู้ใช้หนึ่งคนอยู่ได้หลาย tenant และเลือก tenant ที่ต้องการจัดการได้
- ข้อมูลเพลง, playlist, queue, player, settings, QR link ต้องถูกแยกตาม tenant เสมอ
- หน้า request สำหรับลูกค้าไม่ต้อง login แต่ต้อง resolve tenant จาก URL อย่างชัดเจน
- ตัดระบบ PIN global เดิมออกจากเส้นทาง admin และแทนที่ด้วย session cookie ที่ออกโดย Firebase Admin SDK

### Non-goals รอบแรก

- ยังไม่ทำ billing/subscription
- ยังไม่ทำ custom domain ต่อ tenant ในเฟสแรก
- ยังไม่ทำ Firebase Security Rules เพราะ backend ปัจจุบันใช้ PostgreSQL ผ่าน Next.js API routes ไม่ได้ query Firebase client database โดยตรง
- ยังไม่ย้าย PostgreSQL ไป Firestore

### แนวทาง tenant resolution ที่เสนอ

ใช้ path-based tenancy ก่อนเพื่อ deploy ง่ายบน Vercel:

- Admin: `/admin` หลัง login แล้วเลือก tenant จาก session/tenant switcher
- Customer request: `/t/[tenantSlug]/request`
- Player screen: `/t/[tenantSlug]` หรือ `/t/[tenantSlug]/player`
- Legacy compatibility: `/request` redirect ไป tenant เดียวเฉพาะกรณี database มี tenant เดียว หรือแสดงหน้าให้เลือก/แจ้ง error

เหตุผล: โค้ดปัจจุบันมี `/request`, `/admin`, root player และ API global อยู่แล้ว การใช้ slug ใน path ทำให้ QR code และ public page แยกร้านได้ทันทีโดยไม่ต้องจัดการ wildcard domain ตั้งแต่แรก

---

## 2. สถาปัตยกรรม Authentication

### Firebase client flow

เพิ่ม Firebase Web SDK สำหรับหน้า login:

- ใช้ `GoogleAuthProvider`
- Desktop ใช้ `signInWithPopup`
- Mobile หรือกรณี popup ถูก block ใช้ `signInWithRedirect` + `getRedirectResult`
- หลัง Firebase login สำเร็จ ดึง `idToken` จาก user แล้วส่งไป backend

อ้างอิง Firebase docs:

- Google sign-in for Web: https://firebase.google.com/docs/auth/web/google-signin
- Firebase ระบุว่ารองรับทั้ง popup และ redirect โดย redirect เหมาะกับ mobile

### Server session flow

เพิ่ม Firebase Admin SDK ฝั่ง server:

- endpoint ใหม่ `POST /api/auth/session`
- รับ Firebase ID token จาก client
- ตรวจสอบ token ด้วย Firebase Admin SDK
- สร้างหรือ sync user ใน PostgreSQL
- ตรวจ membership ของ user กับ tenant
- ออก httpOnly session cookie เช่น `music_bar_session`
- endpoint `GET /api/auth/me` คืน user + tenant memberships + active tenant
- endpoint `DELETE /api/auth/session` logout และลบ cookie

อ้างอิง Firebase docs:

- Verify ID tokens: https://firebase.google.com/docs/auth/admin/verify-id-tokens
- Manage session cookies: https://firebase.google.com/docs/auth/admin/manage-cookies

### ทำไมใช้ session cookie แทนส่ง ID token ทุก request

- API routes ปัจจุบันใช้ cookie auth อยู่แล้ว จึง migrate ง่าย
- httpOnly cookie ลดความเสี่ยง token ถูกอ่านจาก JavaScript
- Server components / API routes อ่าน session ได้โดยตรงจาก `cookies()`
- รองรับ SWR fetch เดิมโดยไม่ต้อง inject Authorization header ทุกจุด

### Environment variables ที่ต้องเพิ่ม

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

SESSION_COOKIE_NAME=music_bar_session
SESSION_COOKIE_DAYS=7
```

หมายเหตุ: `FIREBASE_PRIVATE_KEY` ต้องรองรับ newline escape บน Vercel

---

## 3. Database Schema Plan

### ตารางใหม่

#### `tenants`

- `id uuid primary key default gen_random_uuid()`
- `slug varchar(80) unique not null`
- `name varchar(255) not null`
- `display_name varchar(255)`
- `logo_url text`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`
- `created_by_user_id uuid`
- `is_active boolean default true`

#### `users`

- `id uuid primary key default gen_random_uuid()`
- `firebase_uid varchar(128) unique not null`
- `email varchar(320) unique not null`
- `name varchar(255)`
- `photo_url text`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`
- `last_login_at timestamptz`

#### `tenant_memberships`

- `id uuid primary key default gen_random_uuid()`
- `tenant_id uuid not null references tenants(id) on delete cascade`
- `user_id uuid not null references users(id) on delete cascade`
- `role varchar(30) not null check (role in ('owner', 'admin', 'staff'))`
- `created_at timestamptz default now()`
- `unique (tenant_id, user_id)`

#### `tenant_invites` เฟสถัดไป แต่ควรเตรียม schema

- `id uuid primary key default gen_random_uuid()`
- `tenant_id uuid not null references tenants(id) on delete cascade`
- `email varchar(320) not null`
- `role varchar(30) not null`
- `token_hash text unique not null`
- `expires_at timestamptz not null`
- `accepted_at timestamptz`
- `created_at timestamptz default now()`

### เพิ่ม `tenant_id` ให้ tables เดิม

ต้องเพิ่ม `tenant_id uuid not null references tenants(id) on delete cascade` ใน:

- `playlists`
- `playlist_songs`
- `song_requests`
- `app_settings`
- `active_players`

### Constraints และ indexes ใหม่

- `playlists`: index `(tenant_id, is_default)`, `(tenant_id, created_at desc)`
- `playlist_songs`: index `(tenant_id, playlist_id, position)`, unique optional `(tenant_id, playlist_id, youtube_id)`
- `song_requests`: index `(tenant_id, status, created_at)`, unique partial สำหรับเพลง pending ซ้ำใน tenant เดียว:
  - `unique (tenant_id, youtube_id) where status = 'pending'`
- `app_settings`: เปลี่ยน unique จาก `key` global เป็น `unique (tenant_id, key)`
- `active_players`: เปลี่ยน conflict target จาก `device_id` global เป็น `unique (tenant_id, device_id)`

### Migration strategy

1. สร้าง tenant default เช่น slug `default` หรือ slug ตามชื่อร้านปัจจุบัน
2. เพิ่ม nullable `tenant_id` ให้ tables เดิม
3. backfill ข้อมูลเดิมทั้งหมดเข้า tenant default
4. สร้าง indexes/constraints ใหม่
5. เปลี่ยน `tenant_id` เป็น `not null`
6. แก้ unique constraints เดิมที่เป็น global
7. เพิ่ม seed/default settings ต่อ tenant

ควรแยกไฟล์ migration เป็น:

- `database/migrations/001_multi_tenant_base.sql`
- `database/migrations/002_backfill_default_tenant.sql`
- `database/migrations/003_enforce_tenant_constraints.sql`

---

## 4. Server-Side Tenant Boundary

### Helper modules ใหม่

#### `lib/firebase/admin.ts`

- initialize Firebase Admin SDK แบบ singleton
- export `adminAuth`
- handle private key newline

#### `lib/firebase/client.ts`

- initialize Firebase client app
- export auth provider/helpers

#### `lib/auth/session.ts`

- `createSessionCookie(idToken)`
- `verifySessionCookie()`
- `getCurrentUser()`
- `requireUser()`
- `clearSessionCookie()`

#### `lib/tenancy.ts`

- `getTenantBySlug(slug)`
- `getUserTenants(userId)`
- `requireTenantAccess(userId, tenantId, allowedRoles?)`
- `getActiveTenantFromRequest(request/cookies)`
- `requireTenantContext(request, options)`

#### `lib/db-tenant.ts`

แนะนำเพิ่ม helper query pattern เพื่อลดโอกาสลืม filter:

- `tenantSql(tenantId)` หรือ helper functions ราย domain
- อย่างน้อยต้องมี function กลางสำหรับ route handlers เช่น `withTenant(request, handler)`

### กฎสำคัญ

- ทุก API route ที่อ่าน/เขียน tenant data ต้อง resolve tenant ก่อน query
- ทุก query ต้องมี `tenant_id = ${tenant.id}`
- write operation ต้องตรวจ role ขั้นต่ำ:
  - owner/admin: settings, playlists, player management
  - staff: manage requests/player controls ตามที่กำหนด
  - public: create request ได้เฉพาะผ่าน tenant slug และเฉพาะเมื่อ setting เปิดรับเพลง
- ห้ามเชื่อ `tenant_id` จาก request body โดยตรง

---

## 5. API Route Migration Plan

### Auth routes

แทนที่ `app/api/auth/route.ts` เดิม:

- `POST /api/auth/session`: login จาก Firebase ID token
- `GET /api/auth/me`: session check + profile + tenant memberships
- `DELETE /api/auth/session`: logout
- optional `POST /api/auth/active-tenant`: set active tenant cookie

### Tenant routes ใหม่

- `GET /api/tenants`: list tenants ของ user
- `POST /api/tenants`: create tenant และตั้ง user เป็น owner
- `PATCH /api/tenants/[tenantId]`: update tenant metadata
- `GET /api/tenants/by-slug/[slug]`: public tenant metadata สำหรับ request/player page

### Existing routes ที่ต้องใส่ tenant boundary

#### `/api/playlists`

- GET: return เฉพาะ playlists ของ tenant
- POST/PATCH/DELETE: require admin/staff role ตามสิทธิ์
- default playlist update ต้อง unset default เฉพาะใน tenant เดียว
- `active_playlist_ids` setting ต้อง update เฉพาะ tenant เดียว

#### `/api/playlists/[id]/songs`

- ตรวจว่า playlist อยู่ใน tenant ก่อนทุก action
- ทุก insert song ใส่ `tenant_id`
- reorder/delete/filter ต้องมี tenant condition

#### `/api/requests`

- GET admin/player: tenant จาก active tenant/session หรือ tenant slug
- GET customer device queue: tenant slug + device id
- POST customer request: tenant slug required, insert `tenant_id`
- duplicate check ต้องอยู่ใน tenant เดียว
- PATCH/DELETE: require authenticated tenant access ยกเว้นถ้าจะเปิด public cancel เฉพาะ own device ต้องออกแบบเพิ่ม

#### `/api/settings`

- GET/PATCH เฉพาะ tenant
- unique key ต้องเป็น `(tenant_id, key)`

#### `/api/players` และ `/api/players/[id]`

- player ping ต้องรับ tenant slug หรือ resolve จาก route context
- `device_id` ซ้ำได้ข้าม tenant
- admin list/toggle/delete เฉพาะ tenant

#### `/api/youtube/*`

- Search อาจไม่ต้อง tenant filter เพราะใช้ API key global
- แต่ต้องพิจารณา rate limit ต่อ tenant ในอนาคต
- Import playlist ต้อง require tenant access และบันทึก tenant_id ทุก row

---

## 6. Routing และ Frontend Plan

### Login/admin

แทนที่ `PinEntry` ด้วยหน้า Google Login:

- หน้า unauthenticated แสดงปุ่ม "Continue with Google"
- หลัง login เรียก `/api/auth/session`
- ถ้ามี tenant เดียว เข้า admin ทันที
- ถ้ามีหลาย tenant แสดง tenant switcher
- ถ้าไม่มี tenant แสดง onboarding สร้างร้านแรก

ไฟล์ที่คาดว่าจะเปลี่ยน:

- `app/(system)/admin/layout.tsx`
- `components/pin-entry.tsx` เปลี่ยนเป็น `components/login-view.tsx` หรือ archive ถ้าไม่ใช้แล้ว
- `components/admin-shell.tsx` เพิ่ม user avatar, tenant switcher, logout

### Tenant context ฝั่ง client

เพิ่ม provider ใหม่:

- `context/auth-context.tsx`: user/session/tenants/logout
- `context/tenant-context.tsx`: active tenant, tenant slug, switch tenant

ปรับ `PlayerProvider`:

- รับ `tenantSlug` หรือ active tenant จาก context
- เปลี่ยน SWR keys จาก global เช่น `/api/requests` เป็น tenant-aware เช่น `/api/tenant-data/requests` หรือ query/header ที่ server resolve ได้
- namespace localStorage:
  - `music_bar:${tenantSlug}:device_id`
  - `music_bar:${tenantSlug}:device_name`
  - `music_bar:${tenantSlug}:player_state`

### Customer request page

เพิ่ม route:

- `app/t/[tenantSlug]/request/page.tsx`

ปรับ QR:

- Admin QR ต้อง generate เป็น `${origin}/t/${tenant.slug}/request`
- หน้า request แสดง tenant display name/logo
- ถ้า tenant slug invalid หรือ inactive ให้แสดง not found/closed state

### Player page

เพิ่ม route:

- `app/t/[tenantSlug]/page.tsx` หรือ `app/t/[tenantSlug]/player/page.tsx`

ระบบ player ping ต้องส่ง tenant context ไป `/api/players`

### Legacy route handling

- `/request`: ถ้ามี tenant เดียว redirect ไป `/t/[slug]/request`; ถ้ามีหลาย tenant ให้แสดงหน้า error พร้อมข้อความให้สแกน QR ใหม่
- root `/`: ถ้ามี active tenant เปิด player ของ tenant นั้น; ไม่เช่นนั้น redirect login/admin

---

## 7. Authorization Model

### Roles

- `owner`: จัดการ tenant, สมาชิก, settings, playlists, players, requests ทั้งหมด
- `admin`: จัดการ music system ได้ทั้งหมด ยกเว้นลบ tenant/เปลี่ยน owner
- `staff`: ใช้งานหน้าควบคุม queue/player เบื้องต้น เพิ่ม/ลบ request ได้ แต่ไม่จัดการสมาชิก

### Route permission matrix

- Create tenant: authenticated user
- Update tenant profile: owner/admin
- Invite/manage members: owner
- Playlist CRUD/import: owner/admin
- Settings update: owner/admin
- Player toggle/delete: owner/admin
- Request queue PATCH/DELETE: owner/admin/staff
- Public request POST: anonymous allowed ผ่าน tenant slug และ setting เปิดอยู่
- YouTube search from public request: anonymous allowed ผ่าน tenant slug, optional rate limit

---

## 8. Data Isolation Verification Plan

### Automated checks

- TypeScript: `bun run build`
- Add route/helper unit tests ถ้า test framework พร้อม หรือเพิ่ม lightweight integration script
- Database migration dry run กับ local/test database

### Manual tenant isolation tests

1. สร้าง Tenant A และ Tenant B ด้วย Google user เดียวกัน
2. เพิ่ม playlists/requests ใน Tenant A
3. Switch ไป Tenant B แล้วยืนยันว่าไม่เห็นข้อมูล Tenant A
4. QR ของ Tenant A เปิด `/t/a/request` และ request เข้าเฉพาะ A
5. QR ของ Tenant B เปิด `/t/b/request` และ request เข้าเฉพาะ B
6. device_id เดียวกันใน browser เดียวกันต้องถูกแยกด้วย localStorage namespace
7. ลองยิง API ด้วย playlist id ของ tenant อื่น ต้องได้ 403 หรือ 404
8. ปิดรับ request ใน Tenant A ต้องไม่กระทบ Tenant B

### Security checks

- ตรวจทุก SQL query ว่ามี tenant filter
- ตรวจ write routes ว่าไม่รับ tenant_id จาก body
- ตรวจ session cookie เป็น `httpOnly`, `secure` ใน production, `sameSite=lax`
- ตรวจ logout ลบ session cookie และ clear client auth state
- ตรวจ Firebase ID token/session cookie verification failure คืน 401

---

## 9. Implementation Phases

### Phase 0: Prep และ backup

- backup database ก่อน migration
- สร้าง branch ใหม่ เช่น `codex/multi-tenant-firebase-auth`
- เพิ่ม migration files แต่ยังไม่ apply production
- บันทึก env vars ที่ต้องตั้งใน Vercel/Firebase

### Phase 1: Auth foundation

- ติดตั้ง dependencies:
  - `firebase`
  - `firebase-admin`
- เพิ่ม Firebase client/admin modules
- เพิ่ม auth session routes
- เปลี่ยน admin layout จาก PIN เป็น Google login
- เพิ่ม `/api/auth/me`
- ยังไม่เปิด tenant isolation เต็ม แค่ให้ login/session ทำงานก่อน

### Phase 2: Database multi-tenant migration

- สร้าง tables `tenants`, `users`, `tenant_memberships`, `tenant_invites`
- เพิ่ม/backfill/enforce `tenant_id`
- แก้ unique constraints และ indexes
- สร้าง default tenant จากข้อมูลเดิม

### Phase 3: Tenant context + admin UX

- เพิ่ม tenant list/create/switch APIs
- เพิ่ม auth/tenant providers
- เพิ่ม tenant switcher ใน `AdminShell`
- เพิ่ม onboarding สร้างร้านแรก
- ปรับ logout และ session loading states

### Phase 4: API isolation

- ใส่ `requireTenantContext` ในทุก API route ที่เกี่ยวกับข้อมูลร้าน
- ปรับ query ทั้งหมดให้ filter tenant
- ปรับ duplicate checks, default playlist, app settings, active players ให้เป็น per tenant
- เพิ่ม authorization per role

### Phase 5: Public tenant routes

- เพิ่ม `/t/[tenantSlug]/request`
- เพิ่ม `/t/[tenantSlug]/player`
- ปรับ QR generation ทั้ง admin และ request page
- ปรับ legacy `/request`
- namespace localStorage keys ใน `RequestView` และ `PlayerProvider`

### Phase 6: Verification + hardening

- run build
- run migration dry run
- manual tenant isolation checklist
- audit API route SQL
- เพิ่ม rate limiting plan สำหรับ public request/search ถ้าจำเป็น
- update README และ deployment notes

---

## 10. ไฟล์ที่คาดว่าจะถูกสร้าง/แก้

### New files

- `lib/firebase/client.ts`
- `lib/firebase/admin.ts`
- `lib/auth/session.ts`
- `lib/auth/current-user.ts`
- `lib/tenancy.ts`
- `context/auth-context.tsx`
- `context/tenant-context.tsx`
- `components/login-view.tsx`
- `components/tenant-switcher.tsx`
- `components/tenant-onboarding.tsx`
- `app/api/auth/session/route.ts`
- `app/api/auth/me/route.ts`
- `app/api/tenants/route.ts`
- `app/api/tenants/by-slug/[slug]/route.ts`
- `app/t/[tenantSlug]/page.tsx`
- `app/t/[tenantSlug]/request/page.tsx`
- `database/migrations/001_multi_tenant_base.sql`
- `database/migrations/002_backfill_default_tenant.sql`
- `database/migrations/003_enforce_tenant_constraints.sql`

### Modify files

- `package.json`
- `.env.local` documentation only, do not commit secrets
- `lib/types.ts`
- `app/(system)/admin/layout.tsx`
- `components/admin-shell.tsx`
- `components/request-view.tsx`
- `context/player-context.tsx`
- `app/request/page.tsx`
- `app/(system)/page.tsx`
- all tenant data API routes:
  - `app/api/auth/route.ts`
  - `app/api/playlists/route.ts`
  - `app/api/playlists/[id]/songs/route.ts`
  - `app/api/playlists/[id]/export/route.ts`
  - `app/api/playlists/import-youtube/route.ts`
  - `app/api/requests/route.ts`
  - `app/api/settings/route.ts`
  - `app/api/players/route.ts`
  - `app/api/players/[id]/route.ts`

---

## 11. Open Decisions สำหรับรีวิว

1. Slug เริ่มต้นของร้านเดิมจะใช้ชื่ออะไร เช่น `default`, `main`, หรือชื่อร้านจริง
2. ต้องการให้ Google account แรกที่ login เป็น owner ของ default tenant เลยหรือไม่
3. ต้องการให้สร้าง tenant ใหม่ได้ทุก Google account หรือจำกัด domain/email allowlist
4. Public request URL ต้องเป็น `/t/[tenantSlug]/request` พอไหม หรืออยากวางแผน custom domain เช่น `bar-a.example.com`
5. Role `staff` ต้องมีสิทธิ์ลบ/skip request แค่ไหน
6. จะเก็บ PIN fallback ไว้ชั่วคราวในช่วง migration หรือถอดออกทันที

---

## 12. Acceptance Criteria

- Admin login ด้วย Google ได้ และ session อยู่ใน httpOnly cookie
- User เห็นเฉพาะ tenants ที่เป็นสมาชิก
- Tenant switch แล้วข้อมูล playlist/request/player/settings เปลี่ยนตาม tenant
- Customer QR ของแต่ละ tenant เปิดหน้า request ถูก tenant
- ข้อมูล tenant หนึ่งไม่รั่วไปอีก tenant ทั้งใน UI และ API
- ข้อมูลเดิมถูก migrate เข้า default tenant โดยไม่หาย
- `bun run build` ผ่าน
- Manual isolation checklist ผ่านทุกข้อ
