-- Bewertungen je Gericht und Person, dazu ein Speicher für eigene Fotos der Gerichte.

-- Eine Zeile je Gericht und Person: zwei Handys bewerten gleichzeitig, ohne sich zu
-- überschreiben. Zurückgenommen wird mit wert = null (siehe Kopf der ersten Migration:
-- keine Löschungen, damit Realtime nur an den Haushalt meldet).
create table public.bewertungen (
  haushalt_id uuid not null references public.haushalte on delete cascade,
  rezept_id text not null check (char_length(rezept_id) <= 100),
  person text not null check (char_length(person) <= 40),
  wert smallint check (wert between 1 and 3),
  datum date not null,
  aktualisiert_am timestamptz not null default now(),
  primary key (haushalt_id, rezept_id, person)
);

create trigger aktualisiert before update on public.bewertungen
  for each row execute function privat.setze_aktualisiert();

alter table public.bewertungen enable row level security;
create policy bewertungen_haushalt on public.bewertungen for all to authenticated
  using (privat.ist_mitglied(haushalt_id)) with check (privat.ist_mitglied(haushalt_id));
revoke all on public.bewertungen from anon;

alter publication supabase_realtime add table public.bewertungen;

-- Eigene Fotos: privat, höchstens 2 MB, nur JPEG und WebP (die App verkleinert vorher).
-- Der erste Ordner des Pfads ist die Haushalts-Id; daran hängen die Rechte.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', false, 2097152, array['image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create function privat.darf_foto(pfad text) returns boolean
language plpgsql stable security definer set search_path = '' as $$
declare
  ordner text := split_part(pfad, '/', 1);
begin
  if ordner !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return false;
  end if;
  return privat.ist_mitglied(ordner::uuid);
end $$;
revoke execute on function privat.darf_foto(text) from public;
grant execute on function privat.darf_foto(text) to authenticated;

create policy fotos_lesen on storage.objects for select to authenticated
  using (bucket_id = 'fotos' and privat.darf_foto(name));
create policy fotos_hochladen on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and privat.darf_foto(name));
create policy fotos_loeschen on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and privat.darf_foto(name));
