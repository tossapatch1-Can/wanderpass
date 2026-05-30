-- =============================================================
-- Wanderpass — Supabase schema (v2, PRD-aligned passport model)
-- =============================================================
-- HOW TO RUN: Supabase Dashboard → SQL Editor → New query →
-- paste this whole file → Run. Then run seed-countries.sql and
-- storage.sql the same way.
--
-- This replaces the old booking model. It creates the passport tables:
--   countries, trips, trip_photos, wishlist, share_stats, reports
-- and keeps profiles + the handle_new_user trigger (works with Google login).
-- =============================================================

-- ---------- 0. Drop the old booking model ----------
drop view if exists public_passport_stamps;
drop table if exists bookings cascade;
drop table if exists destinations cascade;

-- ---------- 1. profiles (kept) ----------
-- One row per user. Auto-created on signup by the trigger below.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_emoji text default '🧳',
  created_at timestamptz default now()
);

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username, display_name)
  values (
    new.id,
    split_part(new.email, '@', 1),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------- 2. countries (stamp library) ----------
-- Admin-managed catalog. One stamp design per country.
-- Seed via seed-countries.sql.
create table if not exists countries (
  code text primary key,                 -- ISO 3166-1 alpha-2, e.g. 'JP'
  name_th text not null,
  name_en text not null,
  continent text not null,               -- Asia | Europe | Africa | North America | South America | Oceania
  flag_emoji text,
  stamp_svg_url text,                    -- /stamps/<code>.svg (admin can replace)
  created_at timestamptz default now()
);

-- ---------- 3. trips ----------
-- One trip per (user, country) → enforces "1 country = 1 stamp".
-- Re-selecting the same country edits the existing trip (handled in app).
create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  country_code text not null references countries(code) on delete restrict,
  travel_date date,
  comment text check (comment is null or char_length(comment) <= 300),
  is_public boolean not null default false,   -- PRD: private by default
  is_hidden boolean not null default false,   -- admin moderation
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, country_code)
);

create index if not exists trips_user_id_idx on trips(user_id);
create index if not exists trips_public_idx on trips(is_public) where is_public;

-- ---------- 4. trip_photos ----------
-- Real photos uploaded to Storage (bucket 'trip-photos'). Max 10 per trip.
create table if not exists trip_photos (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,  -- denormalized for RLS
  storage_path text not null,
  is_hidden boolean not null default false,   -- admin can hide a single reported photo
  created_at timestamptz default now()
);

create index if not exists trip_photos_trip_id_idx on trip_photos(trip_id);

-- Enforce max 10 photos per country (business rule). Client also checks,
-- but this is the authoritative guard.
create or replace function enforce_photo_limit()
returns trigger as $$
begin
  if (select count(*) from trip_photos where trip_id = new.trip_id) >= 10 then
    raise exception 'photo limit reached (max 10 per country)';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trip_photos_limit on trip_photos;
create trigger trip_photos_limit
  before insert on trip_photos
  for each row execute function enforce_photo_limit();

-- ---------- 5. wishlist ----------
-- Planned trips from the Trip Planner. budget = estimate range (mock data).
create table if not exists wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  destination text not null,
  days int check (days is null or days > 0),
  budget_min_thb int,
  budget_max_thb int,
  ai_itinerary jsonb,                    -- Claude-generated daily plan
  created_at timestamptz default now()
);

create index if not exists wishlist_user_id_idx on wishlist(user_id);

-- ---------- 6. share_stats (marketing metrics) ----------
create table if not exists share_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  trip_id uuid references trips(id) on delete set null,  -- null = whole-passport share
  platform text,                         -- 'ig' | 'fb' | 'tiktok' | 'copy_link' | 'download' | 'native'
  created_at timestamptz default now()
);

-- ---------- 7. reports (moderation queue) ----------
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references trip_photos(id) on delete cascade,
  reporter_id uuid references auth.users(id) on delete set null,
  reason text,
  status text not null default 'open' check (status in ('open', 'hidden', 'dismissed')),
  created_at timestamptz default now()
);

create index if not exists reports_status_idx on reports(status);

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================
alter table profiles enable row level security;
alter table countries enable row level security;
alter table trips enable row level security;
alter table trip_photos enable row level security;
alter table wishlist enable row level security;
alter table share_stats enable row level security;
alter table reports enable row level security;

-- profiles: public read, owner updates own
drop policy if exists "profiles are public" on profiles;
create policy "profiles are public" on profiles for select using (true);
drop policy if exists "users update own profile" on profiles;
create policy "users update own profile" on profiles for update using (auth.uid() = id);

-- countries: public catalog (writes via service-role only)
drop policy if exists "countries are public" on countries;
create policy "countries are public" on countries for select using (true);

-- trips: owner sees all own; everyone sees public & not hidden
drop policy if exists "trips visible to owner or public" on trips;
create policy "trips visible to owner or public" on trips
  for select using (auth.uid() = user_id or (is_public and not is_hidden));
drop policy if exists "users insert own trips" on trips;
create policy "users insert own trips" on trips
  for insert with check (auth.uid() = user_id);
drop policy if exists "users update own trips" on trips;
create policy "users update own trips" on trips
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users delete own trips" on trips;
create policy "users delete own trips" on trips
  for delete using (auth.uid() = user_id);

-- trip_photos: owner sees all own; others see photos of public, non-hidden trips
drop policy if exists "photos visible to owner or public" on trip_photos;
create policy "photos visible to owner or public" on trip_photos
  for select using (
    auth.uid() = user_id
    or (
      not is_hidden
      and exists (
        select 1 from trips t
        where t.id = trip_photos.trip_id and t.is_public and not t.is_hidden
      )
    )
  );
drop policy if exists "users insert own photos" on trip_photos;
create policy "users insert own photos" on trip_photos
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from trips t where t.id = trip_id and t.user_id = auth.uid())
  );
drop policy if exists "users update own photos" on trip_photos;
create policy "users update own photos" on trip_photos
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users delete own photos" on trip_photos;
create policy "users delete own photos" on trip_photos
  for delete using (auth.uid() = user_id);

-- wishlist: fully private to owner
drop policy if exists "users manage own wishlist" on wishlist;
create policy "users manage own wishlist" on wishlist
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- share_stats: owner inserts + reads own (admin aggregates via service-role)
drop policy if exists "users insert own shares" on share_stats;
create policy "users insert own shares" on share_stats
  for insert with check (auth.uid() = user_id);
drop policy if exists "users read own shares" on share_stats;
create policy "users read own shares" on share_stats
  for select using (auth.uid() = user_id);

-- reports: any authenticated user can report; reading/moderating is admin-only
-- (admin uses the service-role key, which bypasses RLS — no SELECT policy needed)
drop policy if exists "users create reports" on reports;
create policy "users create reports" on reports
  for insert with check (auth.uid() = reporter_id);
