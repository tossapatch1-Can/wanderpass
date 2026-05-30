# 👨‍🏫 Teaching Guide — Wanderpass Classroom (1 day)

For **CAN** (the instructor). Students never need to open this file.

---

## Pre-class checklist (the night before)

- [ ] Push this repo to your GitHub → set as a **template repo** so students can click "Use this template"
- [ ] Test the full flow end-to-end yourself with a fresh Supabase project (90 min)
- [ ] Make sure `npm install` + `npm run dev` works on a clean clone
- [ ] Pre-create student Anthropic API keys OR walk them through signup live (5 min/each)
- [ ] Print or share `README.md` setup steps as a "follow along" handout
- [ ] Have a working demo URL ready to show at the start: `https://wanderpass-demo.vercel.app` (your own)
- [ ] Prepare slide intro 5–10 min (sample outline below)

---

## Opening slide outline (5–10 min)

1. **The promise:** "By 5pm today, every one of you will have a live travel app on the internet."
2. **Show your demo** — chat → book → confirm → passport appears → download PNG → share URL on a phone QR code.
3. **The magic isn't the code, it's the thinking** — "Today you'll learn how to **describe** what you want, and let Claude Code write the code for you."
4. **Show the file tree once** — `/app` is what users see, `/api` is what they don't, `/supabase` is the database.
5. **Set expectations** — "You will get stuck. That's the point. Getting stuck + asking Claude Code to help = the skill we're building."

---

## The 8-block schedule

### Block 1 · 9:00–9:30 · Setup
**Goal:** Everyone has the starter running locally + a Vercel preview URL.
- Clone template repo
- `npm install`
- Walk through `.env.example` → `.env.local`
- Create Supabase project together
- Push to GitHub → import to Vercel

**Common stuck:** wrong env var names. Have them paste their `.env.local` into chat to debug.

### Block 2 · 9:30–10:30 · "See real data"
**Goal:** Landing page shows 8 destinations from THEIR Supabase.
- Run `schema.sql` in Supabase SQL Editor
- Run `seed.sql`
- Refresh localhost → cards switch from mock to real data ✨
- **Teaching moment:** the yellow banner disappears = "your database is talking to your app"

**Common stuck:** RLS not enabled → data doesn't load. Show how to check policies in Supabase dashboard.

### Block 3 · 10:30–12:00 · "The AI part"
**Goal:** `/chat` works end-to-end.
- Add `ANTHROPIC_API_KEY` to `.env.local` + Vercel
- Test "I want a beach holiday" → get 3 cards
- Open `src/app/api/chat/route.ts` together — explain tool use ("we tell Claude exactly what format we want back")
- **Customization challenge:** change the system prompt to make Claude sound like a pirate / their grandma / a 90s mall kid

**Common stuck:** API key wrong → 401 error. Print error in red bar already.

### LUNCH · 12:00–13:00

### Block 4 · 13:00–14:00 · "Booking"
**Goal:** User can submit a booking → it appears in Supabase.
- Walk through `destinations/[slug]/page.tsx` (server) + `booking-form.tsx` (client)
- Submit a booking → check Supabase `bookings` table → see the row
- **Teaching moment:** "This is what every booking app on Earth looks like underneath"

### Block 5 · 14:00–15:00 · "Auth + Passport"
**Goal:** Magic link login works → student sees their own passport (empty for now).
- Trigger magic link, open inbox, click → land on `/passport/me`
- Explain `passport/me` redirect logic
- Show empty passport state

**Common stuck:** redirect URL not configured in Supabase. Auth → URL Configuration → add `localhost:3000` + their Vercel URL.

### Block 6 · 15:00–16:00 · "Admin makes it real"
**Goal:** Admin confirms a booking → stamp appears on passport.
- Add student's email to `src/lib/admins.ts` (just for them locally)
- Visit `/admin` → confirm a booking → refresh passport → 🎉 stamp appears
- **Big moment** — the loop is closed

