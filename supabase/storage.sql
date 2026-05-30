-- =============================================================
-- Wanderpass — Storage bucket for trip photos
-- =============================================================
-- Run in Supabase → SQL Editor (after schema.sql).
-- Creates a PRIVATE bucket. Photos are uploaded directly from the browser to
-- path  {user_id}/{trip_id}/{uuid}.jpg. Public passport pages read photos via
-- short-lived SIGNED URLs generated server-side (so private trips stay private).
-- =============================================================

-- 1. Bucket: private, 10 MB/object, images only (PRD business rules)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'trip-photos',
  'trip-photos',
  false,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. RLS on storage.objects: a user may only touch files under their own
--    top-level folder ( = their auth uid ).
drop policy if exists "trip photos: owner upload" on storage.objects;
create policy "trip photos: owner upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'trip-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "trip photos: owner read" on storage.objects;
create policy "trip photos: owner read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'trip-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "trip photos: owner delete" on storage.objects;
create policy "trip photos: owner delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'trip-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
