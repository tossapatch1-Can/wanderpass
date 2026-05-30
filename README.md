# 🛂 Wanderpass

> สมุดพาสปอร์ตการเดินทางดิจิทัล — เอารูปจริงของทริปที่เคยไปมาลง ระบบสร้างเป็น **แสตมป์การ์ตูนรายประเทศ** เขียนบันทึก แล้วแชร์ลงโซเชียลพร้อมลายน้ำ Wanvela · มี Trip Planner เลื่อนงบ + AI ช่วยร่างแผน

Built with **Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · Supabase · Anthropic · Resend**. Mobile-first, navy/gold/cream, ภาษาไทย.

---

## หน้าจอ (PRD screens A–F)

| Route | หน้า |
|---|---|
| `/` · `/login` | Landing + เข้าสู่ระบบด้วย Google (A) |
| `/passport/[username]` | My Passport — แผนที่ + สถิติ + grid แสตมป์ (B) |
| `/passport/add` | บันทึกทริป — เลือกประเทศ + อัปรูปจริง + comment (C) |
| `/passport/[username]/country/[code]` | รายละเอียดประเทศ — แกลเลอรี + public/private + แก้ไข/ลบ/รายงาน (E) |
| `/plan` | Trip Planner — slider งบ + AI itinerary → Wishlist (D) |
| `/passport/[username]/share` | แชร์ — รูป + ลายน้ำ Wanvela → IG/FB/TikTok/ดาวน์โหลด (F) |
| `/admin` | ผู้ดูแล — ผู้ใช้ · ประเทศยอดฮิต+แชร์ · คิวรายงาน · คลังแสตมป์ |

---

## Setup (สรุป)

1. `npm install`
2. สร้าง Supabase project แล้วทำตาม **[`supabase/SETUP.md`](supabase/SETUP.md)**:
   - รัน `schema.sql` → `seed-countries.sql` → `storage.sql` ใน SQL Editor
   - ตั้งค่า **Google OAuth** (Google Cloud + Supabase provider + redirect URLs)
   - ตั้งค่า **Resend** (อีเมล) — ออปชัน
3. `cp .env.example .env.local` แล้วใส่ค่า (Supabase, Anthropic, Resend, `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET`)
4. แก้ `ADMIN_EMAILS` ใน [`src/lib/admins.ts`](src/lib/admins.ts) เป็นอีเมลคุณ
5. `npm run dev` → <http://localhost:3000>

> ก่อนตั้งค่า Supabase แอปจะแสดงหน้า "เชื่อมต่อ Supabase" แทนการ crash

---

## โครงสร้างข้อมูล (`supabase/schema.sql`)

`countries` (คลังแสตมป์ ~136 ประเทศ) · `trips` (1 ประเทศ = 1 แสตมป์) · `trip_photos` (รูปจริงใน Storage, ≤10/ประเทศ) · `wishlist` · `share_stats` · `reports` · `profiles`. ทุกตารางมี RLS — passport เป็น **private โดยค่าเริ่มต้น** เปิด public ได้รายประเทศ

แสตมป์ทั้งหมด gen จาก [`scripts/countries.mjs`](scripts/countries.mjs):
```bash
node scripts/generate-stamps.mjs   # → public/stamps/<code>.svg
node scripts/generate-seed.mjs     # → supabase/seed-countries.sql
```

---

## รูปภาพ

อัปโหลดจาก browser ตรงเข้า Supabase Storage (ไม่ผ่าน Next route): แปลง HEIC→JPEG (`heic2any`), บีบอัด (`browser-image-compression`), ≤10MB/รูป · รับ JPG/PNG/HEIC/WebP

## งานเบื้องหลัง

- **อีเมลต้อนรับ** — ส่งครั้งแรกที่ login (ใน `auth/callback`)
- **เตือน Wishlist** — `GET /api/notify/wishlist-reminders` (ป้องกันด้วย `CRON_SECRET`, เรียกรายสัปดาห์เช่น Vercel Cron)

## v2 / out of scope

ราคาจริง trip.com/Agoda · ระบบจอง · OTP เบอร์โทร · ดาวน์โหลด PDF Travel Book · ตั้งค่าลายน้ำใน admin (v1 ลายน้ำเป็นข้อความ Wanvela คงที่) · หลายภาษา