### Block 7 · 16:00–17:00 · "Make it shareable"
**Goal:** Passport downloads as PNG + students share their URL.
- Click "Save as PNG" → file downloads
- Click "Share" → URL copied
- Have them post to a class WhatsApp group with their passport URL
- **Stretch ideas board:** let students pick one thing to customize (stamp style, profile emoji, system prompt)

### Block 8 · 17:00–17:30 · "Deploy + celebrate"
**Goal:** Latest version on Vercel + group photo with QR codes.
- `git push` → Vercel auto-deploys
- Everyone shares their live URL
- **Closing line:** "You just built and shipped a real app. Tomorrow, you can build the next one even faster."

---

## When students get stuck — the script

1. "What does the error message say? Read it out loud."
2. "Have you tried pasting it into Claude Code and asking 'how do I fix this'?"
3. If still stuck — **don't type for them**. Ask them to describe what they're trying to do, then have them prompt Claude Code.
4. Only if 5+ minutes pass: jump in with the fix, but **explain why**.

This is the meta-skill. Not React. Not SQL. Just: **describe the goal clearly, read the error, iterate.**

---

## Things that will go wrong (and the fix)

| Symptom | Cause | Fix |
|---|---|---|
| `Cannot read property X of undefined` | env var typo | Compare to `.env.example` |
| Magic link goes nowhere | redirect URL not in Supabase | Auth → URL Config → add URLs |
| `/admin` redirects to home | email not in allowlist | Add to `src/lib/admins.ts` |
| Stamps don't appear after confirm | RLS or view missing | Re-run `schema.sql` (idempotent) |
| Chat returns "no destinations in database" | seed not run | Run `seed.sql` |
| Vercel build fails | env vars not set on Vercel | Project Settings → Environment Variables |

---

## After the workshop

- Encourage students to keep building (add their own destinations, change the theme to "restaurants" or "yoga classes")
- Share the leaderboard idea as homework
- Tell them: "The pattern you learned today — `pages + api routes + supabase + claude` — is the pattern for 80% of real apps you'd ever want to build."

🎉

---

# 🎯 Per-Block Customization Prompts (Cheat Sheet)

Each block, give students a **specific Claude Code prompt** to copy-paste. This is the "thing they do to make it theirs." Below are the exact prompts — battle-tested. Students paste these verbatim and watch the magic happen, then they iterate.

## Block 1 · 9:00–9:30 — Brand it
**File:** `src/lib/brand.ts` (the only file with brand text)
**Prompt to give Claude Code:**
> "เปิด `src/lib/brand.ts` แล้วเปลี่ยน `name` เป็น `[ชื่อแบรนด์ของฉัน]`, `tagline` เป็น `[คำที่อยากให้ขึ้นใหญ่]`, และ `heroSubhead` เป็นคำอธิบายสั้นๆ ของแบรนด์ฉัน — เก็บโทนเดิมไว้แต่ใส่ความเป็นฉัน"

**Verify:** Refresh `localhost:3200` — header + ชื่อ tab + hero text เปลี่ยนทั้งหมด.

## Block 2 · 9:30–10:30 — Add a 9th destination
**File:** Supabase SQL Editor (เปิดในเบราว์เซอร์)
**Prompt:**
> "เขียน SQL INSERT statement สำหรับ table destinations เพิ่ม destination ใหม่: slug='phuket', name='ภูเก็ต, Thailand', emoji='🏖️', short_description='[คำอธิบายภูเก็ต 1-2 ประโยค]', illustration_url='/stamps/phuket.svg', base_price_thb=25000"

**Verify:** Refresh `localhost:3200` — เห็น card ภูเก็ตในกริด (มี emoji 🏖️ และราคา ฿25,000).

