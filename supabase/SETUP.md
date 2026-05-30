# Wanderpass — Supabase & external setup

Follow these once per project. ✅ = you do it in the Supabase / Google / Resend dashboards.

## 1. Run the SQL (in order)

Supabase Dashboard → **SQL Editor** → New query → paste each file → **Run**:

1. `supabase/schema.sql` — tables, RLS, triggers (drops the old booking model)
2. `supabase/seed-countries.sql` — the country stamp library (~136 countries)
   - Regenerate anytime with `node scripts/generate-seed.mjs`
3. `supabase/storage.sql` — the private `trip-photos` bucket + its policies

Verify: **Table Editor** shows `countries`, `trips`, `trip_photos`, `wishlist`,
`share_stats`, `reports`, `profiles`. `countries` has rows.

## 2. ✅ Google OAuth

1. **Google Cloud Console** → APIs & Services → Credentials → *Create OAuth client ID* → Web application.
   - Authorized redirect URI: `https://<PROJECT-REF>.supabase.co/auth/v1/callback`
2. **Supabase** → Authentication → Providers → **Google** → enable → paste Client ID + Secret.
3. **Supabase** → Authentication → URL Configuration:
   - Site URL: `http://localhost:3000` (dev) — change to your Vercel URL in prod.
   - Redirect URLs: add `http://localhost:3000/auth/callback` **and** `https://<your-vercel-domain>/auth/callback`.

The app calls `signInWithOAuth({ provider: 'google' })` and handles the code
exchange in `src/app/auth/callback/route.ts`. A `profiles` row is auto-created
by the `handle_new_user` trigger.

## 3. ✅ Storage

`storage.sql` already created the bucket. Confirm under **Storage** that
`trip-photos` exists and is **not public**. (Photos are served via signed URLs.)

## 4. ✅ Resend (emails — optional)

1. **resend.com** → API Keys → create key → put in `.env.local` as `RESEND_API_KEY`.
2. Verify your sending domain, then set `RESEND_FROM` (e.g. `Wanderpass <hello@yourdomain.com>`).

- **Welcome email** sends automatically on first Google sign-in (no setup beyond the key).
- **Wishlist reminder**: set `CRON_SECRET`, then schedule a weekly call to
  `GET /api/notify/wishlist-reminders` with header `Authorization: Bearer <CRON_SECRET>`
  (e.g. a Vercel Cron job). Without the key/secret these no-op safely.

## 5. Environment variables

Copy `.env.example` → `.env.local` and fill in. For Vercel, add the same vars
under Project → Settings → Environment Variables (set `NEXT_PUBLIC_SITE_URL` to
your production URL).

## 6. Admin access

Edit `src/lib/admins.ts` → `ADMIN_EMAILS` to include the Google account(s) that
should see `/admin`.
