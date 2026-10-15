-- Gemeinsamer Stand für einen Haushalt: Rezepte, Pläne, Einkaufshaken.
--
-- Gelöscht wird nie, sondern markiert (geloescht, an = false). Grund: Realtime liefert
-- Löschungen ohne Filter und ohne Zeilenrechte aus; ein Update dagegen nur an die
-- Mitglieder des Haushalts. So bleibt jede Änderung innerhalb des Haushalts.

create schema if not exists privat;
grant usage on schema privat to authenticated;

create table public.haushalte (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  einladungscode text not null unique,
  einstellungen jsonb,
  raster jsonb,
  fruehstueck jsonb,
  katalog jsonb,
  angelegt_am timestamptz not null default now(),
  aktualisiert_am timestamptz not null default now()
);

create table public.mitglieder (
  haushalt_id uuid not null references public.haushalte on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  beigetreten_am timestamptz not null default now(),
  primary key (haushalt_id, user_id)
);
-- Ein Konto gehört zu genau einem Haushalt.
create unique index mitglieder_ein_haushalt on public.mitglieder (user_id);

create table public.rezepte (
  haushalt_id uuid not null references public.haushalte on delete cascade,
  id text not null,
  daten jsonb not null,
  geloescht boolean not null default false,
  aktualisiert_am timestamptz not null default now(),
  primary key (haushalt_id, id)
);

create table public.plaene (
  haushalt_id uuid not null references public.haushalte on delete cascade,
  woche date not null,
  tage jsonb not null,
  aktualisiert_am timestamptz not null default now(),
  primary key (haushalt_id, woche)
);

-- Ein Haken je Zeile: zwei Handys in zwei Läden haken gleichzeitig ab, ohne sich zu überschreiben.
create table public.haken (
  haushalt_id uuid not null references public.haushalte on delete cascade,
  woche date not null,
  art text not null check (art in ('abgehakt', 'vorrat_leer')),
  schluessel text not null check (char_length(schluessel) <= 200),
  an boolean not null,
  aktualisiert_am timestamptz not null default now(),
  primary key (haushalt_id, woche, art, schluessel)
);

create table public.extras (
  haushalt_id uuid not null references public.haushalte on delete cascade,
  id text not null,
  woche date not null,
  text text not null check (char_length(text) <= 200),
  laden text not null check (laden in ('markt', 'aldi', 'edeka')),
  geloescht boolean not null default false,
  aktualisiert_am timestamptz not null default now(),
  primary key (haushalt_id, id)
);

create function privat.setze_aktualisiert() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.aktualisiert_am := now();
  return new;
end $$;

create trigger aktualisiert before update on public.haushalte for each row execute function privat.setze_aktualisiert();
create trigger aktualisiert before update on public.rezepte for each row execute function privat.setze_aktualisiert();
create trigger aktualisiert before update on public.plaene for each row execute function privat.setze_aktualisiert();
create trigger aktualisiert before update on public.haken for each row execute function privat.setze_aktualisiert();
create trigger aktualisiert before update on public.extras for each row execute function privat.setze_aktualisiert();

create function privat.ist_mitglied(h uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.mitglieder m where m.haushalt_id = h and m.user_id = (select auth.uid())
  )
$$;
revoke execute on function privat.ist_mitglied(uuid) from public;
grant execute on function privat.ist_mitglied(uuid) to authenticated;

alter table public.haushalte enable row level security;
alter table public.mitglieder enable row level security;
alter table public.rezepte enable row level security;
alter table public.plaene enable row level security;
alter table public.haken enable row level security;
alter table public.extras enable row level security;

-- Haushalte entstehen und werden betreten nur über die Funktionen unten.
create policy haushalt_lesen on public.haushalte for select to authenticated
  using (privat.ist_mitglied(id));
create policy haushalt_aendern on public.haushalte for update to authenticated
  using (privat.ist_mitglied(id)) with check (privat.ist_mitglied(id));

create policy mitglieder_lesen on public.mitglieder for select to authenticated
  using (privat.ist_mitglied(haushalt_id));

create policy rezepte_haushalt on public.rezepte for all to authenticated
  using (privat.ist_mitglied(haushalt_id)) with check (privat.ist_mitglied(haushalt_id));
create policy plaene_haushalt on public.plaene for all to authenticated
  using (privat.ist_mitglied(haushalt_id)) with check (privat.ist_mitglied(haushalt_id));
create policy haken_haushalt on public.haken for all to authenticated
  using (privat.ist_mitglied(haushalt_id)) with check (privat.ist_mitglied(haushalt_id));
create policy extras_haushalt on public.extras for all to authenticated
  using (privat.ist_mitglied(haushalt_id)) with check (privat.ist_mitglied(haushalt_id));

-- Einladungscode und Haushalts-Id lassen sich nicht umschreiben.
revoke update on public.haushalte from authenticated;
grant update (name, einstellungen, raster, fruehstueck, katalog) on public.haushalte to authenticated;
revoke all on public.haushalte, public.mitglieder, public.rezepte, public.plaene, public.haken, public.extras from anon;

-- Acht Zeichen ohne verwechselbare (0/O, 1/I/L): ~ 8·10¹¹ Möglichkeiten.
create function privat.neuer_code() returns text
language plpgsql set search_path = '' as $$
declare
  zeichen constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code text;
begin
  loop
    code := '';
    for i in 1..8 loop
      code := code || substr(zeichen, 1 + floor(random() * length(zeichen))::int, 1);
    end loop;
    exit when not exists (select 1 from public.haushalte where einladungscode = code);
  end loop;
  return code;
end $$;

create function public.haushalt_anlegen(p_name text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  neu uuid;
begin
  if auth.uid() is null then raise exception 'Nicht angemeldet'; end if;
  if exists (select 1 from public.mitglieder where user_id = auth.uid()) then
    raise exception 'Dieses Konto gehört schon zu einem Haushalt';
  end if;
  insert into public.haushalte (name, einladungscode)
    values (coalesce(nullif(trim(p_name), ''), 'Unser Haushalt'), privat.neuer_code())
    returning id into neu;
  insert into public.mitglieder (haushalt_id, user_id) values (neu, auth.uid());
  return neu;
end $$;

create function public.haushalt_beitreten(p_code text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  ziel uuid;
begin
  if auth.uid() is null then raise exception 'Nicht angemeldet'; end if;
  if exists (select 1 from public.mitglieder where user_id = auth.uid()) then
    raise exception 'Dieses Konto gehört schon zu einem Haushalt';
  end if;
  select id into ziel from public.haushalte
    where einladungscode = upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  if ziel is null then raise exception 'Einladungscode unbekannt'; end if;
  insert into public.mitglieder (haushalt_id, user_id) values (ziel, auth.uid());
  return ziel;
end $$;

-- Wer als Letzter geht, nimmt den Haushalt mit.
create function public.haushalt_verlassen() returns void
language plpgsql security definer set search_path = '' as $$
declare
  h uuid;
begin
  delete from public.mitglieder where user_id = auth.uid() returning haushalt_id into h;
  if h is not null and not exists (select 1 from public.mitglieder where haushalt_id = h) then
    delete from public.haushalte where id = h;
  end if;
end $$;

revoke execute on function public.haushalt_anlegen(text), public.haushalt_beitreten(text),
  public.haushalt_verlassen(), privat.neuer_code(), privat.setze_aktualisiert() from public, anon;
grant execute on function public.haushalt_anlegen(text), public.haushalt_beitreten(text),
  public.haushalt_verlassen() to authenticated;

alter publication supabase_realtime add table
  public.haushalte, public.rezepte, public.plaene, public.haken, public.extras;