## Block 3 · 10:30–12:00 ⭐ — AI persona swap (the magic moment)
**File:** `src/app/api/chat/route.ts` (เฉพาะ string `system:` ในการเรียก `anthropic.messages.create`)
**Prompt (recommend Thai luxury concierge for CAN's audience):**
> "เปิด `src/app/api/chat/route.ts` แล้วเปลี่ยน system prompt ให้ Claude พูดเป็น Thai luxury concierge — ขึ้นต้นทุก response ด้วย 'สวัสดีค่ะคุณ...', ใช้คำสุภาพระดับโรงแรม 5 ดาว, ถามงบเป็นบาทเสมอ, แนะนำเฉพาะ destination ที่ตรงกับช่วงเดือนที่ลูกค้าระบุ และห้ามแนะ destination ที่ไม่อยู่ใน catalog. รักษา tool_use schema เดิมไว้ทั้งหมด"

**Verify:** ไปที่ `/chat` พิมพ์ "อยากไปทะเล" → AI ตอบเปิดด้วย "สวัสดีค่ะคุณ" + persona เปลี่ยนเป็นคอนเซียร์จไทย.

**Teaching moment:** "นี่คือ AI ที่ทำงานให้คุณ — คุณบอกบุคลิก คุณบอกกฎ คุณบอก output format. เขาก็ทำตาม."

## Block 4 · 13:00–14:00 — Full-stack thread (the canonical lesson)
**Files:** `supabase/schema.sql` (ALTER), `src/app/destinations/[slug]/booking-form.tsx`, `src/app/api/bookings/route.ts`
**Prompt:**
> "ผมอยากเพิ่มช่องใหม่ในฟอร์มจอง — ให้ลูกค้าเลือก dietary preference (vegan, halal, none). ขั้นตอน: (1) เพิ่ม column `dietary_preference` text ในตาราง bookings — เขียน ALTER statement ให้ผมรันใน Supabase. (2) เพิ่ม select dropdown ใน booking-form.tsx ใต้ช่อง pax. (3) ส่งค่าใน POST request และให้ /api/bookings/route.ts บันทึก. แสดง code 3 ส่วนนี้ทีละไฟล์"

**Verify:** จอง → เปิด Supabase `bookings` table → เห็น row ใหม่มี dietary_preference.

**Teaching moment:** "Block นี้คุณแตะทุกชั้นของแอป — UI, API, database. นี่คือ full-stack หนึ่งคิว."

## Block 5 · 14:00–15:00 — Make the empty state yours
**File:** `src/components/passport/empty-passport.tsx`
**Prompt:**
> "เปิด `src/components/passport/empty-passport.tsx` แก้ EmptyPassport component ให้พูดว่า '[ข้อความ welcome ของคุณ เช่น ยังไม่เคยไปไหนเลย เริ่มทริปแรกกันเถอะ]' ใช้ emoji '[ของคุณ เช่น 🌴 หรือ ✈️]' และให้ปุ่ม CTA เขียนว่า 'เริ่มเลย' ลิงก์ไป /chat"

**Verify:** ไปที่ `/passport/me` (ก่อนมี stamp) → เห็นข้อความใหม่.

## Block 6 · 15:00–16:00 — Style + close the loop
**Files:** `src/lib/admins.ts`, `src/components/passport/passport-stamp.tsx`
**Prompt A (admin access):**
> "เปิด `src/lib/admins.ts` เพิ่ม email ของผม `[your-email@example.com]` เข้า ADMIN_EMAILS array"

**Prompt B (stamp restyle):**
> "เปิด `src/components/passport/passport-stamp.tsx` เปลี่ยน stamp ให้: rounded-full (เป็นวงกลม), border 4 ชั้น สีเหลือง #FEC74A, hover แล้วใหญ่ขึ้น scale-110, rotation random ระหว่าง -5 ถึง 5 องศา"

**Verify:** Login email ตัวเอง → ไป `/admin` → confirm booking → ไป `/passport/me` → เห็น stamp เป็นวงกลมสีเหลือง.

## Block 7 · 16:00–17:00 — Sharable preview
**File:** `src/app/passport/[username]/page.tsx`
**Prompt:**
> "เพิ่ม function `generateMetadata` exported จาก `src/app/passport/[username]/page.tsx` ให้แต่ละ passport มี: title = 'พาสปอร์ตของ [display_name]', description = '[display_name] เก็บแสตมป์มาแล้ว [n] ที่ — เริ่มทริปของคุณเอง', openGraph: { title, description, type: 'profile' }. ดึง display_name + stamp count จาก Supabase ใน function"

**Verify:** เปิด [opengraph.dev](https://www.opengraph.dev/) → paste URL passport → preview ขึ้นตามที่กำหนด.

## Block 8 · 17:00–17:30 — Deploy + debug
**No customization** — แค่ push + ตรวจว่า Vercel build ผ่าน. ถ้า fail:
**Prompt:**
> "Vercel deploy fail นี่คือ log: `[paste log]`. ช่วยอ่านแล้วบอกผมว่าต้องแก้ตรงไหนใน code (ภาษาไทย step-by-step)"

**Teaching moment:** "อนาคตคุณจะเจอ error แบบนี้ตลอดเวลา. ทักษะคือ — copy error ใส่ Claude, ทำตามที่บอก. นั่นคืออาชีพ developer สมัยใหม่."

---

# 🎯 Stretch Goal Prompts (เสร็จก่อนเลือก 1 อย่าง)

## Search bar on landing
> "เพิ่ม search input ที่ด้านบนของ destination grid ใน `src/app/page.tsx`. ตอนพิมพ์ filter cards ตามชื่อหรือ short_description (case-insensitive). ใช้ useState — ต้องเปลี่ยน page เป็น client component"

## Reviews + ratings
> "เพิ่มตาราง `reviews` ใน schema.sql (id, user_id, destination_id, rating 1-5, comment, created_at) + RLS policy. เพิ่ม section 'Reviews' ในหน้า destinations/[slug] แสดง avg rating ดาว + comment list"

## Profile edit page
> "สร้างหน้า `/profile` ที่ `src/app/profile/page.tsx` ให้ user แก้ display_name + เลือก avatar_emoji จาก grid 12 ตัว. ใช้ Supabase update เซฟลงตาราง profiles"

## Dark mode toggle
> "เพิ่มปุ่มสลับ dark/light ใน header ของ layout.tsx — toggle class 'dark' บน <html> + persist ใน localStorage. ใช้ Tailwind dark: prefix"

## EN/TH language toggle
> "สร้าง `src/lib/i18n.ts` ที่มี dict ของข้อความหลัก (TH/EN) + เพิ่มปุ่ม flag toggle ใน header. เก็บภาษาที่เลือกใน cookie"

## Dynamic OG image
> "สร้าง `src/app/passport/[username]/opengraph-image.tsx` ที่ generate รูป 1200x630 แสดง display_name + จำนวน stamp + 3 emoji ของ destination ล่าสุด ใช้ ImageResponse จาก next/og"

---

# 🚦 Mid-Day Checkpoints (ครูต้องเช็คก่อนไป Block ถัดไป)

- **After Block 4 (14:00):** ทุกคนต้องมี row ใหม่ใน Supabase `bookings` table. ใครยังไม่ได้ → หยุดทุกคน หา root cause ก่อน (ปกติคือ schema ยังไม่ได้รัน หรือ env vars ผิด)
- **After Block 6 (16:00):** ทุกคนต้องเห็น stamp ที่ตัวเองสร้างใน `/passport/me`. ใครยังไม่ได้ → ปัญหามักจะอยู่ที่ admin email ไม่ตรง หรือ public_passport_stamps view ขาดหาย
- **At 17:00:** เปิด MVP gate checklist อ่านทีละข้อ ให้ทุกคน raise hand ถ้าครบ — ใครยังไม่ครบ ใช้ 30 นาทีสุดท้าย B8 ช่วยให้ถึง gate ก่อน celebrate

