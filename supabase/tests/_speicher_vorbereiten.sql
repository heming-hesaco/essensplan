-- Nur für die Wegwerf-Datenbank aus dem nackten Postgres-Image: Dort fehlen Spalten und
-- Rechte am Speicher, die im echten Supabase die Storage-API anlegt. Gegen das echte
-- Projekt wird diese Datei nie ausgeführt.
alter table storage.buckets
  add column if not exists public boolean default false,
  add column if not exists file_size_limit bigint,
  add column if not exists allowed_mime_types text[];
alter table storage.objects enable row level security;
grant usage on schema storage to authenticated;
grant select, insert, update, delete on storage.objects to authenticated;
